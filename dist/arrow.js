(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.arrow = global.arrow || {})));
}(this, (function (exports) { 'use strict';

//      

// Turn a single value into a pair
function dup     (a   )         {
  return pair(a, a)
}

function pair        (a   , b   )         {
  return [a, b]
}

// swap the contents of a pair
function swap        (ref        )         {
  var a = ref[0];
  var b = ref[1];

  return [b, a]
}

function uncurry           (f                   )                    {
  return function (ref) {
    var a = ref[0];
    var b = ref[1];

    return f(a, b);
  }
}

//      
// Signal Function is a time varying transformation that
// turns Signals of A into Signals of B.  It may carry state
// and evolve over time
                                   
                                           
 

// A Step is the result of applying a SignalFunc
// to an A to get a B and a new SignalFunc
                                   
           
                           
 

// SignalFunc specialized for Time type
// Note: Flow can't infer generics, IOW, it can't info the
// type T *later* based on the Session type provided when running
// a SignalFunc.  Flow needs to be able to determine T at the
// instant a SignalFunc is created, but the type is only known
// later when a Session is used to run the SignalFunc
                                                 

// SignalStep specialized for Time type
// re: Flow, similarly
                                                   

// Simple helper to construct a Step
var step = function (value, next) { return ({ value: value, next: next }); }

var time                    =
  { step: function (value, _) { return ({ value: value, next: time }); } }

// Lift a function into a SignalFunc
function lift        (f             )               {
  return new Lift(f)
}

// Combine a pair of signals into a signal of C
function unsplit           (f                   )                    {
  return lift(uncurry(f))
}

// SignalFunc that runs any signal into a signal whose
// value is always a
// TODO: Give this its own type so it can be composed efficiently
function always     (a   )                 {
  return lift(constant(a))
}

function identity     (a   )    {
  return a
}

function constant     (a   )                 {
  return function (_) { return a; }
}

var Lift = function Lift (f           ) {
  this.f = f
};

Lift.prototype.step = function step$1 (t    , a )               {
  var f = this.f
  return step(f(a), this)
};

// id :: SFTime a a
// Reactive transformation that yields its input at each step
// TODO: Give this its own type so it can be composed efficiently
function id     ()               {
  return lift(identity)
}

// first  :: SFTime a b -> SFTime [a, c] [b, c]
// Apply a SignalFunc to the first signal of a pair
function first           (ab              )                         {
  return new First(ab)
}

// second :: SFTime a b -> SFTime [c, a] [c, b]
function second           (ab              )                         {
  return dimap(swap, swap, first(ab))
}

var First = function First (ab            ) {
  this.ab = ab
};

First.prototype.step = function step$2 (t    , ref      )                         {
    var a = ref[0];
    var c = ref[1];

  var ref$1 = this.ab.step(t, a);
    var b = ref$1.value;
    var next = ref$1.next;
  return step([b, c], first(next))
};

// unfirst  :: c -> Reactive [a, c] [b, c] -> Reactive a b
// unsecond :: c -> Reactive [c, a] [c, b] -> Reactive a b
// Tie a Reactive into a loop that feeds c back into itself
function unfirst           (ab                        , c   )               {
  return new Unfirst(ab, c)
}
// export const unsecond = (arrow, c) => unfirst(dimap(swap, swap, arrow), c)

var Unfirst = function Unfirst (ab                      , c ) {
  this.ab = ab
  this.value = c
};

Unfirst.prototype.step = function step$3 (t    , a )               {
  var ref = this.ab.step(t, [a, this.value]);
    var ref_value = ref.value;
    var b = ref_value[0];
    var c = ref_value[1];
    var next = ref.next;
  return step(b, unfirst(next, c))
};

// pipe :: (SFTime a b ... SFTime y z) -> SFTime a z
// Compose many Reactive transformations, left to right
function pipe        (ab                         )                 {
  var rest = [], len = arguments.length - 1;
  while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

  return rest.reduce(pipe2, ab)
}

// pipe2 :: SFTime a b -> SFTime b c -> SFTime a c
// Compose 2 Reactive transformations left to right
function pipe2           (ab              , bc              )               {
  return new Pipe(ab, bc)
}

function dimap              (fab             , fcd             , bc              )               {
  return pipe2(pipe2(lift(fab), bc), lift(fcd))
}

function lmap           (fab             , bc              )               {
  return pipe2(lift(fab), bc)
}

function rmap           (fbc             , ab              )               {
  return pipe2(ab, lift(fbc))
}

var Pipe = function Pipe (ab            , bc            ) {
  this.ab = ab
  this.bc = bc
};

Pipe.prototype.step = function step$4 (t    , a )               {
  var ref = this.ab.step(t, a);
    var b = ref.value;
    var ab = ref.next;
  var ref$1 = this.bc.step(t, b);
    var c = ref$1.value;
    var bc = ref$1.next;
  return step(c, pipe2(ab, bc))
};

// split :: SFTime a b -> SFTime a c -> SFTime [b, c]
// Duplicates input a and pass it through Reactive transformations
// ab and ac to yield [b, c]
function split           (ab              , ac              )                    {
  return lmap(dup, both(ab, ac))
}

// both :: SFTime a b -> SFTime c d -> Reactive [a, c] [b, d]
// Given an [a, c] input, pass a through Reactive transformation ab and
// c through Reactive transformation cd to yield [b, d]
function both              (ab              , cd              )                         {
  return new Both(ab, cd)
}

var Both = function Both (ab            , cd            ) {
  this.ab = ab
  this.cd = cd
};

Both.prototype.step = function step$5 (t    , ref      )                         {
    var a = ref[0];
    var c = ref[1];

  var ref$1 = this.ab.step(t, a);
    var b = ref$1.value;
    var anext = ref$1.next;
  var ref$2 = this.cd.step(t, c);
    var d = ref$2.value;
    var cnext = ref$2.next;
  return step([b, d], both(anext, cnext))
};

//      
                                                      
// An event, which has a value when it occurs, and
// has no value when it doesn't occur
                             

// Event non-occurrence
var NoEvent = undefined

// Turn Events of A instead Events of B
function map        (f             )                        {
  return function (a) { return a === undefined ? a : f(a); }
}

// Return the Event that occurred, preferring a1 if both occurred
function mergeE     (a1        , a2        )         {
  return a1 === undefined ? a2 : a1
}

// Internal helper to allow continuous value transformations to be
// applied when an event occurs
// TODO: Consider exposing this if it seems useful
function liftE        (ab              )                         {
  return new LiftE(ab)
}

var LiftE = function LiftE (ab) {
  this.ab = ab
};

LiftE.prototype.step = function step (t    , a      )                         {
  if (a === undefined) {
    return { value: NoEvent, next: this }
  }
  var ref = this.ab.step(t, a);
    var value = ref.value;
    var next = ref.next;
  return { value: value, next: liftE(next) }
};

// Sample the current time when an event occurs
var eventTime                              = {
  step: function step (t      , a     )                                {
    return { value: a === undefined ? NoEvent : t, next: this }
  }
}

// Transform event values
function mapE        (f             )                         {
  return lift(map(f))
}

// When an event occurs, make its value b
function as        (b   )                         {
  return mapE(function (_) { return b; })
}

// When A occurs, sample the value of B, and produce f(a, b)
// When A does not occur, produce NoEvent
function sampleWith           (f                   )                              {
  return lift(function (ref) {
    var a = ref[0];
    var b = ref[1];

    return a === undefined ? NoEvent : f(a, b);
  })
}

function sample        ()                                   {
  return sampleWith(pair)
}

// Merge events, preferring the left in the case of
// simultaneous occurrence
function merge     ()                                   {
  return unsplit(mergeE)
}

// Merge event SignalFuncs
function or        (left                        , right                        )                         {
  return liftE(pipe(both(left, right), merge()))
}

// Turn an event into a stepped continuous value
function hold     (initial   )                    {
  return new Hold(initial)
}

var Hold = function Hold (value ) {
  this.value = value
};

Hold.prototype.step = function step (t    , a )                    {
  return a === undefined
    ? { value: this.value, next: this }
    : { value: a, next: hold(a) }
};

// Accumulate event
function scanE        (f                   , initial   )                         {
  return new Accum(f, initial)
}

// Accumulate event to a continuous value
function scan        (f                   , initial   )                    {
  return pipe(scanE(f, initial), hold(initial))
}

// Accumulate event, given an initial value and a update-function event
function accumE     (initial   )                                   {
  return scanE(function (a, f) { return f(a); }, initial)
}

// Accumulate event to a continuous value, given an initial value and a update-function event
function accum     (initial   )                              {
  return pipe(accumE(initial), hold(initial))
}

var Accum = function Accum (f                 , value ) {
  this.f = f
  this.value = value
};

Accum.prototype.step = function step (t    , a )                    {
  if (a === undefined) {
    return { value: NoEvent, next: this }
  }
  var f = this.f
  var value = f(this.value, a)
  return { value: value, next: new Accum(f, value) }
};

//      
                                  
// Dispose an Input
                                    

// Handle input events
                                          

// An Input allows events to be pushed into the system
// It's basically any unary higher order function
                                                                

                                     

// Turn a pair of inputs into an input of pairs
function both$1       (input1          , input2          )                          {
  return function (f) {
    var dispose1 = input1(function (a1) { return f([a1, NoEvent]); })
    var dispose2 = input2(function (a2) { return f([NoEvent, a2]); })
    return function () { return [dispose1(), dispose2()]; }
  }
}

var never             = function () { return noop; }
var noop = function () {}

function newInput     ()                       {
  var _occur
  var occur = function (x) {
    if (typeof _occur === 'function') {
      _occur(x)
    }
  }

  var input = function (f) {
    _occur = f
    return function () {
      _occur = undefined
    }
  }

  return [occur, input]
}

//      
                                                  
                                          
                                        

function loop           (session            , input          , sf                                 )               {
  var dispose = input(function (a) {
    var ref = session.step();
    var sample = ref.sample;
    var nextSession = ref.nextSession;
    var ref$1 = sf.step(sample, a);
    var ref$1_value = ref$1.value;
    var _ = ref$1_value[0];
    var nextInput = ref$1_value[1];
    var next = ref$1.next; // eslint-disable-line no-unused-vars
    dispose = switchInput(nextSession, nextInput, next, dispose)
  })

  return dispose
}

var switchInput = function (session, input, sf, dispose) {
  dispose()
  return loop(session, input, sf)
}

//      

// A session provides a sample of state that will be fed into
// a signal function when events occur
                          
                            
 

                                                                   

function newSession     (step             , init   )             {
  return new SteppedSession(step, init)
}

// Session that yields an incrementing count at each step
var countSession = function ()                  { return newSession(function (n) { return n + 1; }, 0); }

var SteppedSession = function SteppedSession (step           , value ) {
  this._step = step
  this.value = value
};

SteppedSession.prototype.step = function step ()               {
  var sample = this._step(this.value)
  return { sample: sample, nextSession: newSession(this._step, sample) }
};

// Session that yields a time delta from its start time at each step
var clockSession = function ()                  { return new ClockSession(Date.now()); }

var ClockSession = function ClockSession (start      ) {
  this.start = start
  this.time = Infinity
};

ClockSession.prototype.step = function step ()                    {
  var t = Date.now()
  if (t < this.time) {
    this.time = t - this.start
  }
  return { sample: this.time, nextSession: new ClockSession(this.start) }
};

exports.bothI = both$1;
exports.never = never;
exports.newInput = newInput;
exports.clockSession = clockSession;
exports.countSession = countSession;
exports.time = time;
exports.lift = lift;
exports.unsplit = unsplit;
exports.always = always;
exports.id = id;
exports.first = first;
exports.second = second;
exports.unfirst = unfirst;
exports.pipe = pipe;
exports.pipe2 = pipe2;
exports.dimap = dimap;
exports.lmap = lmap;
exports.rmap = rmap;
exports.split = split;
exports.both = both;
exports.NoEvent = NoEvent;
exports.eventTime = eventTime;
exports.mapE = mapE;
exports.as = as;
exports.sampleWith = sampleWith;
exports.sample = sample;
exports.merge = merge;
exports.or = or;
exports.hold = hold;
exports.scanE = scanE;
exports.scan = scan;
exports.accumE = accumE;
exports.accum = accum;
exports.loop = loop;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=arrow.js.map
