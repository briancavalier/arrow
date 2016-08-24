(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.arrow = global.arrow || {})));
}(this, (function (exports) { 'use strict';

//      

function dup     (a   )         {
  return [a, a]
}

function swap        (ref        )         {
  var a = ref[0];
  var b = ref[1];

  return [b, a]
}

//      

var NoEvent = undefined

// An event, which has a value when it occurs, and
// has no value when it doesn't occur
                       

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

// An Event is either a value or NoEvent, indicating that
// the Event did not occur
// type Event a = a | NoEvent

// A Reactive transformation turns as into bs, and may carry
// state or evolve over time
// type Reactive t a b = { step :: t -> a -> Step t a b }

// A Step is the result of applying a Reactive transformation
// to an a to get a b and a new Reactive transformation
// type Step t a b = { value :: b, next :: Reactive t a b }

// step :: b -> Reactive t a b -> Step t a b
// Simple helper to construct a Step
var step = function (value, next) { return ({ value: value, next: next }); }

var noEvent = function (next) { return step(NoEvent, next); }

// lift :: (a -> b) -> Reactive t a b
// Lift a function into a Reactive transform
var lift = function (f) { return new Lift(f); }

var unsplit = function (f) { return lift(function (ref) {
  var a = ref[0];
  var b = ref[1];

  return f(a, b);
  }); }

// always :: a -> Reactive t a a
// Reactive transformation that turns everything into a
var always = function (a) { return lift(function () { return a; }); }

var Lift = function Lift (f) {
  this.f = f
};

Lift.prototype.step = function step$2 (t, a) {
  return a === NoEvent
    ? noEvent(this)
    : step(this.f(a), this)
};

var or = function (left, right) { return new Choice(left, right); }

var Choice = function Choice (left, right) {
  this.left = left
  this.right = right
};

Choice.prototype.step = function step$3 (t, a) {
  var ref = this.left.step(t, a);
    var bl = ref.value;
    var nl = ref.next;
  var ref$1 = this.right.step(t, a);
    var br = ref$1.value;
    var nr = ref$1.next;
  return step(bl !== NoEvent ? bl : br, or(nl, nr))
};

var filter = function (p) { return lift(function (a) { return p(a) ? a : NoEvent; }); }

// when :: Reactive t a boolean -> Reactive t a a
// Reactive transformation that yields its input when
// a predicate Reactive transform is true, and NoEvent
// when false
var when = function (p) { return new When(p); }

var When = function When (p) {
  this.p = p
};

When.prototype.step = function step$4 (t, a) {
  var ref = this.p.step(t, a);
    var value = ref.value;
    var next = ref.next;
  return step(value ? a : NoEvent, when(next))
};

// first  :: Reactive t a b -> Reactive t [a, c] [b, c]
// second :: Reactive t a b -> Reactive t [c, a] [c, b]
// Apply a Reactive transform to the first element of a pair
var first = function (arrow) { return new First(arrow); }
var second = function (arrow) { return first(dimap(swap, swap, arrow)); }

var First = function First (arrow) {
  this.arrow = arrow
};

First.prototype.step = function step$5 (t, a) {
  return a === NoEvent ? NoEvent : stepFirst(this.arrow, t, a)
};

var stepFirst = function (arrow, t, ref) {
  var a = ref[0];
  var c = ref[1];

  var ref$1 = arrow.step(t, a);
  var b = ref$1.value;
  var next = ref$1.next;
  return step([b, c], first(next))
}

// unfirst  :: c -> Reactive [a, c] [b, c] -> Reactive a b
// unsecond :: c -> Reactive [c, a] [c, b] -> Reactive a b
// Tie a Reactive into a loop that feeds c back into itself

var unfirst = function (arrow, c) { return new Unfirst(arrow, c); }
var unsecond = function (arrow, c) { return unfirst(dimap(swap, swap, arrow), c); }

var Unfirst = function Unfirst (arrow, c) {
  this.arrow = arrow
  this.value = c
};

Unfirst.prototype.step = function step$6 (t, a) {
  return a === NoEvent
    ? noEvent(this)
    : stepUnfirst(this.arrow, t, a, this.value)
};

var stepUnfirst = function (arrow, t, a, c1) {
  var ref = arrow.step(t, [a, c1]);
  var ref_value = ref.value;
  var b = ref_value[0];
  var c2 = ref_value[1];
  var next = ref.next;
  return step(b, unfirst(next, c2))
}

var accum = function (a) { return unfirst(lift(stepAccum), a); }
var stepAccum = function (ref) {
  var f = ref[0];
  var a = ref[1];

  return dup(f(a));
}

var scanl = function (f, b) { return unfirst(lift(function (ref) {
  var a = ref[0];
  var b = ref[1];

  return dup(f(b, a));
  }), b); }

// pipe :: (Reactive t a b ... Reactive t y z) -> Reactive t a z
// Compose many Reactive transformations, left to right
var pipe = function (ab) {
  var rest = [], len = arguments.length - 1;
  while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

  return rest.reduce(pipe2, ab);
}

// pipe2 :: Reactive t a b -> Reactive t b c -> Reactive t a c
// Compose 2 Reactive transformations left to right
var pipe2 = function (ab, bc) { return new Pipe(ab, bc); }

var dimap = function (ab, cd, bc) { return pipe(lift(ab), bc, lift(cd)); }
var lmap = function (ab, bc) { return pipe2(lift(ab), bc); }
var rmap = function (bc, ab) { return pipe2(ab, lift(bc)); }

var Pipe = function Pipe (ab, bc) {
  this.ab = ab
  this.bc = bc
};

Pipe.prototype.step = function step$7 (t, a) {
  var ref = this.ab.step(t, a);
    var b = ref.value;
    var ab = ref.next;
  var ref$1 = this.bc.step(t, b);
    var c = ref$1.value;
    var bc = ref$1.next;
  return step(c, pipe(ab, bc))
};

// split :: Reactive t a b -> Reactive t a c -> Reactive t [b, c]
// Duplicates input a and pass it through Reactive transformations
// ab and ac to yield [b, c]
var split = function (ab, ac) { return new Split(ab, ac); }

var Split = function Split (ab, ac) {
  this.ab = ab
  this.ac = ac
};

Split.prototype.step = function step$8 (t, a) {
  var ref = this.ab.step(t, a);
    var b = ref.value;
    var ab = ref.next;
  var ref$1 = this.ac.step(t, a);
    var c = ref$1.value;
    var ac = ref$1.next;
  return step([b, c], split(ab, ac))
};

// both :: Reactive t a b -> Reactive t c d -> Reactive [a, b] [c, d]
// Given an [a, c] input, pass a through Reactive transformation ab and
// c through Reactive transformation cd to yield [b, d]
var both = function (ab, cd) { return new Both(ab, cd); }

var Both = function Both (ab, cd) {
  this.ab = ab
  this.cd = cd
};

Both.prototype.step = function step$9 (t, ac) {
  console.log('BOTH', ac)
  return ac === NoEvent
    ? stepBoth(this.ab, this.cd, t, NoEvent, NoEvent)
    : stepBoth(this.ab, this.cd, t, ac[0], ac[1])
};

var stepBoth = function (ab, cd, t, a, c) {
  var ref = ab.step(t, a);
  var b = ref.value;
  var anext = ref.next;
  var ref$1 = cd.step(t, c);
  var d = ref$1.value;
  var cnext = ref$1.next;
  return step([b, d], both(anext, cnext))
}

var hold = function (ab, b) { return new Hold(ab, b); }

var Hold = function Hold (ab, b) {
  this.ab = ab
  this.b = b
};

Hold.prototype.step = function step$10 (t, a) {
  if (a === NoEvent) {
    return step(this.b, this)
  }
  var ref = this.ab.step(t, a);
    var b = ref.value;
    var next = ref.next;
  return step(b, hold(next, b))
};

//      
                                                       
                                        

                                 
                                             
 

                                     
           
                         
 

function run           (
  r                        ,
  input          ,
  session            ,
  handleOutput               
)               {
  return input(function (a) {
    var ref = session.step();
    var sample = ref.sample;
    var nextSession = ref.nextSession;
    session = nextSession

    var ref$1 = r.step(sample, a);
    var value = ref$1.value;
    var next = ref$1.next;
    r = next

    return handleOutput(value)
  })
}

exports.lift = lift;
exports.pipe = pipe;
exports.split = split;
exports.unsplit = unsplit;
exports.both = both;
exports.or = or;
exports.always = always;
exports.filter = filter;
exports.when = when;
exports.first = first;
exports.second = second;
exports.unfirst = unfirst;
exports.unsecond = unsecond;
exports.dimap = dimap;
exports.lmap = lmap;
exports.rmap = rmap;
exports.accum = accum;
exports.scanl = scanl;
exports.hold = hold;
exports.bothI = both$1;
exports.run = run;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=arrow.js.map
