(function () {
'use strict';

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

var Lift = function Lift (f           ) {
  this.f = f
};

Lift.prototype.step = function step$1 (t    , a )               {
  var f = this.f
  return step(f(a), this)
};

// first  :: SFTime a b -> SFTime [a, c] [b, c]
// Apply a SignalFunc to the first signal of a pair
function first           (ab              )                         {
  return new First(ab)
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
function mapE        (f             )                        {
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
function map        (f             )                         {
  return lift(mapE(f))
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
function and       (input1          , input2          )                          {
  return function (f) {
    var dispose1 = input1(function (a1) { return f([a1, NoEvent]); })
    var dispose2 = input2(function (a2) { return f([NoEvent, a2]); })
    return function () { return [dispose1(), dispose2()]; }
  }
}

var never             = function () { return noop; }
var noop = function () {}

function newInput     ()                       {
  var _occur = noop
  var occur = function (x) { return _occur(x); }

  var input = function (f) {
    _occur = f
    return function () {
      _occur = noop
    }
  }

  return [occur, input]
}

// Session that yields a time delta from its start time at each step
var clockSession = function ()                  { return new ClockSession(Date.now()); }

var ClockSession = function ClockSession (start      ) {
  this.start = start
};

ClockSession.prototype.step = function step ()                    {
  return { sample: Date.now() - this.start, nextSession: new ClockSession(this.start) }
};

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

var animationFrame = function (f) {
  var handle = requestAnimationFrame(f)
  return function () { return cancelAnimationFrame(handle); }
}

function interopDefault(ex) {
	return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var eventlisteners = createCommonjsModule(function (module) {
function invokeHandler(handler, vnode, event) {
  if (typeof handler === "function") {
    // call function handler
    handler.call(vnode, event, vnode);
  } else if (typeof handler === "object") {
    // call handler with arguments
    if (typeof handler[0] === "function") {
      // special case for single argument for performance
      if (handler.length === 2) {
        handler[0].call(vnode, handler[1], event, vnode);
      } else {
        var args = handler.slice(1);
        args.push(event);
        args.push(vnode);
        handler[0].apply(vnode, args);
      }
    } else {
      // call multiple handlers
      for (var i = 0; i < handler.length; i++) {
        invokeHandler(handler[i]);
      }
    }
  }
}

function handleEvent(event, vnode) {
  var name = event.type,
      on = vnode.data.on;

  // call event handler(s) if exists
  if (on && on[name]) {
    invokeHandler(on[name], vnode, event);
  }
}

function createListener() {
  return function handler(event) {
    handleEvent(event, handler.vnode);
  }
}

function updateEventListeners(oldVnode, vnode) {
  var oldOn = oldVnode.data.on,
      oldListener = oldVnode.listener,
      oldElm = oldVnode.elm,
      on = vnode && vnode.data.on,
      elm = vnode && vnode.elm,
      name;

  // optimization for reused immutable handlers
  if (oldOn === on) {
    return;
  }

  // remove existing listeners which no longer used
  if (oldOn && oldListener) {
    // if element changed or deleted we remove all existing listeners unconditionally
    if (!on) {
      for (name in oldOn) {
        // remove listener if element was changed or existing listeners removed
        oldElm.removeEventListener(name, oldListener, false);
      }
    } else {
      for (name in oldOn) {
        // remove listener if existing listener removed
        if (!on[name]) {
          oldElm.removeEventListener(name, oldListener, false);
        }
      }
    }
  }

  // add new listeners which has not already attached
  if (on) {
    // reuse existing listener or create new
    var listener = vnode.listener = oldVnode.listener || createListener();
    // update vnode for listener
    listener.vnode = vnode;

    // if element changed or added we add all needed listeners unconditionally
    if (!oldOn) {
      for (name in on) {
        // add listener if element was changed or new listeners added
        elm.addEventListener(name, listener, false);
      }
    } else {
      for (name in on) {
        // add listener if new listener added
        if (!oldOn[name]) {
          elm.addEventListener(name, listener, false);
        }
      }
    }
  }
}

module.exports = {
  create: updateEventListeners,
  update: updateEventListeners,
  destroy: updateEventListeners
};
});

var events = interopDefault(eventlisteners);

var attributes = createCommonjsModule(function (module) {
var booleanAttrs = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "compact", "controls", "declare",
                "default", "defaultchecked", "defaultmuted", "defaultselected", "defer", "disabled", "draggable",
                "enabled", "formnovalidate", "hidden", "indeterminate", "inert", "ismap", "itemscope", "loop", "multiple",
                "muted", "nohref", "noresize", "noshade", "novalidate", "nowrap", "open", "pauseonexit", "readonly",
                "required", "reversed", "scoped", "seamless", "selected", "sortable", "spellcheck", "translate",
                "truespeed", "typemustmatch", "visible"];

var booleanAttrsDict = {};
for(var i=0, len = booleanAttrs.length; i < len; i++) {
  booleanAttrsDict[booleanAttrs[i]] = true;
}

function updateAttrs(oldVnode, vnode) {
  var key, cur, old, elm = vnode.elm,
      oldAttrs = oldVnode.data.attrs, attrs = vnode.data.attrs;

  if (!oldAttrs && !attrs) return;
  oldAttrs = oldAttrs || {};
  attrs = attrs || {};

  // update modified attributes, add new attributes
  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      // TODO: add support to namespaced attributes (setAttributeNS)
      if(!cur && booleanAttrsDict[key])
        elm.removeAttribute(key);
      else
        elm.setAttribute(key, cur);
    }
  }
  //remove removed attributes
  // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
  // the other option is to remove all attributes with value == undefined
  for (key in oldAttrs) {
    if (!(key in attrs)) {
      elm.removeAttribute(key);
    }
  }
}

module.exports = {create: updateAttrs, update: updateAttrs};
});

var attrs = interopDefault(attributes);

var props = createCommonjsModule(function (module) {
function updateProps(oldVnode, vnode) {
  var key, cur, old, elm = vnode.elm,
      oldProps = oldVnode.data.props, props = vnode.data.props;

  if (!oldProps && !props) return;
  oldProps = oldProps || {};
  props = props || {};

  for (key in oldProps) {
    if (!props[key]) {
      delete elm[key];
    }
  }
  for (key in props) {
    cur = props[key];
    old = oldProps[key];
    if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
      elm[key] = cur;
    }
  }
}

module.exports = {create: updateProps, update: updateProps};
});

interopDefault(props);

var _class = createCommonjsModule(function (module) {
function updateClass(oldVnode, vnode) {
  var cur, name, elm = vnode.elm,
      oldClass = oldVnode.data.class,
      klass = vnode.data.class;

  if (!oldClass && !klass) return;
  oldClass = oldClass || {};
  klass = klass || {};

  for (name in oldClass) {
    if (!klass[name]) {
      elm.classList.remove(name);
    }
  }
  for (name in klass) {
    cur = klass[name];
    if (cur !== oldClass[name]) {
      elm.classList[cur ? 'add' : 'remove'](name);
    }
  }
}

module.exports = {create: updateClass, update: updateClass};
});

var clss = interopDefault(_class);

var vnode = createCommonjsModule(function (module) {
module.exports = function(sel, data, children, text, elm) {
  var key = data === undefined ? undefined : data.key;
  return {sel: sel, data: data, children: children,
          text: text, elm: elm, key: key};
};
});

var vnode$1 = interopDefault(vnode);


var require$$1 = Object.freeze({
  default: vnode$1
});

var is = createCommonjsModule(function (module) {
module.exports = {
  array: Array.isArray,
  primitive: function(s) { return typeof s === 'string' || typeof s === 'number'; },
};
});

var is$1 = interopDefault(is);
var array = is.array;
var primitive = is.primitive;

var require$$0 = Object.freeze({
  default: is$1,
  array: array,
  primitive: primitive
});

var htmldomapi = createCommonjsModule(function (module) {
function createElement(tagName){
  return document.createElement(tagName);
}

function createElementNS(namespaceURI, qualifiedName){
  return document.createElementNS(namespaceURI, qualifiedName);
}

function createTextNode(text){
  return document.createTextNode(text);
}


function insertBefore(parentNode, newNode, referenceNode){
  parentNode.insertBefore(newNode, referenceNode);
}


function removeChild(node, child){
  node.removeChild(child);
}

function appendChild(node, child){
  node.appendChild(child);
}

function parentNode(node){
  return node.parentElement;
}

function nextSibling(node){
  return node.nextSibling;
}

function tagName(node){
  return node.tagName;
}

function setTextContent(node, text){
  node.textContent = text;
}

module.exports = {
  createElement: createElement,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  appendChild: appendChild,
  removeChild: removeChild,
  insertBefore: insertBefore,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent
};
});

var htmldomapi$1 = interopDefault(htmldomapi);
var createElement = htmldomapi.createElement;
var createElementNS = htmldomapi.createElementNS;
var createTextNode = htmldomapi.createTextNode;
var appendChild = htmldomapi.appendChild;
var removeChild = htmldomapi.removeChild;
var insertBefore = htmldomapi.insertBefore;
var parentNode = htmldomapi.parentNode;
var nextSibling = htmldomapi.nextSibling;
var tagName = htmldomapi.tagName;
var setTextContent = htmldomapi.setTextContent;

var require$$0$1 = Object.freeze({
  default: htmldomapi$1,
  createElement: createElement,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  appendChild: appendChild,
  removeChild: removeChild,
  insertBefore: insertBefore,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent
});

var snabbdom = createCommonjsModule(function (module) {
// jshint newcap: false
/* global require, module, document, Node */
'use strict';

var VNode = interopDefault(require$$1);
var is = interopDefault(require$$0);
var domApi = interopDefault(require$$0$1);

function isUndef(s) { return s === undefined; }
function isDef(s) { return s !== undefined; }

var emptyNode = VNode('', {}, [], undefined, undefined);

function sameVnode(vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  var i, map = {}, key;
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) map[key] = i;
  }
  return map;
}

var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

function init(modules, api) {
  var i, j, cbs = {};

  if (isUndef(api)) api = domApi;

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks[i]] !== undefined) cbs[hooks[i]].push(modules[j][hooks[i]]);
    }
  }

  function emptyNodeAt(elm) {
    var id = elm.id ? '#' + elm.id : '';
    var c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
    return VNode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
  }

  function createRmCb(childElm, listeners) {
    return function() {
      if (--listeners === 0) {
        var parent = api.parentNode(childElm);
        api.removeChild(parent, childElm);
      }
    };
  }

  function createElm(vnode, insertedVnodeQueue) {
    var i, data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) {
        i(vnode);
        data = vnode.data;
      }
    }
    var elm, children = vnode.children, sel = vnode.sel;
    if (isDef(sel)) {
      // Parse selector
      var hashIdx = sel.indexOf('#');
      var dotIdx = sel.indexOf('.', hashIdx);
      var hash = hashIdx > 0 ? hashIdx : sel.length;
      var dot = dotIdx > 0 ? dotIdx : sel.length;
      var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
      elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag)
                                                          : api.createElement(tag);
      if (hash < dot) elm.id = sel.slice(hash + 1, dot);
      if (dotIdx > 0) elm.className = sel.slice(dot + 1).replace(/\./g, ' ');
      if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
          api.appendChild(elm, createElm(children[i], insertedVnodeQueue));
        }
      } else if (is.primitive(vnode.text)) {
        api.appendChild(elm, api.createTextNode(vnode.text));
      }
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode);
      i = vnode.data.hook; // Reuse variable
      if (isDef(i)) {
        if (i.create) i.create(emptyNode, vnode);
        if (i.insert) insertedVnodeQueue.push(vnode);
      }
    } else {
      elm = vnode.elm = api.createTextNode(vnode.text);
    }
    return vnode.elm;
  }

  function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      api.insertBefore(parentElm, createElm(vnodes[startIdx], insertedVnodeQueue), before);
    }
  }

  function invokeDestroyHook(vnode) {
    var i, j, data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);
      for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode);
      if (isDef(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }
  }

  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var i, listeners, rm, ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.sel)) {
          invokeDestroyHook(ch);
          listeners = cbs.remove.length + 1;
          rm = createRmCb(ch.elm, listeners);
          for (i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm);
          if (isDef(i = ch.data) && isDef(i = i.hook) && isDef(i = i.remove)) {
            i(ch, rm);
          } else {
            rm();
          }
        } else { // Text node
          api.removeChild(parentElm, ch.elm);
        }
      }
    }
  }

  function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
    var oldStartIdx = 0, newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, elmToMove, before;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        idxInOld = oldKeyToIdx[newStartVnode.key];
        if (isUndef(idxInOld)) { // New element
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          elmToMove = oldCh[idxInOld];
          patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
          oldCh[idxInOld] = undefined;
          api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      before = isUndef(newCh[newEndIdx+1]) ? null : newCh[newEndIdx+1].elm;
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
    var i, hook;
    if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
      i(oldVnode, vnode);
    }
    var elm = vnode.elm = oldVnode.elm, oldCh = oldVnode.children, ch = vnode.children;
    if (oldVnode === vnode) return;
    if (!sameVnode(oldVnode, vnode)) {
      var parentElm = api.parentNode(oldVnode.elm);
      elm = createElm(vnode, insertedVnodeQueue);
      api.insertBefore(parentElm, elm, oldVnode.elm);
      removeVnodes(parentElm, [oldVnode], 0, 0);
      return;
    }
    if (isDef(vnode.data)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
      i = vnode.data.hook;
      if (isDef(i) && isDef(i = i.update)) i(oldVnode, vnode);
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue);
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) api.setTextContent(elm, '');
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        api.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      api.setTextContent(elm, vnode.text);
    }
    if (isDef(hook) && isDef(i = hook.postpatch)) {
      i(oldVnode, vnode);
    }
  }

  return function(oldVnode, vnode) {
    var i, elm, parent;
    var insertedVnodeQueue = [];
    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]();

    if (isUndef(oldVnode.sel)) {
      oldVnode = emptyNodeAt(oldVnode);
    }

    if (sameVnode(oldVnode, vnode)) {
      patchVnode(oldVnode, vnode, insertedVnodeQueue);
    } else {
      elm = oldVnode.elm;
      parent = api.parentNode(elm);

      createElm(vnode, insertedVnodeQueue);

      if (parent !== null) {
        api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
        removeVnodes(parent, [oldVnode], 0, 0);
      }
    }

    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
    }
    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]();
    return vnode;
  };
}

