(function () {
'use strict';

var VOID = void 0;
var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
var defaultTextNodeData = {};
var MostlyVNode = (function () {
    function MostlyVNode(tagName, id, className, props, children, element, text, key, scope, namespace) {
        this.tagName = tagName;
        this.id = id;
        this.className = className;
        this.props = props;
        this.children = children;
        this.element = element;
        this.text = text;
        this.key = key;
        this.scope = scope;
        this.namespace = namespace;
        this.parent = VOID;
    }
    MostlyVNode.create = function (tagName, id, className, props, children, text) {
        return new MostlyVNode(tagName, id, className, props, children, VOID, text, props.key, props.scope, VOID);
    };
    MostlyVNode.createText = function (text) {
        return new MostlyVNode(VOID, VOID, VOID, defaultTextNodeData, VOID, VOID, text, VOID, VOID, VOID);
    };
    MostlyVNode.createSvg = function (tagName, id, className, props, children, text) {
        return new MostlyVNode(tagName, id, className, props, children, VOID, text, props.key, props.scope, SVG_NAMESPACE);
    };
    return MostlyVNode;
}());
function addSvgNamespace(vNode) {
    vNode.namespace = SVG_NAMESPACE;
    if (Array.isArray(vNode.children)) {
        var children = vNode.children;
        var childCount = children.length;
        for (var i = 0; i < childCount; ++i) {
            var child = children[i];
            if (child.tagName !== 'foreignObject')
                { addSvgNamespace(child); }
        }
    }
}

var VOID$1 = void 0;
function isString(x) {
    return typeof x === 'string';
}
function isNumber(x) {
    return typeof x === 'number';
}
function isPrimitive(x) {
    return isString(x) || isNumber(x);
}
function vNodesAreEqual(formerVNode, vNode) {
    return formerVNode.key === vNode.key && formerVNode.tagName === vNode.tagName;
}

var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
function parseSelector(selector) {
    var tagName;
    var id = '';
    var classes = [];
    var tagParts = selector.split(classIdSplit);
    var part;
    var type;
    for (var i = 0; i < tagParts.length; i++) {
        part = tagParts[i];
        if (!part)
            { continue; }
        type = part.charAt(0);
        if (!tagName) {
            tagName = part;
        }
        else if (type === '.') {
            classes.push(part.substring(1, part.length));
        }
        else if (type === '#') {
            id = part.substring(1, part.length);
        }
    }
    return {
        tagName: tagName,
        id: id,
        className: classes.join(' '),
    };
}

var h = function h() {
    var selector = arguments[0]; // required
    var childrenOrText = arguments[2]; // optional
    var _a = parseSelector(selector), tagName = _a.tagName, id = _a.id, className = _a.className;
    var props = {};
    var children;
    var text;
    if (childrenOrText) {
        props = arguments[1];
        if (Array.isArray(childrenOrText))
            { children = childrenOrText; }
        else if (isPrimitive(childrenOrText))
            { text = String(childrenOrText); }
    }
    else if (arguments[1]) {
        var childrenOrTextOrProps = arguments[1];
        if (Array.isArray(childrenOrTextOrProps))
            { children = childrenOrTextOrProps; }
        else if (isPrimitive(childrenOrTextOrProps))
            { text = String(childrenOrTextOrProps); }
        else
            { props = childrenOrTextOrProps; }
    }
    if (props && props.class && typeof props.class === 'object') {
        var ck = Object.keys(props.class);
        var cp_1 = props.class;
        className = ck.reduce(function (cn, k) { return cp_1[k] ? cn + " " + k : cn; }, className);
    }
    var isSvg = tagName === 'svg';
    var vNode = isSvg
        ? MostlyVNode.createSvg(tagName, id, className, props, VOID$1, text)
        : MostlyVNode.create(tagName, id, className, props, VOID$1, text);
    if (Array.isArray(children))
        { vNode.children = sanitizeChildren(children, vNode); }
    if (isSvg)
        { addSvgNamespace(vNode); }
    return vNode;
};
function sanitizeChildren(childrenOrText, parent) {
    childrenOrText = childrenOrText.filter(Boolean); // remove possible null values
    var childCount = childrenOrText.length;
    var children = Array(childCount);
    for (var i = 0; i < childCount; ++i) {
        var vNodeOrText = childrenOrText[i];
        if (isString(vNodeOrText))
            { children[i] = MostlyVNode.createText(vNodeOrText); }
        else
            { children[i] = vNodeOrText; }
        if (parent.scope && !children[i].scope)
            { children[i].scope = parent.scope; }
        children[i].parent = parent;
    }
    return children;
}

function hh(tagName) {
    return function () {
        var selector = arguments[0];
        var data = arguments[1];
        var children = arguments[2];
        if (isSelector(selector))
            { if (Array.isArray(data))
                { return h(tagName + selector, {}, data); }
            else if (typeof data === 'object')
                { return h(tagName + selector, data, children); }
            else
                { return h(tagName + selector, data || {}); } }
        if (Array.isArray(selector))
            { return h(tagName, {}, selector); }
        else if (typeof selector === 'object')
            { return h(tagName, selector, data); }
        else
            { return h(tagName, selector || {}); }
    };
}

function isValidString(param) {
    return typeof param === 'string' && param.length > 0;
}
function isSelector(param) {
    return isValidString(param) && (param[0] === '.' || param[0] === '#');
}
































































































var p = hh('p');

function hh$1(tagName) {
    return function () {
        var selector = arguments[0];
        var data = arguments[1];
        var children = arguments[2];
        if (isSelector$1(selector))
            { if (Array.isArray(data))
                { return h(tagName + selector, {}, data); }
            else if (typeof data === 'object')
                { return h(tagName + selector, data, children); }
            else
                { return h(tagName + selector, {}); } }
        if (Array.isArray(selector))
            { return h(tagName, {}, selector); }
        else if (typeof selector === 'object')
            { return h(tagName, selector, data); }
        else
            { return h(tagName, {}); }
    };
}
function isValidString$1(param) {
    return typeof param === 'string' && param.length > 0;
}
function isSelector$1(param) {
    return isValidString$1(param) && (param[0] === '.' || param[0] === '#');
}
function createSVGHelper() {
    var svg = hh$1('svg');
    svg.a = hh$1('a');
    svg.altGlyph = hh$1('altGlyph');
    svg.altGlyphDef = hh$1('altGlyphDef');
    svg.altGlyphItem = hh$1('altGlyphItem');
    svg.animate = hh$1('animate');
    svg.animateColor = hh$1('animateColor');
    svg.animateMotion = hh$1('animateMotion');
    svg.animateTransform = hh$1('animateTransform');
    svg.circle = hh$1('circle');
    svg.clipPath = hh$1('clipPath');
    svg.colorProfile = hh$1('colorProfile');
    svg.cursor = hh$1('cursor');
    svg.defs = hh$1('defs');
    svg.desc = hh$1('desc');
    svg.ellipse = hh$1('ellipse');
    svg.feBlend = hh$1('feBlend');
    svg.feColorMatrix = hh$1('feColorMatrix');
    svg.feComponentTransfer = hh$1('feComponentTransfer');
    svg.feComposite = hh$1('feComposite');
    svg.feConvolveMatrix = hh$1('feConvolveMatrix');
    svg.feDiffuseLighting = hh$1('feDiffuseLighting');
    svg.feDisplacementMap = hh$1('feDisplacementMap');
    svg.feDistantLight = hh$1('feDistantLight');
    svg.feFlood = hh$1('feFlood');
    svg.feFuncA = hh$1('feFuncA');
    svg.feFuncB = hh$1('feFuncB');
    svg.feFuncG = hh$1('feFuncG');
    svg.feFuncR = hh$1('feFuncR');
    svg.feGaussianBlur = hh$1('feGaussianBlur');
    svg.feImage = hh$1('feImage');
    svg.feMerge = hh$1('feMerge');
    svg.feMergeNode = hh$1('feMergeNode');
    svg.feMorphology = hh$1('feMorphology');
    svg.feOffset = hh$1('feOffset');
    svg.fePointLight = hh$1('fePointLight');
    svg.feSpecularLighting = hh$1('feSpecularLighting');
    svg.feSpotlight = hh$1('feSpotlight');
    svg.feTile = hh$1('feTile');
    svg.feTurbulence = hh$1('feTurbulence');
    svg.filter = hh$1('filter');
    svg.font = hh$1('font');
    svg.fontFace = hh$1('fontFace');
    svg.fontFaceFormat = hh$1('fontFaceFormat');
    svg.fontFaceName = hh$1('fontFaceName');
    svg.fontFaceSrc = hh$1('fontFaceSrc');
    svg.fontFaceUri = hh$1('fontFaceUri');
    svg.foreignObject = hh$1('foreignObject');
    svg.g = hh$1('g');
    svg.glyph = hh$1('glyph');
    svg.glyphRef = hh$1('glyphRef');
    svg.hkern = hh$1('hkern');
    svg.image = hh$1('image');
    svg.linearGradient = hh$1('linearGradient');
    svg.marker = hh$1('marker');
    svg.mask = hh$1('mask');
    svg.metadata = hh$1('metadata');
    svg.missingGlyph = hh$1('missingGlyph');
    svg.mpath = hh$1('mpath');
    svg.path = hh$1('path');
    svg.pattern = hh$1('pattern');
    svg.polygon = hh$1('polygon');
    svg.polyline = hh$1('polyline');
    svg.radialGradient = hh$1('radialGradient');
    svg.rect = hh$1('rect');
    svg.script = hh$1('script');
    svg.set = hh$1('set');
    svg.stop = hh$1('stop');
    svg.style = hh$1('style');
    svg.switch = hh$1('switch');
    svg.symbol = hh$1('symbol');
    svg.text = hh$1('text');
    svg.textPath = hh$1('textPath');
    svg.title = hh$1('title');
    svg.tref = hh$1('tref');
    svg.tspan = hh$1('tspan');
    svg.use = hh$1('use');
    svg.view = hh$1('view');
    svg.vkern = hh$1('vkern');
    return svg;
}
var svg = createSVGHelper();

// ~ and * : value contains
// | and ^ : value starts with
// $ : value ends with
var attrModifiers = ['~', '*', '|', '^', '$'];
function matchAttribute(cssSelector, attrs) {
    var _a = cssSelector.split('='), attribute = _a[0], value = _a[1];
    var attributeLength = attribute.length - 1;
    var modifier = attribute[attributeLength];
    var modifierIndex = attrModifiers.indexOf(modifier);
    if (modifierIndex > -1) {
        attribute = attribute.slice(0, attributeLength);
        var attrModifier = attrModifiers[modifierIndex];
        var attrValue = String(attrs[attribute]);
        if (!attrValue)
            { return false; }
        switch (attrModifier) {
            case '~': return attrValue.indexOf(value) > -1;
            case '*': return attrValue.indexOf(value) > -1;
            case '|': return attrValue.indexOf(value) === 0;
            case '^': return attrValue.indexOf(value) === 0;
            case '$': return attrValue.slice(-value.length) === value;
            default: return false;
        }
    }
    if (value)
        { return value === attrs[attribute]; }
    return !!attrs[attribute];
}

function matchBasicCssSelector(cssSelector, vNode) {
    var hasTagName = cssSelector[0] !== '#' && cssSelector[0] !== '.';
    var _a = hasTagName ?
        parseSelector(cssSelector) :
        parseSelector(vNode.tagName + cssSelector), tagName = _a.tagName, className = _a.className, id = _a.id;
    if (tagName !== vNode.tagName)
        { return false; }
    var parsedClassNames = className && className.split(' ') || [];
    var vNodeClassNames = vNode.className && vNode.className.split(' ') || [];
    for (var i = 0; i < parsedClassNames.length; ++i) {
        var parsedClassName = parsedClassNames[i];
        if (vNodeClassNames.indexOf(parsedClassName) === -1)
            { return false; }
    }
    return id === vNode.id;
}

var defaultParent = Object.freeze({ children: [] });
function matchPsuedoSelector(cssSelector, vNode) {
    var parent = vNode.parent || defaultParent;
    var children = parent.children;
    if (cssSelector.indexOf(":nth-child") === 0)
        { return matchNthChild(cssSelector.slice(11).split(')')[0], vNode); }
    if (cssSelector.indexOf(":contains") === 0)
        { return vNodeContainsText(cssSelector.slice(10).split(')')[0], vNode); }
    switch (cssSelector) {
        case ':first-child': return children && children[0] === vNode;
        case ':last-child': return children && children[children.length - 1] === vNode;
        case ':empty': return !vNode.children || vNode.children.length === 0;
        case ':root': return isRoot(vNode);
        default: return false;
    }
    
}
function vNodeContainsText(text, vNode) {
    if (vNode.text)
        { return text === vNode.text; }
    var children = vNode.children;
    if (!children || children.length === 0)
        { return false; }
    for (var i = 0; i < children.length; ++i) {
        var child = children[i];
        if (child.text === text)
            { return true; }
    }
    return false;
}
function isRoot(vNode) {
    return !vNode.parent;
}
function matchNthChild(index, vNode) {
    var parent = vNode.parent || defaultParent;
    var children = parent.children;
    if (!children || children.length === 0)
        { return false; }
    if (index.indexOf('+') === -1 && !isNaN(parseInt(index)))
        { return children[parseInt(index)] === vNode; }
    var childIndex = children.indexOf(vNode);
    if (index === 'odd')
        { return childIndex % 2 !== 0; }
    if (index === 'even')
        { return childIndex % 2 === 0; }
    if (index.indexOf('+') > -1) {
        var _a = index.split('+'), multipleString = _a[0], offsetString = _a[1];
        var multiple = parseInt(multipleString.split('n')[0]);
        var offset = parseInt(offsetString);
        if (multiple === 0)
            { return true; }
        return childIndex !== 0 && childIndex % (multiple + offset) === 0;
    }
    return false;
}
function isNaN(x) {
    return (x | 0) !== x;
}

var EMPTY = Object.freeze({});
function matchesSelector(cssSelector, vNode) {
    cssSelector = cssSelector.trim();
    // if working with an ElementVNode return use native implementation
    if (vNode.element && vNode.element.matches)
        { return vNode.element.matches(cssSelector); }
    if (cssSelector[0] === '[' && cssSelector[cssSelector.length - 1] === ']')
        { return matchAttribute(cssSelector.slice(1, -1), vNode.props.attrs || EMPTY); }
    if (cssSelector.indexOf(':') > -1)
        { return matchPsuedoSelector(cssSelector, vNode); }
    if (cssSelector.indexOf(' ') > -1)
        { throw new Error('Basic CSS selectors can not contain spaces'); }
    return matchBasicCssSelector(cssSelector, vNode);
}

function hasCssSelector(cssSelector, vNode) {
    cssSelector = cssSelector.trim();
    if (cssSelector === '*')
        { return true; }
    if (cssSelector.indexOf(',') > -1) {
        var cssSelectors = cssSelector.split(',').map(function (str) { return str.trim(); });
        for (var i = 0; i < cssSelectors.length; ++i)
            { if (hasCssSelector(cssSelectors[i], vNode))
                { return true; } }
        return false;
    }
    else if (cssSelector.indexOf('>') > -1) {
        var _a = splitByLastIndex(cssSelector, '>'), parentSelector = _a[0], childSelector = _a[1];
        if (!vNode.parent)
            { return false; }
        return hasCssSelector(parentSelector, vNode.parent) &&
            hasCssSelector(childSelector, vNode);
    }
    else if (cssSelector.indexOf(' + ') > -1) {
        var _b = splitByLastIndex(cssSelector, '+'), siblingSelector = _b[0], selector = _b[1];
        var parent_1 = vNode.parent;
        if (!parent_1 || !hasCssSelector(selector, vNode))
            { return false; }
        var children = parent_1.children;
        if (!children)
            { return false; }
        var index = children.indexOf(vNode);
        if (index === 0 || !hasCssSelector(siblingSelector, children[index - 1]))
            { return false; }
        return true;
    }
    else if (cssSelector.indexOf(' ~ ') > -1) {
        var _c = splitByLastIndex(cssSelector, '~'), siblingSelector = _c[0], selector = _c[1];
        var parent_2 = vNode.parent;
        if (!parent_2 || !hasCssSelector(selector, vNode))
            { return false; }
        var children = parent_2.children;
        if (!children)
            { return false; }
        var index = children.indexOf(vNode);
        if (index === 0)
            { return false; }
        for (var i = 0; i < index; ++i)
            { if (hasCssSelector(siblingSelector, children[i]))
                { return true; } }
        return false;
    }
    else if (cssSelector.indexOf(' ') > -1) {
        var cssSelectors_1 = cssSelector.split(' ').filter(Boolean).map(function (str) { return str.trim(); });
        var i_1 = cssSelectors_1.length - 1;
        if (!hasCssSelector(cssSelectors_1[i_1], vNode))
            { return false; }
        while (--i_1 >= 0) {
            var parentMatches = traverseParentVNodes(function (parent) { return hasCssSelector(cssSelectors_1[i_1], parent); }, vNode);
            if (!parentMatches)
                { return false; }
        }
        return true;
    }
    return matchesSelector(cssSelector, vNode);
}
function splitByLastIndex(cssSelector, token) {
    var index = cssSelector.lastIndexOf(token);
    return [
        cssSelector.substring(0, index).trim(),
        cssSelector.substring(index + 1).trim() ];
}
function traverseParentVNodes(predicate, vNode) {
    var parent = vNode.parent;
    if (!parent)
        { return false; }
    if (predicate(parent))
        { return true; }
    return traverseParentVNodes(predicate, parent);
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */

// Non-mutating array operations

// cons :: a -> [a] -> [a]
// a with x prepended


// append :: a -> [a] -> [a]
// a with x appended


// drop :: Int -> [a] -> [a]
// drop first n elements


// tail :: [a] -> [a]
// drop head element


// copy :: [a] -> [a]
// duplicate a (shallow duplication)


// map :: (a -> b) -> [a] -> [b]
// transform each element with f


// reduce :: (a -> b -> a) -> a -> [b] -> a
// accumulate via left-fold


// replace :: a -> Int -> [a]
// replace element at index


// remove :: Int -> [a] -> [a]
// remove element at index


// removeAll :: (a -> boolean) -> [a] -> [a]
// remove all elements matching a predicate


// findIndex :: a -> [a] -> Int
// find index of x in a, from the left


// isArrayLike :: * -> boolean
// Return true iff x is array-like

/** @license MIT License (c) copyright 2010-2016 original author or authors */

// id :: a -> a


// compose :: (b -> c) -> (a -> b) -> (a -> c)


// apply :: (a -> b) -> a -> b


// curry2 :: ((a, b) -> c) -> (a -> b -> c)
function curry2 (f) {
  function curried (a, b) {
    switch (arguments.length) {
      case 0: return curried
      case 1: return function (b) { return f(a, b); }
      default: return f(a, b)
    }
  }
  return curried
}

// curry3 :: ((a, b, c) -> d) -> (a -> b -> c -> d)
function curry3 (f) {
  function curried (a, b, c) { // eslint-disable-line complexity
    switch (arguments.length) {
      case 0: return curried
      case 1: return curry2(function (b, c) { return f(a, b, c); })
      case 2: return function (c) { return f(a, b, c); }
      default:return f(a, b, c)
    }
  }
  return curried
}

// curry4 :: ((a, b, c, d) -> e) -> (a -> b -> c -> d -> e)
function curry4 (f) {
  function curried (a, b, c, d) { // eslint-disable-line complexity
    switch (arguments.length) {
      case 0: return curried
      case 1: return curry3(function (b, c, d) { return f(a, b, c, d); })
      case 2: return curry2(function (c, d) { return f(a, b, c, d); })
      case 3: return function (d) { return f(a, b, c, d); }
      default:return f(a, b, c, d)
    }
  }
  return curried
}

/** @license MIT License (c) copyright 2016 original author or authors */

var BaseModule = (function () {
    function BaseModule() {
    }
    BaseModule.prototype.pre = function (_) { };
    BaseModule.prototype.post = function (_) { };
    BaseModule.prototype.init = function (_) { };
    BaseModule.prototype.create = function (_) { };
    BaseModule.prototype.update = function (_, __) { };
    BaseModule.prototype.remove = function (_, removeElement) {
        removeElement();
    };
    BaseModule.prototype.destroy = function (_) { };
    BaseModule.prototype.prepatch = function (_, __) { };
    BaseModule.prototype.postpatch = function (_, __) { };
    return BaseModule;
}());

var emptyVNode = new MostlyVNode(VOID$1, VOID$1, VOID$1, {}, VOID$1, VOID$1, VOID$1, VOID$1, VOID$1, VOID$1);

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var NAMESPACE_URIS = {
    xlink: 'http://www.w3.org/1999/xlink',
};
var booleanAttributes = [
    'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'compact',
    'controls', 'declare', 'default', 'defaultchecked', 'defaultmuted',
    'defaultselected', 'defer', 'disabled', 'draggable', 'enabled',
    'formnovalidate', 'hidden', 'indeterminate', 'inert', 'ismap', 'itemscope',
    'loop', 'multiple', 'muted', 'nohref', 'noresize', 'noshade', 'novalidate',
    'nowrap', 'open', 'pauseonexit', 'readonly', 'required', 'reversed', 'scoped',
    'seamless', 'selected', 'sortable', 'spellcheck', 'translate', 'truespeed',
    'typemustmatch', 'visible' ];
var booleanAttributeDictionary = Object.create(null);
for (var i$1 = 0, count = booleanAttributes.length; i$1 < count; i$1++)
    { booleanAttributeDictionary[booleanAttributes[i$1]] = true; }
// attributes module
var AttributesModule = (function (_super) {
    __extends(AttributesModule, _super);
    function AttributesModule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AttributesModule.prototype.create = function (vNode) {
        updateAttributes(emptyVNode, vNode);
    };
    AttributesModule.prototype.update = function (formerVNode, vNode) {
        updateAttributes(formerVNode, vNode);
    };
    return AttributesModule;
}(BaseModule));
function updateAttributes(formerVNode, vNode) {
    var key;
    var attributeValue;
    var formerAttributeValue;
    var element = vNode.element;
    var formerAttributes = formerVNode.props.attrs;
    var attributes = vNode.props.attrs;
    var attributeParts;
    if (!formerAttributes && !attributes)
        { return; }
    formerAttributes = formerAttributes || {};
    attributes = attributes || {};
    for (key in attributes) {
        attributeValue = attributes[key];
        formerAttributeValue = formerAttributes[key];
        if (formerAttributeValue !== attributeValue) {
            if (!attributeValue && booleanAttributeDictionary[key])
                { element.removeAttribute(key); }
            else {
                attributeParts = key.split(':');
                if (attributeParts.length > 1 && NAMESPACE_URIS.hasOwnProperty(attributeParts[0]))
                    { element.setAttributeNS(NAMESPACE_URIS[attributeParts[0]], key, attributeValue); }
                else
                    { element.setAttribute(key, attributeValue); }
            }
        }
    }
    for (key in formerAttributes)
        { if (!(key in attributes))
            { element.removeAttribute(key); } }
}

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var FocusModule = (function (_super) {
    __extends$1(FocusModule, _super);
    function FocusModule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FocusModule.prototype.insert = function (vNode) {
        setFocus(vNode);
    };
    FocusModule.prototype.update = function (_, vNode) {
        setFocus(vNode);
    };
    return FocusModule;
}(BaseModule));
function setFocus(vNode) {
    var _a = vNode.props.focus, focus = _a === void 0 ? false : _a, element = vNode.element;
    if (focus && typeof element.focus === 'function')
        { element.focus(); }
}

var ModuleCallbacks = (function () {
    function ModuleCallbacks(modules) {
        this._modules = modules;
        this._moduleCount = modules.length;
    }
    ModuleCallbacks.prototype.createRemoveElementFn = function (element) {
        var listeners = this._moduleCount + 1;
        return function removeElement() {
            if (--listeners === 0) {
                var parent_1 = element.parentNode;
                parent_1.removeChild(element);
            }
        };
    };
    // module hooks
    ModuleCallbacks.prototype.pre = function (vNode) {
        var modules = this._modules;
        var moduleCount = this._moduleCount;
        for (var i = 0; i < moduleCount; ++i)
            { modules[i].pre(vNode); }
    };
    ModuleCallbacks.prototype.post = function (vNode) {
        var modules = this._modules;
        var moduleCount = this._moduleCount;
        for (var i = 0; i < moduleCount; ++i)
            { modules[i].post(vNode); }
    };
    ModuleCallbacks.prototype.init = function (vNode) {
        var modules = this._modules;
        var moduleCount = this._moduleCount;
        for (var i = 0; i < moduleCount; ++i)
            { modules[i].init(vNode); }
    };
    ModuleCallbacks.prototype.create = function (vNode) {
        var modules = this._modules;
        var moduleCount = this._moduleCount;
        for (var i = 0; i < moduleCount; ++i)
            { modules[i].create(vNode); }
    };
    ModuleCallbacks.prototype.update = function (formerVNode, vNode) {
        var modules = this._modules;
        var moduleCount = this._moduleCount;
        for (var i = 0; i < moduleCount; ++i)
            { modules[i].update(formerVNode, vNode); }
    };
    ModuleCallbacks.prototype.remove = function (vNode, removeElement) {
        var modules = this._modules;
        var moduleCount = this._moduleCount;
        for (var i = 0; i < moduleCount; ++i)
            { modules[i].remove(vNode, removeElement); }
    };
    ModuleCallbacks.prototype.destroy = function (vNode) {
        var modules = this._modules;
        var moduleCount = this._moduleCount;
        for (var i = 0; i < moduleCount; ++i)
            { modules[i].destroy(vNode); }
    };
    ModuleCallbacks.prototype.prepatch = function (formerVNode, vNode) {
        var modules = this._modules;
        var moduleCount = this._moduleCount;
        for (var i = 0; i < moduleCount; ++i)
            { modules[i].prepatch(formerVNode, vNode); }
    };
    ModuleCallbacks.prototype.postpatch = function (formerVNode, vNode) {
        var modules = this._modules;
        var moduleCount = this._moduleCount;
        for (var i = 0; i < moduleCount; ++i)
            { modules[i].postpatch(formerVNode, vNode); }
    };
    return ModuleCallbacks;
}());

var __extends$2 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var PROPERTIES_TO_SKIP = [
    'class',
    'focus',
    'style',
    'attrs',
    'key',
    'module',
    'init',
    'create',
    'update',
    'insert',
    'remove',
    'destroy',
    'prepatch',
    'postpatch' ];
var PropsModule = (function (_super) {
    __extends$2(PropsModule, _super);
    function PropsModule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PropsModule.prototype.create = function (vNode) {
        updateProps(emptyVNode, vNode);
    };
    PropsModule.prototype.update = function (formerVNode, vNode) {
        updateProps(formerVNode, vNode);
    };
    return PropsModule;
}(BaseModule));
function updateProps(formerVNode, vNode) {
    var key;
    var element = vNode.element;
    var formerProps = formerVNode.props;
    var props = vNode.props;
    if (!formerProps && !props)
        { return; }
    formerProps = formerProps || {};
    props = props || {};
    for (key in formerProps)
        { if (PROPERTIES_TO_SKIP.indexOf(key) === -1 && !props[key])
            { delete element[key]; } }
    for (key in props)
        { if (PROPERTIES_TO_SKIP.indexOf(key) === -1)
            { element[key] = props[key]; } }
}

var __extends$3 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var StylesModule = (function (_super) {
    __extends$3(StylesModule, _super);
    function StylesModule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StylesModule.prototype.pre = function () {
        setRequestAnimationFrame();
    };
    StylesModule.prototype.create = function (vNode) {
        updateStyle(emptyVNode, vNode);
    };
    StylesModule.prototype.update = function (formerVNode, vNode) {
        updateStyle(formerVNode, vNode);
    };
    StylesModule.prototype.remove = function (vNode, removeElement) {
        applyRemoveStyle(vNode, removeElement);
    };
    StylesModule.prototype.destroy = function (vNode) {
        applyDestroyStyle(vNode);
    };
    return StylesModule;
}(BaseModule));
var requestAnimationFrame;
function setRequestAnimationFrame() {
    if (!requestAnimationFrame)
        { requestAnimationFrame =
            (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout; }
}
function nextFrame(fn) {
    requestAnimationFrame(function () {
        requestAnimationFrame(fn);
    });
}

function setValueOnNextFrame(obj, prop, value) {
    nextFrame(function () {
        obj[prop] = value;
    });
}
function updateStyle(formerVNode, vNode) {
    var styleValue;
    var key;
    var element = vNode.element;
    var formerStyle = formerVNode.props.style;
    var style = vNode.props.style;
    if (!formerStyle && !style)
        { return; }
    formerStyle = formerStyle || {};
    style = style || {};
    var formerHasDelayedProperty = !!formerStyle.delayed;
    for (key in formerStyle)
        { if (!style[key])
            { element.style[key] = ''; } }
    for (key in style) {
        styleValue = style[key];
        if (key === 'delayed') {
            for (key in style.delayed) {
                styleValue = style.delayed[key];
                if (!formerHasDelayedProperty || styleValue !== formerStyle.delayed[key])
                    { setValueOnNextFrame(element.style, key, styleValue); }
            }
        }
        else if (key !== 'remove') {
            element.style[key] = styleValue;
        }
    }
}
function applyDestroyStyle(vNode) {
    var key;
    var element = vNode.element;
    var style = vNode.props.style;
    if (!style || !style.destroy)
        { return; }
    var destroy = style.destroy;
    for (key in destroy)
        { element.style[key] = destroy[key]; }
}
function applyRemoveStyle(vNode, callback) {
    var style = vNode.props.style;
    if (!style || !style.remove)
        { return callback(); }
    var key;
    var element = vNode.element;
    var index = 0;
    var computedStyle;
    var listenerCount = 0;
    var appliedStyles = [];
    for (key in style) {
        appliedStyles.push(key);
        element.style[key] = style[key];
    }
    computedStyle = getComputedStyle(element);
    var transitionProperties = computedStyle['transition-property'].split(', ');
    for (; index < transitionProperties.length; ++index)
        { if (appliedStyles.indexOf(transitionProperties[index]) !== -1)
            { listenerCount++; } }
    element.addEventListener('transitionend', function (event) {
        if (event.target === element)
            { --listenerCount; }
        if (listenerCount === 0)
            { callback(); }
    });
}

var SCOPE_ATTRIBUTE = 'data-mostly-dom-scope';

function createElement(vNode, moduleCallbacks, insertedVNodeQueue) {
    var props = vNode.props;
    moduleCallbacks.init(vNode);
    if (props.init)
        { props.init(vNode); }
    if (vNode.tagName) {
        var element = vNode.namespace
            ? document.createElementNS(vNode.namespace, vNode.tagName)
            : document.createElement(vNode.tagName);
        if (vNode.id)
            { element.id = vNode.id; }
        if (vNode.className)
            { element.className = vNode.className; }
        if (vNode.scope)
            { element.setAttribute(SCOPE_ATTRIBUTE, vNode.scope); }
        vNode.element = element;
        var children = vNode.children;
        if (children) {
            var childCount = children.length;
            for (var i = 0; i < childCount; ++i)
                { element.appendChild(createElement(children[i], moduleCallbacks, insertedVNodeQueue).element); }
        }
        if (vNode.text)
            { element.appendChild(document.createTextNode(vNode.text)); }
        moduleCallbacks.create(vNode);
        if (props.create)
            { props.create(vNode); }
        if (props.insert)
            { insertedVNodeQueue.push(vNode); }
        return vNode;
    }
    vNode.element = document.createTextNode(vNode.text);
    return vNode;
}

function prepatchHooks(formerVNode, vNode, moduleCallbacks) {
    var props = vNode.props;
    moduleCallbacks.prepatch(formerVNode, vNode);
    if (props.prepatch)
        { props.prepatch(formerVNode, vNode); }
}
function updateHooks(formerVNode, vNode, moduleCallbacks) {
    var props = vNode.props;
    moduleCallbacks.update(formerVNode, vNode);
    if (props.update)
        { props.update(formerVNode, vNode); }
}
function postpatchHooks(formerVNode, vNode, moduleCallbacks) {
    var props = vNode.props;
    moduleCallbacks.postpatch(formerVNode, vNode);
    if (props.postpatch)
        { props.postpatch(formerVNode, vNode); }
}

function addVNodes(parentNode, referenceNode, vNodes, startIndex, endIndex, moduleCallbacks, insertedVNodeQueue) {
    for (; startIndex <= endIndex; ++startIndex)
        { parentNode.insertBefore(createElement(vNodes[startIndex], moduleCallbacks, insertedVNodeQueue).element, referenceNode); }
}

function removeVNodes(parentNode, vNodes, startIndex, endIndex, moduleCallbacks) {
    for (; startIndex <= endIndex; ++startIndex) {
        var vNode = vNodes[startIndex];
        if (!vNode)
            { continue; }
        if (vNode.tagName) {
            var props = vNode.props;
            invokeDestroyHook(vNode, moduleCallbacks);
            var removeElement = moduleCallbacks.createRemoveElementFn(vNode.element);
            moduleCallbacks.remove(vNode, removeElement);
            if (props.remove)
                { props.remove(vNode, removeElement); }
            else
                { removeElement(); }
        }
        else {
            parentNode.removeChild(vNode.element);
        }
    }
}
function invokeDestroyHook(vNode, moduleCallbacks) {
    var props = vNode.props;
    if (props.destroy)
        { props.destroy(vNode); }
    if (vNode.tagName)
        { moduleCallbacks.destroy(vNode); }
    var children = vNode.children;
    if (!children)
        { return; }
    for (var i = 0; i < children.length; ++i)
        { invokeDestroyHook(children[i], moduleCallbacks); }
}

function updateChildren(parentElement, formerChildren, children, moduleCallbacks, insertedVNodeQueue) {
    // indexes
    var formerStartIndex = 0;
    var startIndex = 0;
    var formerEndIndex = formerChildren.length - 1;
    var endIndex = children.length - 1;
    // VNodes
    var formerStartVNode = formerChildren[formerStartIndex];
    var startVNode = children[startIndex];
    var formerEndVNode = formerChildren[formerEndIndex];
    var endVNode = children[endIndex];
    // an object mapping keys to indexes in formerChildren array
    var mappedKeyToFormerIndex;
    while (formerStartIndex <= formerEndIndex && startIndex <= endIndex) {
        if (!formerStartVNode)
            { formerStartVNode = formerChildren[++formerStartIndex]; }
        else if (!formerEndVNode)
            { formerEndVNode = formerChildren[--formerEndIndex]; }
        else if (vNodesAreEqual(formerStartVNode, startVNode)) {
            patchVNode(formerStartVNode, startVNode, moduleCallbacks, insertedVNodeQueue);
            formerStartVNode = formerChildren[++formerStartIndex];
            startVNode = children[++startIndex];
        }
        else if (vNodesAreEqual(formerEndVNode, endVNode)) {
            patchVNode(formerEndVNode, endVNode, moduleCallbacks, insertedVNodeQueue);
            formerEndVNode = formerChildren[--formerEndIndex];
            endVNode = children[--endIndex];
        }
        else if (vNodesAreEqual(formerStartVNode, endVNode)) {
            patchVNode(formerStartVNode, endVNode, moduleCallbacks, insertedVNodeQueue);
            parentElement.insertBefore(formerStartVNode.element, formerEndVNode.element.nextSibling);
            formerStartVNode = formerChildren[++formerStartIndex];
            endVNode = children[--endIndex];
        }
        else if (vNodesAreEqual(formerEndVNode, startVNode)) {
            patchVNode(formerEndVNode, startVNode, moduleCallbacks, insertedVNodeQueue);
            parentElement.insertBefore(formerEndVNode.element, formerStartVNode.element);
            formerEndVNode = formerChildren[--formerEndIndex];
            startVNode = children[++startIndex];
        }
        else {
            if (!mappedKeyToFormerIndex)
                { mappedKeyToFormerIndex =
                    mapKeyToFormerIndex(formerChildren, formerStartIndex, formerEndIndex); }
            var formerIndexKey = mappedKeyToFormerIndex[startVNode.key];
            if (!formerIndexKey) {
                var element = createElement(startVNode, moduleCallbacks, insertedVNodeQueue).element;
                parentElement.insertBefore(element, formerStartVNode.element);
                startVNode = children[++startIndex];
            }
            else {
                var reorderableVNode = formerChildren[formerIndexKey];
                patchVNode(reorderableVNode, startVNode, moduleCallbacks, insertedVNodeQueue);
                // WARNING: hack for performance optimization
                formerChildren[formerIndexKey] = void 0;
                parentElement.insertBefore(reorderableVNode.element, formerStartVNode.element);
                startVNode = children[++startIndex];
            }
        }
    }
    if (formerStartIndex > formerEndIndex) {
        var referenceNode = children[endIndex + 1] ? children[endIndex + 1].element : null;
        addVNodes(parentElement, referenceNode, children, startIndex, endIndex, moduleCallbacks, insertedVNodeQueue);
    }
    else if (startIndex > endIndex)
        { removeVNodes(parentElement, formerChildren, formerStartIndex, formerEndIndex, moduleCallbacks); }
}
function mapKeyToFormerIndex(children, startIndex, endIndex) {
    var index = startIndex;
    var map = {};
    var key;
    for (; index <= endIndex; ++index) {
        key = children[index].key;
        if (key)
            { map[key] = index; }
    }
    return map;
}

function patchVNodeChildren(formerVNode, vNode, moduleCallbacks, insertedVNodeQueue) {
    var element = vNode.element;
    var formerChildren = formerVNode.children;
    var children = vNode.children;
    if (formerVNode.text)
        { element.textContent = ''; }
    if (formerChildren && children && formerChildren !== children)
        { updateChildren(element, formerChildren, children, moduleCallbacks, insertedVNodeQueue); }
    else if (children)
        { addVNodes(element, null, children, 0, endIndex(children), moduleCallbacks, insertedVNodeQueue); }
    else if (formerChildren)
        { removeVNodes(element, formerChildren, 0, endIndex(formerChildren), moduleCallbacks); }
}
function endIndex(vNodeChildren) {
    return vNodeChildren.length - 1;
}

function replacePreviousElement(formerVNode, vNode, moduleCallbacks, insertedVNodeQueue) {
    var parentNode = formerVNode.element.parentNode;
    var element = createElement(vNode, moduleCallbacks, insertedVNodeQueue).element;
    parentNode.insertBefore(element, formerVNode.element);
    removeVNodes(parentNode, [formerVNode], 0, 0, moduleCallbacks);
}

function updateElement(formerVNode, vNode) {
    var node = vNode.element = formerVNode.element;
    if (isElement(node)) {
        if (vNode.id)
            { node.id = vNode.id; }
        if (vNode.className)
            { node.className = vNode.className; }
        if (vNode.scope)
            { node.setAttribute(SCOPE_ATTRIBUTE, vNode.scope); }
    }
    return vNode;
}
function isElement(node) {
    return typeof node.setAttribute === 'function';
}

function patchVNode(formerVNode, vNode, moduleCallbacks, insertedVNodeQueue) {
    prepatchHooks(formerVNode, vNode, moduleCallbacks);
    vNode = updateElement(formerVNode, vNode);
    if (formerVNode === vNode)
        { return; }
    if (!vNodesAreEqual(formerVNode, vNode))
        { return replacePreviousElement(formerVNode, vNode, moduleCallbacks, insertedVNodeQueue); }
    updateHooks(formerVNode, vNode, moduleCallbacks);
    if (!vNode.text)
        { patchVNodeChildren(formerVNode, vNode, moduleCallbacks, insertedVNodeQueue); }
    else if (formerVNode.text !== vNode.text)
        { vNode.element.textContent = vNode.text; }
    postpatchHooks(formerVNode, vNode, moduleCallbacks);
}

function init(modules) {
    var attributesModule = new AttributesModule();
    var propsModule = new PropsModule();
    var stylesModule = new StylesModule();
    var focusModule = new FocusModule();
    var defaultModules = [
        attributesModule,
        propsModule,
        stylesModule,
        focusModule ];
    var moduleCallbacks = new ModuleCallbacks(defaultModules.concat(modules));
    return function patch(formerVNode, vNode) {
        var insertedVNodeQueue = [];
        moduleCallbacks.pre(vNode);
        if (vNodesAreEqual(formerVNode, vNode))
            { patchVNode(formerVNode, vNode, moduleCallbacks, insertedVNodeQueue); }
        else {
            var element = formerVNode.element;
            var parentNode = element.parentNode;
            vNode = createElement(vNode, moduleCallbacks, insertedVNodeQueue);
            if (parentNode) {
                parentNode.insertBefore(vNode.element, element.nextSibling);
                removeVNodes(parentNode, [formerVNode], 0, 0, moduleCallbacks);
            }
        }
        for (var i = 0; i < insertedVNodeQueue.length; ++i)
            { insertedVNodeQueue[i].props.insert(insertedVNodeQueue[i]); }
        moduleCallbacks.post(vNode);
        return vNode;
    };
}

function elementToVNode$$1(element$$1) {
    return new MostlyVNode(element$$1.tagName && element$$1.tagName.toLowerCase(), element$$1.id, element$$1.className, {}, Array.prototype.slice.call(element$$1.childNodes).map(nodeToVNode) || VOID$1, element$$1, VOID$1, VOID$1, VOID$1, VOID$1);
}
function nodeToVNode(node) {
    if (node instanceof Element)
        { return elementToVNode$$1(node); }
    var textVNode = MostlyVNode.createText(node.textContent);
    textVNode.element = node;
    return textVNode;
}

var pair = curry2(function (a, b) { return [a, b]; });

var fst = function (pair) { return pair[0]; };

var snd = function (pair) { return pair[1]; };

var first = function (ab) { return new First(ab); };

var First = function First (ab) {
  this.ab = ab;
};

First.prototype.step = function step (t, pac) {
  var ref = this.ab.step(t, fst(pac));
    var b = ref.value;
    var abnext = ref.next;
  return { value: pair(b, snd(pac)), next: new First(abnext) }
};



var Unfirst = function Unfirst (ab, c) {
  this.ab = ab;
  this.value = c;
};

Unfirst.prototype.step = function step (t, a) {
  var ref = this.ab.step(t, pair(a, this.value));
    var bc = ref.value;
    var next = ref.next;
  return { value: fst(bc), next: new Unfirst(next, snd(bc)) }
};



var Unsplit = function Unsplit (f) {
  this.f = f;
};

Unsplit.prototype.step = function step (t, ab) {
  var f = this.f;
  return { value: f(fst(ab), snd(ab)), next: this }
};

var arr = function (f) { return new Arr(f); };

var Arr = function Arr (f) {
  this.f = f;
};

Arr.prototype.step = function step (t, a) {
  var f = this.f;
  return { value: f(a), next: this }
};

var Id = function Id () {};

Id.prototype.step = function step (t, a) {
  return { value: a, next: this }
};

var Always = function Always (value) {
  this.value = value;
  this.next = this;
};

Always.prototype.step = function step (t, a) {
  return this
};

var time = function () { return new Time(); };

var Time = function Time () {};

Time.prototype.step = function step (t, a) {
  return { value: t, next: this }
};

var pipe = curry2(function (ab, bc) { return compose2(bc, ab); });

var compose2 = function (bc, ab) { return bc instanceof Always ? bc
    : bc instanceof Time ? bc
    : bc instanceof Id ? ab
    : ab instanceof Id ? bc
    : new Compose(bc, ab); };

var Compose = function Compose (bc, ab) {
  this.ab = ab;
  this.bc = bc;
};

Compose.prototype.step = function step (t, a) {
  var ref = this.ab.step(t, a);
    var b = ref.value;
    var ab = ref.next;
  var ref$1 = this.bc.step(t, b);
    var c = ref$1.value;
    var bc = ref$1.next;
  return { value: c, next: new Compose(bc, ab) }
};

var run = curry3(function (sf, sg, s) { return sg.when(function (sg) { return step(sf, sg, s); }); });

var step = function (sf, sg, s) {
  var ref = s.step();
  var sample = ref.sample;
  var nextSession = ref.next;
  var ref$1 = sf.step(sample, sg.value());
  var value = ref$1.value;
  var next = ref$1.next;
  return run(next, value, nextSession)
};

var runVdom = curry4(function (sf, patchFunc, vnode, ref) {
    var vtree = ref[0];
    var inputs = ref[1];

    return run(pipe(sf, patch$1(patchFunc, patchFunc(vnode, vtree))), inputs);
});

var patch$1 = function (p, initial) { return pipe(first(new Patch(p, initial)), arr(snd)); };

var Patch = function Patch (patch, state) {
  this.patch = patch;
  this.state = state;
};

Patch.prototype.step = function step (t, a) {
  var f = this.patch;
  var s = f(this.state, a);
  return { value: f(this.state, a), next: new Patch(f, s) }
};

var Parallel = function Parallel (ab, cd) {
  this.ab = ab;
  this.cd = cd;
};

Parallel.prototype.step = function step (t, ac) {
  var ref = this.ab.step(t, fst(ac));
    var b = ref.value;
    var anext = ref.next;
  var ref$1 = this.cd.step(t, snd(ac));
    var d = ref$1.value;
    var cnext = ref$1.next;
  return { value: pair(b, d), next: new Parallel(anext, cnext) }
};

var NoOccurrence = function NoOccurrence () {};

NoOccurrence.prototype.map = function map (f) {
  return this
};

NoOccurrence.prototype.concat = function concat (e) {
  return e
};

var NonOccurrence = new NoOccurrence();

var occur = function (x) { return new Occurrence(x); };

var Occurrence = function Occurrence (value) {
  this.value = value;
};

Occurrence.prototype.map = function map (f) {
  return new Occurrence(f(this.value))
};

Occurrence.prototype.concat = function concat (e) {
  return e === NonOccurrence ? this : new Occurrence(this.value.concat(e.value))
};

var Hold = function Hold (value) {
  this.value = value;
};

Hold.prototype.step = function step (t, a) {
  return a === NonOccurrence
    ? { value: this.value, next: this }
    : { value: a.value, next: new Hold(a.value) }
};

var Merge = function Merge () {};

Merge.prototype.step = function step (t, es) {
  return { value: fst(es).concat(snd(es)), next: this }
};

var noop = function (_) { return undefined; };

var input$1 = function () { return makeInput(new SimpleInput()); };

var makeInput = function (si) { return [function (x) { return occurs(occur(x), si); }, si]; };

var occurs = function (x, input) {
  input._value = x;
  var f = input.f;
  input.f = noop;
  f(input);
};

var SimpleInput = function SimpleInput () {
  this._value = NonOccurrence;
  this.f = noop;
};

SimpleInput.prototype.when = function when (f) {
    var this$1 = this;

  this.f = f;
  return function () { this$1.f = noop; }
};

SimpleInput.prototype.value = function value () {
  return this._value
};



var InputPair = function InputPair (ia, ib) {
  this.ia = ia;
  this.ib = ib;
};

InputPair.prototype.when = function when (f) {
    var this$1 = this;

  var handler = function (_) { return f(this$1); };
  var iaw = this.ia.when(handler);
  var ibw = this.ib.when(handler);
  return function () {
    iaw();
    ibw();
  }
};

InputPair.prototype.value = function value () {
  return pair(this.ia.value(), this.ib.value())
};

var sessionStep = function (sample, next) { return ({ sample: sample, next: next }); };

// Session that yields an incrementing count
var countSession = function (delta) { return new CountSession(delta, 0); };

var CountSession = function CountSession (delta, count) {
  this.delta = delta;
  this.count = count;
};

CountSession.prototype.step = function step () {
  return sessionStep(this.count, new CountSession(this.delta, this.count + this.delta))
};

// Session that yields time delta from the instant
// it is created
var clockSession = function () { return new ClockDeltaSession(Date.now, Date.now()); };

var ClockDeltaSession = function ClockDeltaSession (now, start) {
  this.now = now;
  this.start = start;
};

ClockDeltaSession.prototype.step = function step () {
  var now = this.now;
  return sessionStep(now() - this.start, new ClockDeltaSession(now, this.start))
};

var color = function (set, reset) {
  if ( reset === void 0 ) reset = 39;

  return function (s) { return ("\u001b[" + set + "m" + s + "\u001b[" + reset + "m"); };
};
var cyan = color(36);
var green = color(32);
var dim = color(2, 22);

var stepAssertSF = function (n, assert, sf, f, s) {
  if (n === 0) {
    return true
  }

  var ref = s.step();
  var sample = ref.sample;
  var nextSession = ref.next;
  var a = f(sample);
  var ref$1 = sf.step(sample, a);
  var value = ref$1.value;
  var next = ref$1.next;

  if (!assert(sample, a, value)) {
    throw new Error(("assert failed: " + sample + ": " + a + " -/> " + value))
  }

  return stepAssertSF(n - 1, assert, next, f, nextSession)
};

var assertSF = curry4(function (s, f, assert, sf) { return stepAssertSF(1000, assert, sf, f, s); });

var simpleAssertSF = assertSF(countSession(1), function (x) { return x; });

var after = function (ms) {
  var ref = input$1();
  var f = ref[0];
  var t = ref[1];
  setTimeout(f, ms);
  return t
};

var vnode = elementToVNode$$1(document.getElementById('app'));
var patch = init([]);

var tick = function (t) { return [
  p(("" + t)),
  after(1000)
]; };

var clock = pipe(time(), arr(tick));

runVdom(clock, patch, vnode, tick(0))(clockSession());

}());