module.exports = {init: init};
});

var snabbdom$1 = interopDefault(snabbdom);

var h = createCommonjsModule(function (module) {
var VNode = interopDefault(require$$1);
var is = interopDefault(require$$0);

function addNS(data, children, sel) {
  data.ns = 'http://www.w3.org/2000/svg';

  if (sel !== 'foreignObject' && children !== undefined) {
    for (var i = 0; i < children.length; ++i) {
      addNS(children[i].data, children[i].children, children[i].sel);
    }
  }
}

module.exports = function h(sel, b, c) {
  var data = {}, children, text, i;
  if (c !== undefined) {
    data = b;
    if (is.array(c)) { children = c; }
    else if (is.primitive(c)) { text = c; }
  } else if (b !== undefined) {
    if (is.array(b)) { children = b; }
    else if (is.primitive(b)) { text = b; }
    else { data = b; }
  }
  if (is.array(children)) {
    for (i = 0; i < children.length; ++i) {
      if (is.primitive(children[i])) children[i] = VNode(undefined, undefined, undefined, children[i]);
    }
  }
  if (sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g') {
    addNS(data, children, sel);
  }
  return VNode(sel, data, children, text, undefined);
};
});

var sh = interopDefault(h);

var index = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var isValidString = function isValidString(param) {
  return typeof param === 'string' && param.length > 0;
};

var startsWith = function startsWith(string, start) {
  return string[0] === start;
};

var isSelector = function isSelector(param) {
  return isValidString(param) && (startsWith(param, '.') || startsWith(param, '#'));
};

var node = function node(h) {
  return function (tagName) {
    return function (first) {
      var arguments$1 = arguments;

      for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        rest[_key - 1] = arguments$1[_key];
      }

      if (isSelector(first)) {
        return h.apply(undefined, [tagName + first].concat(rest));
      } else if (typeof first === 'undefined') {
        return h(tagName);
      } else {
        return h.apply(undefined, [tagName, first].concat(rest));
      }
    };
  };
};

var TAG_NAMES = ['a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'b', 'base', 'basefont', 'bdi', 'bdo', 'bgsound', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'command', 'content', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'image', 'img', 'input', 'ins', 'isindex', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'listing', 'main', 'map', 'mark', 'marquee', 'math', 'menu', 'menuitem', 'meta', 'meter', 'multicol', 'nav', 'nextid', 'nobr', 'noembed', 'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'plaintext', 'pre', 'progress', 'q', 'rb', 'rbc', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'script', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'svg', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr', 'xmp'];

exports['default'] = function (h) {
  var createTag = node(h);
  var exported = { TAG_NAMES: TAG_NAMES, isSelector: isSelector, createTag: createTag };
  TAG_NAMES.forEach(function (n) {
    exported[n] = createTag(n);
  });
  return exported;
};

module.exports = exports['default'];
});

var hh = interopDefault(index);

//      
                                          
                                    
var init = function (modules) {
  if ( modules === void 0 ) modules = [];

  return snabbdom$1.init(modules);
}

var html = hh(sh)

                                                                      

function vdomPatch               (patch                   , init       )                                                      {
  return first(scan(patch, init))
}

var div = html.div;
var span = html.span;
var ol = html.ol;
var li = html.li;
var button = html.button;

// TODO: combining many inputs and signals. Need a better way
var anyInput = function () {
  var inputs = [], len = arguments.length;
  while ( len-- ) inputs[ len ] = arguments[ len ];

  return inputs.reduce(and);
}
var anySignal = function () {
  var signals = [], len = arguments.length;
  while ( len-- ) signals[ len ] = arguments[ len ];

  return signals.reduce(or);
}

var container = document.getElementById('app')
var patch = init([events, attrs, clss])

var ref = newInput();
var start = ref[0];
var startInput = ref[1];
var ref$1 = newInput();
var stop = ref$1[0];
var stopInput = ref$1[1];
var ref$2 = newInput();
var reset = ref$2[0];
var resetInput = ref$2[1];
var ref$3 = newInput();
var lap = ref$3[0];
var lapInput = ref$3[1];

var timerInputs = anyInput(startInput, stopInput, resetInput, lapInput)
var stoppedInputs = anyInput(timerInputs, never)
var runningInputs = anyInput(timerInputs, animationFrame)

// Render timer using current time
// Returns [inputs, vtree]
var render = function (timer, time) {
  var elapsed = timerElapsed(time, timer)
  var zero = elapsed === 0
  var vtree = div('.timer', { class: { running: timer.running, zero: zero } }, [
    div('.elapsed', renderDuration(elapsed)),
    div('.lap-elapsed', renderDuration(timerCurrentLap(time, timer))),
    button('.reset', { on: { click: reset }, attrs: { disabled: timer.running || zero } }, 'Reset'),
    button('.start', { on: { click: start } }, 'Start'),
    button('.stop', { on: { click: stop } }, 'Stop'),
    button('.lap', { on: { click: lap }, attrs: { disabled: !timer.running } }, 'Lap'),
    ol('.laps', { attrs: { reversed: true } }, timer.laps.map(function (ref) {
        var start = ref.start;
        var end = ref.end;

        return li(renderDuration(end - start));
  })
    )
  ])

  return [vtree, timer.running ? runningInputs : stoppedInputs]
}

// Timer formatting
var renderDuration = function (ms) { return [
  span('.minutes', ("" + (mins(ms)))),
  span('.seconds', ("" + (secs(ms)))),
  span('.hundredths', ("" + (hundredths(ms))))
]; }

var mins = function (ms) { return pad((ms / (1000 * 60)) % 60); }
var secs = function (ms) { return pad((ms / 1000) % 60); }
var hundredths = function (ms) { return pad((ms / 10) % 100); }
var pad = function (n) { return n < 10 ? ("0" + (Math.floor(n))) : ("" + (Math.floor(n))); }

// Timer functions
var timerZero = ({ running: false, origin: 0, total: 0, laps: [] })
var timerReset = function (time) { return function (_) { return ({ running: false, origin: time, total: 0, laps: [] }); }; }

var timerStart = function (time) { return function (ref) {
    var total = ref.total;
    var laps = ref.laps;

    return ({ running: true, origin: time, total: total, laps: laps });
; }  }
var timerStop = function (time) { return function (ref) {
    var origin = ref.origin;
    var total = ref.total;
    var laps = ref.laps;

    return ({ running: false, origin: time, total: timerTotal(origin, total, time), laps: laps });
; }  }
var timerLap = function (time) { return function (ref) {
    var running = ref.running;
    var origin = ref.origin;
    var total = ref.total;
    var laps = ref.laps;

    return ({ running: running, origin: origin, total: total, laps: timerAddLap(timerTotal(origin, total, time), laps) });
; }  }

var timerAddLap = function (end, laps) { return [{ start: timerLastLapEnd(laps), end: end }].concat(laps); }
var timerLastLapEnd = function (laps) { return laps.length === 0 ? 0 : laps[0].end; }
var timerCurrentLap = function (time, ref) {
  var running = ref.running;
  var origin = ref.origin;
  var total = ref.total;
  var laps = ref.laps;

  return timerTotal(origin, total, time) - timerLastLapEnd(laps);
}
var timerElapsed = function (time, ref) {
  var origin = ref.origin;
  var total = ref.total;

  return timerTotal(origin, total, time);
}
var timerTotal = function (origin, total, time) { return total + (time - origin); }

// Timer events, each tagged with its occurrence time
var doStart = pipe(eventTime, map(timerStart))
var doStop = pipe(eventTime, map(timerStop))
var doReset = pipe(eventTime, map(timerReset))
var doLap = pipe(eventTime, map(timerLap))

// An interactive timer that responds to start, stop, reset, and lap events
// by changing (i.e. accumulating) state
var timer = pipe(anySignal(doStart, doStop, doReset, doLap), accum(timerZero))

// Pair an interactive timer, with the (continuous) current time
var runTimer = both(timer, time)
var displayTimer = unsplit(render)

var ref$4 = render(timerZero, 0);
var vtree = ref$4[0];
var inputs = ref$4[1];
var updateTimer = pipe(runTimer, displayTimer, vdomPatch(patch, patch(container, vtree)))

loop(clockSession(), inputs, updateTimer)

}());