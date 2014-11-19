!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.BitShadowItems=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global document, window */

/**
 * Creates a new FPSDisplay object.
 *
 * Use this class to create a field at the
 * top of the browser that displays the current
 * frames per second and total number of elements
 * in an optional passed array.
 *
 * Note: FPSDisplay will not function in browsers
 * whose Date object does not support Date.now().
 * These include IE6, IE7, and IE8.
 *
 * @constructor
 */
function FPSDisplay() {}

/**
 * Name
 * @type {string}
 * @memberof FPSDisplay
 */
FPSDisplay.name = 'FPSDisplay';

/**
 * Set to false to stop requesting animation frames.
 * @type {boolean}
 * @memberof FPSDisplay
 */
FPSDisplay.active = false;

/**
 * Frames per second.
 * @type {number}
 * @memberof FPSDisplay
 */
FPSDisplay.fps = 0;

/**
 * Total items.
 * @type {number}
 * @memberof FPSDisplay
 */
FPSDisplay.totalItems = 0;

/**
 * The current time.
 * @type {number}
 * @private
 * @memberof FPSDisplay
 */
FPSDisplay._time = Date.now();

/**
 * The time at the last frame.
 * @type {number}
 * @private
 * @memberof FPSDisplay
 */
FPSDisplay._timeLastFrame = FPSDisplay._time;

/**
 * The time the last second was sampled.
 * @type {number}
 * @private
 * @memberof FPSDisplay
 */
FPSDisplay._timeLastSecond = FPSDisplay._time;

/**
 * Holds the total number of frames
 * between seconds.
 * @type {number}
 * @private
 * @memberof FPSDisplay
 */
FPSDisplay._frameCount = 0;

/**
 * Initializes the FPSDisplay.
 * @function update
 * @memberof FPSDisplay
 */
FPSDisplay.init = function() {

  if (this.el) { // should only create one instance of FPSDisplay.
    return;
  }

  this.active = true;

  /**
   * A reference to the DOM element containing the display.
   * @private
   */
  this.el = document.createElement('div');
  this.el.id = 'FPSDisplay';
  this.el.className = 'fpsDisplay';
  this.el.style.backgroundColor = 'black';
  this.el.style.color = 'white';
  this.el.style.fontFamily = 'Helvetica';
  this.el.style.padding = '0.5em';
  this.el.style.opacity = '0.5';
  this.el.style.position = 'fixed';
  this.el.style.top = 0;
  this.el.style.right = 0;
  this.el.style.left = 0;
  this.el.style.zIndex = 1000;


  // create totol elements label
  var labelContainer = document.createElement('span');
  labelContainer.className = 'fpsDisplayLabel';
  labelContainer.style.marginLeft = '0.5em';
  label = document.createTextNode('total elements: ');
  labelContainer.appendChild(label);
  this.el.appendChild(labelContainer);

  // create textNode for totalElements
  this.totalElementsValue = document.createTextNode('0');
  this.el.appendChild(this.totalElementsValue);

  // create fps label
  labelContainer = document.createElement('span');
  labelContainer.className = 'fpsDisplayLabel';
  labelContainer.style.marginLeft = '0.5em';
  var label = document.createTextNode('fps: ');
  labelContainer.appendChild(label);
  this.el.appendChild(labelContainer);

  // create textNode for fps
  this.fpsValue = document.createTextNode('0');
  this.el.appendChild(this.fpsValue);

  document.body.appendChild(this.el);

};

/**
 * If 1000ms have elapsed since the last evaluated second,
 * fps is assigned the total number of frames rendered and
 * its corresponding textNode is updated. The total number of
 * elements is also updated.
 *
 * @function update
 * @memberof FPSDisplay
 * @param {Number} [opt_totalItems] The total items in the system.
 */
FPSDisplay.update = function(opt_totalItems) {

  this.totalItems = opt_totalItems || 0;

  this._time = Date.now();
  this._frameCount++;

  // at least a second has passed
  if (this._time > this._timeLastSecond + 1000) {

    this.fps = this._frameCount;
    this._timeLastSecond = this._time;
    this._frameCount = 0;

    this.fpsValue.nodeValue = this.fps;
    this.totalElementsValue.nodeValue = this.totalItems;
  }
};

/**
 * Hides FPSDisplay from DOM.
 * @function hide
 * @memberof FPSDisplay
 */
FPSDisplay.hide = function() {
  this.el.style.display = 'none';
  FPSDisplay.active = false;
};

/**
 * Shows FPSDisplay from DOM.
 * @function show
 * @memberof FPSDisplay
 */
FPSDisplay.show = function() {
  this.el.style.display = 'block';
  FPSDisplay.active = true;
};

module.exports = FPSDisplay;

},{}],2:[function(require,module,exports){
var Item = require('./item');
var System = require('./system');
var Utils = require('burner').Utils;
var Vector = require('burner').Vector;

/**
 * Creates a new Anim. Use for frame-based animation in a
 * Bit-Shadow Machine rendering.
 *
 * An Anim is a simple hidden point with a 'frames' property
 * that describes additional Bit-Shadows to position relative
 * to the Anim's location. An Anim also has an advanceFrame
 * method that cycles through all entries in the frames property.
 *
 * @constructor
 */
function Anim() {
  Item.call(this);
}
Utils.extend(Anim, Item);

/**
 * Initializes the Anim.
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {number} [opt_options.scale = 0] Scale. Set to a higher value for debugging.
 * @param {Array} [opt_options.color = [0, 0, 0]] Color. Set color for debugging if scale > 0.
 * @param {number} [opt_options.zIndex = 0] zIndex. Set to a higher value to place this pixel on a higher layer.
 * @param {Object} [opt_options.location = new Vector] Location.
 * @param {Array} [opt_options.frames = []] The frames to animate.
 * @param {number} [opt_options.currentFrame = 0] The current animation frame.
 *
 * @example The 'frames' property should be formatted like:
 * var frames = [
 *   {"items":
 *     [
 *       {"x": 9, "y": -30, "color": [255, 255, 255], "opacity": 1, "scale": 1},
 *       {"x": 17,"y": -30, "color": [255, 255, 255], "opacity": 1, "scale": 1}
 *     ]
 *   }
 * ];
 */
Anim.prototype.init = function(world, opt_options) {
  Anim._superClass.init.call(this, world, opt_options);

  var options = opt_options || {};

  /*
   * At scale = 0, the origin point will be hidden. Set scale and
   * color for help w debugging.
   */
  this.scale = options.scale || 0;
  this.color = options.color || [0, 0, 0];
  this.location = options.location || new Vector(this.world.width / 2, this.world.height / 2);

  this.frames = options.frames || [];
  this.currentFrame = typeof options.currentFrame !== 'undefined' ? options.currentFrame : 0;
  this.loop = typeof options.loop !== 'undefined' ? options.loop : true;

  this.frameDuration = options.frameDuration || 3;

  /**
   * Anim instances must be stored in System._records.list at a lower index
   * than their associated AnimUnit instance. If System.zSorted = true,
   * we sort System._records.list by zIndex. Since Anim instances are
   * invisible (while their AnimUnits are rendered), we can force a negative
   * zIndex and keep them at the bottom of System._records.list.
   */
  this.zIndex = -options.zIndex || -1;

  /**
   * The internal frame count that is checked against
   * frameDuration to see if we should advance the frame.
   * @private
   */
  this._frameCount = this.frameDuration;

};


/**
 * Checks internal frame count agaist frameDuration to see if we
 * should advance the frame.
 */
Anim.prototype.step = function() {

  if (this._frameCount < this.frameDuration) {
    this._frameCount++;
  } else {
    this.advanceFrame();
    this._frameCount = 0;
  }
};

/*
 * Loops thru all entries in the 'frames' property and
 * creates instances of AnimUnit.
 */
Anim.prototype.advanceFrame = function() {

  var i, max, animUnits, item, frame;

  // create new anim pixels
  if (this.frames.length) {
    frame = this.frames[this.currentFrame];
    for (i = 0, max = frame.items.length; i < max; i++) {
      item = frame.items[i];
      System.add('AnimUnit', {
        location: new Vector(this.location.x + item.x, this.location.y + item.y),
        color: item.color,
        scale: 1,
        opacity: item.opacity,
        parent: this,
        zIndex: -this.zIndex // reverse the zIndex value so the intended value is passed to the AnimUnit
      }, this.world);
    }
  }

  if (this.currentFrame + 1 < this.frames.length) {
    this.currentFrame++;
  } else if (this.loop) {
    this.currentFrame = 0;
  }
};

module.exports = Anim;


},{"./item":4,"./system":6,"burner":14}],3:[function(require,module,exports){
var Item = require('./item');
var System = require('./system');
var Utils = require('burner').Utils;

/**
 * Creates a new AnimUnit.
 *
 * An AnimUnit occupies a location in an animation frame. Typically,
 * called from Anim and passed a location, scale and color.
 * @constructor
 */
function AnimUnit() {
  Item.call(this);
}
Utils.extend(AnimUnit, Item);

/**
 * Initializes the AnimUnit.
 * @param {Object} world A world.
 * @param {Object} options Initial options.
 */
AnimUnit.prototype.init = function(world, options) {
  if (!options.parent || !options.location) {
    throw new Error('AnimUnit.init: parent amd location required.');
  }
  AnimUnit._superClass.init.call(this, world, options);

  this.parent = options.parent;
  this.location = options.location;
  this.scale = options.scale || 1;
  this.color = options.color || [100, 100, 100];
  this.zIndex = options.zIndex || 1; // the default value must be > 0
  this.currentFrame = 0;
};

/**
 * Checks if parent Anim is advancing the frame. If so,
 * this object destoys itself.
 * @returns {number} Total system records.
 */
AnimUnit.prototype.step = function() {
  if (this.parent._frameCount >= this.parent.frameDuration) {
    System.remove(this);
    return System._records.length;
  }
};

module.exports = AnimUnit;
},{"./item":4,"./system":6,"burner":14}],4:[function(require,module,exports){
/*global document */
var Vector = require('burner').Vector;

/**
 * Creates a new Item.
 * @constructor
 * @param {string} opt_name The item's class name.
 */
function Item() {
  Item._idCount++;
}

/**
 * Holds a count of item instances.
 * @memberof Item
 * @private
 */
Item._idCount = 0;

/**
 * Resets all properties.
 * @function init
 * @memberof Item
 *
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {number} [opt_options.name = 'Item'] The item's name.
 * @param {number} [opt_options.blur = 0] Blur.
 * @param {number} [opt_options.scale = 1] Scale.
 * @param {number} [opt_options.angle = 0] Angle.
 * @param {Array} [opt_options.colorMode = 'rgb'] Color mode. Possible values are 'rgb' and 'hsl'.
 * @param {Array} [opt_options.color = 200, 200, 200] Color.
 * @param {Array} [opt_options.opacity = 1] opacity.
 * @param {Array} [opt_options.zIndex = 0] zIndex.
 * @param {number} [opt_options.mass = 10] mass.
 * @param {Function|Object} [opt_options.acceleration = new Vector()] acceleration.
 * @param {Function|Object} [opt_options.velocity = new Vector()] velocity.
 * @param {Function|Object} [opt_options.location = new Vector()] location.
 * @param {number} [opt_options.maxSpeed = 10] maxSpeed.
 * @param {number} [opt_options.minSpeed = 0] minSpeed.
 * @param {bounciness} [opt_options.bounciness = 0] bounciness.
 * @param {number} [opt_options.life = 0] life.
 * @param {number} [opt_options.lifespan = -1] lifespan.
 * @param {boolean} [opt_options.checkWorldEdges = true] Set to true to check for world boundary collisions.
 * @param {boolean} [opt_options.wrapWorldEdges = false] Set to true to check for world boundary collisions and position item at the opposing boundary.
 * @param {Function} [opt_options.beforeStep = function() {}] This function will be called at the beginning of the item's step() function.
 * @param {Function} [opt_options.afterStep = function() {}] This function will be called at the end of the item's step() function.
 */
Item.prototype.init = function(world, opt_options) {

  if (!world || typeof world !== 'object') {
    throw new Error('Item requires an instance of World.');
  }

  this.world = world;

  var options = opt_options || {};

  this.name = typeof this.name !== 'undefined' ? this.name :
      options.name || 'Item';

  this.blur = typeof this.blur !== 'undefined' ? this.blur :
      options.blur || 0;

  this.scale = typeof this.scale !== 'undefined' ? this.scale :
      typeof options.scale === 'undefined' ? 1 : options.scale;

  this.angle = typeof this.angle !== 'undefined' ? this.angle :
      options.angle || 0;

  this.colorMode = typeof this.colorMode !== 'undefined' ? this.colorMode :
      options.colorMode || 'rgb';

  this.color = typeof this.color !== 'undefined' ? this.color :
      options.color || [200, 200, 200];

  this.opacity = typeof this.opacity !== 'undefined' ? this.opacity :
      typeof options.opacity === 'undefined' ? 1 : options.opacity;

  this.zIndex = typeof this.zIndex !== 'undefined' ? this.zIndex :
      options.zIndex || 0;

  //

  this.mass = typeof this.mass !== 'undefined' ? this.mass :
      typeof options.mass === 'undefined' ? 10 : options.mass;

  this.acceleration = typeof this.acceleration !== 'undefined' ? this.acceleration :
      options.acceleration || new Vector();

  this.velocity = typeof this.velocity !== 'undefined' ? this.velocity :
      options.velocity || new Vector();

  this.location = typeof this.location !== 'undefined' ? this.location :
      options.location || new Vector(this.world.width / 2, this.world.height / 2);

  this.maxSpeed = typeof this.maxSpeed !== 'undefined' ? this.maxSpeed :
      typeof options.maxSpeed === 'undefined' ? 10 : options.maxSpeed;

  this.minSpeed = typeof this.minSpeed !== 'undefined' ? this.minSpeed :
      options.minSpeed || 0;

  this.bounciness = typeof this.bounciness !== 'undefined' ? this.bounciness :
      typeof options.bounciness === 'undefined' ? 0.5 : options.bounciness;

  this.life = typeof this.life !== 'undefined' ? this.life :
      options.life || 0;

  this.lifespan = typeof this.lifespan !== 'undefined' ? this.lifespan :
      typeof options.lifespan === 'undefined' ? -1 : options.lifespan;

  this.checkWorldEdges = typeof this.checkWorldEdges !== 'undefined' ? this.checkWorldEdges :
      typeof options.checkWorldEdges === 'undefined' ? true : options.checkWorldEdges;

  this.wrapWorldEdges = typeof this.wrapWorldEdges !== 'undefined' ? this.wrapWorldEdges :
      !!options.wrapWorldEdges;

  this.beforeStep = typeof this.beforeStep !== 'undefined' ? this.beforeStep :
      options.beforeStep || function() {};

  this.afterStep = typeof this.afterStep !== 'undefined' ? this.afterStep :
      options.afterStep || function() {};

  this._force = this._force || new Vector();

  this.id = this.name + Item._idCount;

};

/**
 * Applies forces to item.
 * @function step
 * @memberof Item
 */
Item.prototype.step = function() {

  var x = this.location.x,
      y = this.location.y;

  this.beforeStep.call(this);
  this.applyForce(this.world.gravity);
  this.applyForce(this.world.wind);
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxSpeed, this.minSpeed);
  this.location.add(this.velocity);
  if (this.checkWorldEdges) {
    this._checkWorldEdges();
  } else if (this.wrapWorldEdges) {
    this._wrapWorldEdges();
  }
  this.acceleration.mult(0);
  this.afterStep.call(this);
};

/**
 * Adds a force to this object's acceleration.
 * @function applyForce
 * @memberof Item
 * @param {Object} force A Vector representing a force to apply.
 * @returns {Object} A Vector representing a new acceleration.
 */
Item.prototype.applyForce = function(force) {
  // calculated via F = m * a
  if (force) {
    this._force.x = force.x;
    this._force.y = force.y;
    this._force.div(this.mass);
    this.acceleration.add(this._force);
    return this.acceleration;
  }
};

/**
 * Prevents object from moving beyond world bounds.
 * @function _checkWorldEdges
 * @memberof Item
 * @private
 */
Item.prototype._checkWorldEdges = function() {

  if (this.location.y < 0) { // top
    this.velocity.y *= -this.bounciness;
    this.location.y = 0;
    return;
  }

  if (this.location.x > this.world.width) { // right
    this.velocity.x *= -this.bounciness;
    this.location.x = this.world.width;
    return;
  }

  if (this.location.y > this.world.height) { // bottom
    this.velocity.y *= -this.bounciness;
    this.location.y = this.world.height;
    return;
  }

  if (this.location.x < 0) { // left
    this.velocity.x *= -this.bounciness;
    this.location.x = 0;
    return;
  }
};

/**
 * If item moves beyond world bounds, position's object at the opposite boundary.
 * @function _wrapWorldEdges
 * @memberof Item
 * @private
 */
Item.prototype._wrapWorldEdges = function() {

  if (this.location.y < 0) { // top
    this.location.y = this.world.height;
    return;
  }

  if (this.location.x > this.world.width) { // right
    this.location.x = 0;
    return;
  }

  if (this.location.y > this.world.height) { // bottom
    this.location.y = 0;
    return;
  }

  if (this.location.x < 0) { // left
    this.location.x = this.world.width;
    return;
  }
};

module.exports = Item;

},{"burner":14}],5:[function(require,module,exports){
var BitShadowMachine = {
  Anim: require('./anim'),
  Item: require('./item'),
  SimplexNoise: require('quietriot'),
  System: require('./system'),
  Vector: require('burner').Vector,
  Utils: require('burner').Utils
};

BitShadowMachine.System.Classes = {
  Anim: require('./anim'),
  AnimUnit: require('./animunit')
};

module.exports = BitShadowMachine;
},{"./anim":2,"./animunit":3,"./item":4,"./system":6,"burner":14,"quietriot":19}],6:[function(require,module,exports){
/*global window, document */
/*jshint supernew:true */

var Item = require('./item');
var FPSDisplay = require('fpsdisplay');
var Utils = require('burner').Utils;
var Vector = require('burner').Vector;
var World = require('./world');

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

/** @namespace */
var System = {
  name: 'System'
};

/**
 * Holds additional classes that can be defined at runtime.
 * @memberof System
 */
System.Classes = {
  'Item': Item
};

/**
 * Holds a vector describing the system gravity.
 * @memberof System
 */
System.gravity = new Vector(0, 1);

/**
 * Holds a vector describing the system wind.
 * @memberof System
 */
System.wind = new Vector();

/**
 * Stores references to all items in the system.
 * @memberof System
 * @private
 */
System._records = [];

/**
 * Stores references to all items removed from the system.
 * @memberof System
 * @private
 */
System._pool = [];

/**
 * Holds the current and last mouse/touch positions relative
 * to the browser window. Also, holds the current mouse velocity.
 * @public
 */
System.mouse = {
  location: new Vector(),
  lastLocation: new Vector(),
  velocity: new Vector()
};

/**
 * Increments with each call to System.loop.
 * @type {number}
 * @private
 */
System.clock = 0;

/**
 * System.loop() calls this function. Use to execute
 * a function in the animation loop outside of any items.
 * @type {Function}
 * @private
 */
System.frameFunction = null;

/**
 * Stores references to all buffers in the system.
 * @private
 */
System._buffers = {};

/**
 * Set to 1 to sort System._records.list by zIndex.
 * @type Number
 */
System.zSort = 0;

/**
 * Set to true to save properties defined in System.saveItemProperties from
 * each object in each frame.
 * @type boolean
 */
System.saveData = false;

/**
 * Recording starts with this frame number.
 * @type number
 */
System.saveStartFrame = -1;

/**
 * Recording ends with this frame number.
 * @type number
 */
System.saveEndFrame = -1;

/**
 * Time in milliseconds to wait before calling animation loop.
 * @type number
 */
System.saveDataTimeoutLength = 500;

/**
 * Defines the properties to save in System.data for each item
 * in each frame.
 * @type Object
 */
System.saveItemProperties = {
  id: true,
  name: true,
  scale: true,
  location: true,
  velocity: true,
  angle: true,
  minSpeed: true,
  maxSpeed: true,
  hue: true,
  saturation: true,
  lightness: true,
  color: true,
  opacity: true
};

/**
 * Defines the properties to save in System.data for each world
 * in each frame.
 * @type Object
 */
System.saveWorldProperties = {
  id: true,
  name: true,
  width: true,
  height: true,
  color: true,
  resolution: true,
  colorMode: true
};

/**
 * Stores properties from each object in each frame.
 * @type Array
 * @example
 [
    {
      frame: 0,
      items: [
        {},
        {},
        ...
      ]
    }
 ]
 */
System.data = null;

/**
 * Returns all worlds.
 *
 * @function getAllWorlds
 * @memberof System
 * @return {Array.<Buffer>} An array of worlds.
 */
System.getAllWorlds = function() {
  return System.getAllItemsByName('World');
};

/**
 * Returns all buffers.
 *
 * @function getAllBuffers
 * @memberof System
 * @return {Array.<Buffer>} An array of buffers.
 */
System.getAllBuffers = function() {
  return System._buffers;
};

 /**
  * Call to execute any setup code before starting the animation loop.
  * @function setup
  * @param  {Object} opt_func   A function to run before the function exits.
  * @memberof System
  */
System.setup = function(opt_func) {

  var func = opt_func || function() {}, i, l, max;

  document.body.onorientationchange = System.updateOrientation;

  // save the current and last mouse position
  Utils.addEvent(document, 'mousemove', System._recordMouseLoc);

  // save the current and last touch position
  Utils.addEvent(window, 'touchstart', System._recordMouseLoc);
  Utils.addEvent(window, 'touchmove', System._recordMouseLoc);
  Utils.addEvent(window, 'touchend', System._recordMouseLoc);

  // listen for key up
  Utils.addEvent(window, 'keyup', System._keyup);

  // save the setup callback in case we need to reset the system.
  System.setupFunc = func;

  System.setupFunc.call(this);
};

/**
 * Adds instances of class to _records and calls init on them.
 * @function add
 * @memberof System
 * @param {string} [opt_klass = 'Item'] The name of the class to add.
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {Object} [opt_world = System._records[0]] An instance of World to contain the item.
 * @returns {Object} An instance of the added item.
 */
System.add = function(opt_klass, opt_options, opt_world) {

  var klass = opt_klass || 'Item',
      options = opt_options || {},
      world = opt_world || System.firstWorld(),
      records = this._records, obj;

  // recycle object if one is available; obj must be an instance of the same class
  for (var i = 0, max = System._pool.length; i < max; i++) {
    if (System._pool[i].name === klass) {
      obj = System._cleanObj(System._pool.splice(i, 1)[0]);
      break;
    }
  }

  if (!obj) {
    if (klass.toLowerCase() === 'world') {
      obj = new World(options);
    } else if (System.Classes[klass]) {
      obj = new System.Classes[klass](options);
    } else {
      obj = new Item();
    }
  }

  options.name = klass;
  obj.init(world, options);
  records.push(obj);
  return obj;
};

/**
 * Removes all properties from the passed object.
 * @param  {Object} obj An object.
 * @return {Object}     The passed object.
 */
System._cleanObj = function(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      delete obj[prop];
    }
  }
  return obj;
};

/**
 * Removes an item from the system.
 * @function remove
 * @memberof System
 * @param {Object} obj The item to remove.
 */
System.remove = function (obj) {

  var i, max, records = System._records;

  for (i = 0, max = records.length; i < max; i++) {
    if (records[i].id === obj.id) {
      if (records[i].el) {
        records[i].el.style.visibility = 'hidden'; // hide item
      }
      System._pool[System._pool.length] = records.splice(i, 1)[0]; // move record to pool array
      break;
    }
  }
};

/**
 * Iterates over records.
 * @param {Function} [opt_function=function(){}] A function.
 * @function loop
 * @memberof System
 */
System.loop = function(opt_function) {

  var i, record, records = System._records,
      len = System._records.length,
      frameFunction = opt_function || function() {},
      worlds = System.getAllWorlds(),
      buffers = System.getAllBuffers(),
      shadows = '';

  if (!System.frameFunction) {
    System.frameFunction = frameFunction;
  }

  // check if we've exceeded totalFrames
  if (System.checkFramesSaved()) {
    return;
  }

  // setup entry in System.data
  if (System.saveData) {
    System.data = System._resetData();
  }

  for (i = len - 1; i >= 0; i -= 1) {

    record = records[i];

    if (record && record.step && !record.world.pauseStep) {

      if (record.life < record.lifespan) {
        record.life += 1;
      } else if (record.lifespan !== -1) {
        System.remove(record);
        continue;
      }

      if (record instanceof World) {
        System._buffers[record.id] = '';
      }

      record.step();

      if (System.saveData && record.name !== 'World' && record.opacity) { // we don't want to record World data as Item
        if (!System._checkSaveFrame()) {
          continue;
        }
        System._saveItemProperties(System.data.items.length, record);
      }
    }
  }

  if (System.zSort) {
    records = records.sort(function(a,b){return (a.zIndex - b.zIndex);});
  }

  len = System._records.length; // check length in case items were removed in step()

  // loop thru records and build box shadows
  for (i = records.length - 1; i >= 0; i -= 1) {
    record = records[i];
    if (record.world && record.location && record.opacity && !(record instanceof World)) {

      shadows = buffers[record.world.id];

      if (record.world.colorMode === 'rgb' && record.color) {
        shadows = shadows + System._buildStringRGBA(record);
      } else if (record.world.colorMode === 'hsl' && record.color) {
        shadows = shadows + System._buildStringHSLA(record);
      } else {
        throw new Error('System: current color mode not supported.');
      }
      buffers[record.world.id] = shadows;
    }
  }

  // loop thru worlds and apply box shadow
  for (i = worlds.length - 1; i >= 0; i -= 1) {
    world = worlds[i];
    style = world.el.style;
    buffer = buffers[world.id];
    buffers[worlds[i].id] = ''; // clear buffer
    style.boxShadow = buffer.substr(0, buffer.length - 1); // remove the last comma
    style.borderRadius = world.borderRadius + '%';
  }

  // check to call frame complete callback.
  if (System.saveData && System._checkSaveFrame()) {
    System.saveDataComplete(System.clock, System.data);
  }
  System.clock++;
  if (FPSDisplay.active) { // TODO: test this
    FPSDisplay.update(len);
  }
  System.frameFunction.call(this);
  if (typeof window.requestAnimationFrame !== 'undefined' && !System._checkSaveFrame()) {
    window.requestAnimationFrame(System.loop);
  } else {
    setTimeout(System.loop, System.saveDataTimeoutLength);
  }
};

/**
 * Called when frame has completed rendering. You should
 * override this function with your own handler.
 * @param {number} frameNumber The current frame number (System.clock).
 * @param {Object} data The data saved from the current frame.
 * @throws {Object} If not overridden.
 */
System.saveDataComplete = function(frameNumber, data) {
  throw new Error('System.saveDataComplete not implemented. Override this function.');
};

/**
 * Called if saveEndFrame - saveStartFrame exceeds System.clock.
 */
System.totalFramesCallback = function() {
  var totalFrames = System.saveEndFrame - System.saveStartFrame;
  console.log('Rendered ' + totalFrames + ' frames.');
};

/**
 * Checks if the System recorded the total number of frames.
 * @return {boolean} True if system has recorded the total number of frames.
 */
System.checkFramesSaved = function() {
  var totalFrames = System.saveEndFrame - System.saveStartFrame;
  if (totalFrames > 0 && System.clock >= System.saveEndFrame) {
    System.totalFramesCallback();
    return true;
  }
};

/**
 * Checks if System.clock is within bounds.
 * @returns {Boolean} True if frame should be recorded.
 */
System._checkSaveFrame = function() {
  if (System.clock >= System.saveStartFrame && System.clock <= System.saveEndFrame) {
    return true;
  }
};

/**
 * Resets System.data.
 */
System._resetData = function() {
  return {
    frame: System.clock,
    world: {},
    items: []
  };
};

/**
 * Saves properties of the passed record that match properties
 * defined in System.saveItemProperties.
 * @param {number} index The array index for this object.
 * @param {Object} record An Item instance.
 */
System._saveItemProperties = function(index, record) {

  for (var i in record) {
    if (record.hasOwnProperty(i) && System.saveItemProperties[i]) {
      var val = record[i];
      if (val instanceof Vector) { // we want to copy the scalar values out of the Vector
        val = {
          x: parseFloat(record[i].x.toFixed(2), 10),
          y: parseFloat(record[i].y.toFixed(2), 10)
        };
      }
      if (typeof val === 'number') {
        val = parseFloat(val.toFixed(2), 10);
      }
      var frame = System.data;
      var item = frame.items[index];
      if (typeof item !== 'object') {
        frame.items[index] = {};
      }
      frame.items[index][i] = val;
    }
    if (!System.data.world.id) {
      for (var j in record.world) {
        if (record.world.hasOwnProperty(j) && System.saveWorldProperties[j]) {
          System.data.world[j] = record.world[j];
        }
      }
    }
  }
};

// TODO: implement step forward function
/**
 * Pauses the system and processes one step in records.
 *
 * @function _stepForward
 * @memberof System
 * @private
 */
/*System._stepForward = function() {

  var i, j, max, records = System._records,
      world, worlds = System.getAllWorlds();

  System.clock++;
};*/

/**
 * Builds an hsla box shadow string based on the passed
 * object's properties.
 * @private
 */
System._buildStringHSLA = function(item) {

    var resolution = item.world.resolution,
        loc = item.location;

    return (loc.x * resolution) + 'px ' + // left offset
        (loc.y * resolution) + 'px ' + // right offset
        item.blur + 'px ' + // blur
        (resolution * item.scale) + 'px ' + // spread
        'hsla(' + item.color[0] + ',' + (item.color[1] * 100) + '%,' + (item.color[2] * 100) + '%' + // color
        ', ' + item.opacity + '),'; // opacity
};

/**
 * Builds an rgba box shadow string based on the passed
 * object's properties.
 * @private
 */
System._buildStringRGBA = function(item) {

    var resolution = item.world.resolution,
        loc = item.location;

    return (loc.x * resolution) + 'px ' + // left offset
        (loc.y * resolution) + 'px ' + // right offset
        item.blur + 'px ' + // blur
        (resolution * item.scale) + 'px ' + // spread
        'rgba(' + item.color[0] + ',' + item.color[1] + ',' + item.color[2] + // color
        ', ' + item.opacity + '),'; // opacity
};

/**
 * Saves the mouse/touch location relative to the browser window.
 *
 * @function _recordMouseLoc
 * @memberof System
 * @private
 */
System._recordMouseLoc = function(e) {

  var touch, world = System.firstWorld();

  System.mouse.lastLocation.x = System.mouse.location.x;
  System.mouse.lastLocation.y = System.mouse.location.y;

  if (e.changedTouches) {
    touch = e.changedTouches[0];
  }

  /**
   * Mapping window size to world size allows us to
   * lead an agent around a world that's not bound
   * to the window.
   */
  if (e.pageX && e.pageY) {
    System.mouse.location.x = Utils.map(e.pageX, 0, window.innerWidth, 0, world.width);
    System.mouse.location.y = Utils.map(e.pageY, 0, window.innerHeight, 0, world.height);
  } else if (e.clientX && e.clientY) {
    System.mouse.location.x = Utils.map(e.clientX, 0, window.innerWidth, 0, world.width);
    System.mouse.location.y = Utils.map(e.clientY, 0, window.innerHeight, 0, world.height);
  } else if (touch) {
    System.mouse.location.x = touch.pageX;
    System.mouse.location.y = touch.pageY;
  }

  System.mouse.velocity.x = System.mouse.lastLocation.x - System.mouse.location.x;
  System.mouse.velocity.y = System.mouse.lastLocation.y - System.mouse.location.y;
};

/**
 * Returns the first world in the system.
 *
 * @function firstWorld
 * @memberof System
 * @returns {null|Object} An instance of World.
 */
System.firstWorld = function() {
  return this._records.length ? this._records[0] : null;
};

/**
 * Returns all worlds.
 *
 * @function allWorlds
 * @memberof System
 * @return {Array.<World>} An array of worlds.
 */
System.allWorlds = function() {
  return System.getAllItemsByName('World');
};

/**
 * Returns an array of items created from the same constructor.
 *
 * @function getAllItemsByName
 * @memberof System
 * @param {string} name The 'name' property.
 * @param {Array} [opt_list = this._records] An optional list of items.
 * @returns {Array} An array of items.
 */
System.getAllItemsByName = function(name, opt_list) {

  var i, max, arr = [],
      list = opt_list || this._records;

  for (i = 0, max = list.length; i < max; i++) {
    if (list[i].name === name) {
      arr[arr.length] = list[i];
    }
  }
  return arr;
};

/**
 * Returns an array of items with an attribute that matches the
 * passed 'attr'. If 'opt_val' is passed, 'attr' must equal 'val'.
 *
 * @function getAllItemsByAttribute
 * @memberof System
 * @param {string} attr The property to match.
 * @param {*} [opt_val=] The 'attr' parameter must equal this param.
 * @param {string} name The item's name property must equal this param.
 * @returns {Array} An array of items.
 */
System.getAllItemsByAttribute = function(attr, opt_val, opt_name) { // TODO: add test

  var i, max, arr = [], records = this._records,
      val = typeof opt_val !== 'undefined' ? opt_val : null,
      name = opt_name || false;

  for (i = 0, max = records.length; i < max; i++) {
    if (typeof records[i][attr] !== 'undefined') {
      if (val !== null && records[i][attr] !== val) {
        continue;
      }
      if (name && records[i].name !== name) {
        continue;
      }
      arr[arr.length] = records[i];
    }
  }
  return arr;
};

/**
 * Handles keyup events.
 *
 * @function _keyup
 * @memberof System
 * @private
 * @param {Object} e An event.
 */
System._keyup = function(e) {

  var i, max, world, worlds = System.allWorlds();

  switch(e.keyCode) {
    case 39:
      //System._stepForward();
      break;
    case 80: // p; pause/play
      for (i = 0, max = worlds.length; i < max; i++) {
        world = worlds[i];
        world.pauseStep = !world.pauseStep;
      }
      break;
    case 82: // r; reset
      System._resetSystem();
      break;
    case 83: // s; reset
      System._toggleStats();
      break;
  }
};

/**
 * Toggles stats display.
 *
 * @function _toggleStats
 * @memberof System
 * @private
 */
System._toggleStats = function() {

  if (!FPSDisplay.fps) {
    FPSDisplay.init();
  } else {
    FPSDisplay.active = !FPSDisplay.active;
  }

  if (!FPSDisplay.active) {
    FPSDisplay.hide();
  } else {
    FPSDisplay.show();
  }
};

/**
 * Resets the system.
 *
 * @function _resetSystem
 * @memberof System
 * @private
 */
System._resetSystem = function() {

  var i, max, worlds = System.allWorlds();

  for (i = 0, max = worlds.length; i < max; i++) {
    worlds[i].pauseStep = false;
  }

  System._records = [];
  System._pool = [];
  System.clock = 0;
  System.setup(System.setupFunc);
};

module.exports = System;

},{"./item":4,"./world":7,"burner":14,"fpsdisplay":1}],7:[function(require,module,exports){
var Item = require('./item');
var Utils = require('burner').Utils;
var Vector = require('burner').Vector;

/**
 * Creates a new World.
 *
 * @constructor
 */
function World() {
  Item.call(this);
  this.name = 'World';
  /**
   * Worlds do not have worlds. However, assigning an
   * object literal makes for less conditions in the
   * update loop.
   */
  this.world = {};
}
Utils.extend(World, Item);

/**
 * Resets all properties.
 * @function init
 * @memberof Item
 *
 * @param {Object} world A world.
 * @param {Object} [opt_options=] A map of initial properties.
 */
World.prototype.init = function(world, opt_options) {

  World._superClass.init.call(this, this.world, opt_options);

  var options = opt_options || {},
      viewportSize = Utils.getWindowSize();


  this.el = options.el || document.body;
  this.gravity = options.gravity || new Vector(0, 0.1);
  this.c = typeof options.c !== 'undefined' ? options.c : 0.1;
  this.pauseStep = !!options.pauseStep;
  this.pauseDraw = !!options.pauseDraw;
  this.el.className = this.name.toLowerCase();

  //

  this.resolution = options.resolution || 4;
  this.width = options.width / this.resolution || viewportSize.width / this.resolution;
  this.height = options.height / this.resolution || viewportSize.height / this.resolution;
  this.location = options.location || new Vector(((viewportSize.width - (this.width * this.resolution)) / 2),
      ((viewportSize.height - (this.height * this.resolution)) / 2));

  this.color = options.color || [0, 0, 0];

  //

  if (this.el !== document.body) {

    var container = document.createElement('div'),
        style = container.style;

    container.id = 'container_' + this.name.toLowerCase();
    container.className = 'worldContainer';
    style.left = this.location.x + 'px';
    style.top = this.location.y + 'px';
    style.width = this.width * this.resolution + 'px';
    style.height = this.height * this.resolution + 'px';
    style.zIndex = this.zIndex;
    style.backgroundColor = this.colorMode === 'rgb' ?
        'rgba(' + this.color[0] + ', ' + this.color[1] + ', ' + this.color[2] + ', ' + this.opacity + ')' :
        'hsla(' + this.color[0] + ', ' + (this.color[1] * 100) + '%, ' + (this.color[2] * 100) + '%, ' + this.opacity + ')';

    container.appendChild(this.el);

    document.body.appendChild(container);
  }
};

/**
 * A noop.
 * @function step
 * @memberof World
 */
World.prototype.step = function() {};

module.exports = World;

},{"./item":4,"burner":14}],8:[function(require,module,exports){
/*jshint supernew:true */
/** @namespace */
var Utils = {
  name: 'Utils'
};

/**
 * Extends the properties and methods of a superClass onto a subClass.
 *
 * @function extend
 * @memberof Utils
 * @param {Object} subClass The subClass.
 * @param {Object} superClass The superClass.
 */
Utils.extend = function(subClass, superClass) {
  function F() {}
  F.prototype = superClass.prototype;
  subClass.prototype = new F;
  subClass.prototype.constructor = subClass;
  subClass._superClass = superClass.prototype;
};

/**
 * Generates a psuedo-random number within an inclusive range.
 *
 * @function getRandomNumber
 * @memberof Utils
 * @param {number} low The low end of the range.
 * @param {number} high The high end of the range.
 * @param {boolean} [flt] Set to true to return a float or when passing floats as a range.
 * @returns {number} A number.
 */
Utils.getRandomNumber = function(low, high, flt) {
  if (flt) {
    return (Math.random() * (high - low)) + low;
  }
  high++;
  return Math.floor((Math.random() * (high - low))) + low;
};

/**
 * Determines the size of the browser window.
 *
 * @function extend
 * @memberof System
 * @returns {Object} The current browser window width and height.
 */
Utils.getWindowSize = function() {

  var d = {
    'width' : false,
    'height' : false
  };

  if (typeof(window.innerWidth) !== 'undefined') {
    d.width = window.innerWidth;
    d.height = window.innerHeight;
  } else if (typeof(document.documentElement) !== 'undefined' &&
      typeof(document.documentElement.clientWidth) !== 'undefined') {
    d.width = document.documentElement.clientWidth;
    d.height = document.documentElement.clientHeight;
  } else if (typeof(document.body) !== 'undefined') {
    d.width = document.body.clientWidth;
    d.height = document.body.clientHeight;
  }
  return d;
};

/**
 * Re-maps a number from one range to another.
 *
 * @function map
 * @memberof Utils
 * @param {number} value The value to be converted.
 * @param {number} min1 Lower bound of the value's current range.
 * @param {number} max1 Upper bound of the value's current range.
 * @param {number} min2 Lower bound of the value's target range.
 * @param {number} max2 Upper bound of the value's target range.
 * @returns {number} A number.
 */
Utils.map = function(value, min1, max1, min2, max2) { // returns a new value relative to a new range
  var unitratio = (value - min1) / (max1 - min1);
  return (unitratio * (max2 - min2)) + min2;
};

/**
 * Adds an event listener to a DOM element.
 *
 * @function _addEvent
 * @memberof System
 * @private
 * @param {Object} target The element to receive the event listener.
 * @param {string} eventType The event type.
 * @param {function} The function to run when the event is triggered.
 */
Utils.addEvent = function(target, eventType, handler) {
  if (target.addEventListener) { // W3C
    target.addEventListener(eventType, handler, false);
  } else if (target.attachEvent) { // IE
    target.attachEvent('on' + eventType, handler);
  }
};

/**
 * Converts degrees to radians.
 *
 * @function degreesToRadians
 * @memberof Utils
 * @param {number} degrees The degrees value to be converted.
 * @returns {number} A number in radians.
 */
Utils.degreesToRadians = function(degrees) {
  if (typeof degrees !== 'undefined') {
    return 2 * Math.PI * (degrees/360);
  } else {
    if (typeof console !== 'undefined') {
      throw new Error('Error: Utils.degreesToRadians is missing degrees param.');
    }
  }
};

/**
 * Converts radians to degrees.
 *
 * @function radiansToDegrees
 * @memberof Utils
 * @param {number} radians The radians value to be converted.
 * @returns {number} A number in degrees.
 */
Utils.radiansToDegrees = function(radians) {
  if (typeof radians !== 'undefined') {
    return radians * (180/Math.PI);
  } else {
    if (typeof console !== 'undefined') {
      throw new Error('Error: Utils.radiansToDegrees is missing radians param.');
    }
  }
};

/**
 * Constrain a value within a range.
 *
 * @function constrain
 * @memberof Utils
 * @param {number} val The value to constrain.
 * @param {number} low The lower bound of the range.
 * @param {number} high The upper bound of the range.
 * @returns {number} A number.
 */
Utils.constrain = function(val, low, high) {
  if (val > high) {
    return high;
  } else if (val < low) {
    return low;
  }
  return val;
};

/**
 * Determines if one object is inside another.
 *
 * @function isInside
 * @memberof Utils
 * @param {Object} obj The object.
 * @param {Object} container The containing object.
 * @returns {boolean} Returns true if the object is inside the container.
 */
Utils.isInside = function(obj, container) {
  if (!obj || !container) {
    throw new Error('isInside() requires both an object and a container.');
  }

  obj.width = obj.width || 0;
  obj.height = obj.height || 0;
  container.width = container.width || 0;
  container.height = container.height || 0;

  if (obj.location.x + obj.width / 2 > container.location.x - container.width / 2 &&
    obj.location.x - obj.width / 2 < container.location.x + container.width / 2 &&
    obj.location.y + obj.height / 2 > container.location.y - container.height / 2 &&
    obj.location.y - obj.height / 2 < container.location.y + container.height / 2) {
    return true;
  }
  return false;
};

/**
 * Capitalizes the first character in a string.
 *
 * @function capitalizeFirstLetter
 * @memberof Utils
 * @param {string} string The string to capitalize.
 * @returns {string} The string with the first character capitalized.
 */
Utils.capitalizeFirstLetter = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

module.exports = Utils;
},{}],9:[function(require,module,exports){
var Utils = require('drawing-utils-lib');

/**
 * Creates a new BorderPalette object.
 *
 * Use this class to create a palette of border styles.
 *
 * @param {string|number} [opt_id=] An optional id. If an id is not passed, a default id is created.
 * @constructor
 */
function BorderPalette(opt_id) {

  /**
   * Holds a list of border styles.
   * @private
   */
  this._borders = [];

  this.id = opt_id || BorderPalette._idCount;
  BorderPalette._idCount++; // increment id
}

/**
 * Increments as each BorderPalette is created.
 * @type number
 * @default 0
 * @private
 */
BorderPalette._idCount = 0;

BorderPalette.prototype.name = 'BorderPalette';

/**
 * Adds a random number of the passed border style to the 'borders' array.
 *
 * @param {Object} options A set of required options
 *    that includes:
 *    options.min {number} The minimum number of styles to add.
 *    options.max {number} The maximum number of styles to add.
 *    options.style {string} The border style.
 */
BorderPalette.prototype.addBorder = function(options) {

  if (!options.min || !options.max || !options.style) {
    throw new Error('BorderPalette.addBorder requires min, max and style paramaters.');
  }

  for (var i = 0, ln = Utils.getRandomNumber(options.min, options.max); i < ln; i++) {
    this._borders.push(options.style);
  }

  return this;
};

/**
 * @returns A style randomly selected from the 'borders' property.
 * @throws {Error} If the 'borders' property is empty.
 */
BorderPalette.prototype.getBorder = function() {

  if (this._borders.length > 0) {
    return this._borders[Utils.getRandomNumber(0, this._borders.length - 1)];
  }

  throw new Error('BorderPalette.getBorder: You must add borders via addBorder() before using getBorder().');
};

module.exports = BorderPalette;


},{"drawing-utils-lib":8}],10:[function(require,module,exports){
module.exports=require(8)
},{"/Users/vince/Dev/Foldi/Bit-Shadow-Items/node_modules/borderpalette/node_modules/drawing-utils-lib/src/drawing-utils-lib.js":8}],11:[function(require,module,exports){
module.exports=require(1)
},{"/Users/vince/Dev/Foldi/Bit-Shadow-Items/node_modules/bitshadowmachine/node_modules/fpsdisplay/src/fpsdisplay.js":1}],12:[function(require,module,exports){
/*global exports, Vector */
/*jshint supernew:true */


/**
 * Creates a new Vector.
 *
 * @param {number} [opt_x = 0] The x location.
 * @param {number} [opt_y = 0] The y location.
 * @constructor
 */
function Vector(opt_x, opt_y) {
  var x = opt_x || 0,
      y = opt_y || 0;
  this.x = x;
  this.y = y;
}

/**
 * Subtract two vectors.
 *
 * @param {number} v1 The first vector.
 * @param {number} v2 The second vector.
 * @returns {Object} A new Vector.
 */
Vector.VectorSub = function(v1, v2) {
  return new Vector(v1.x - v2.x, v1.y - v2.y);
};

/**
 * Add two vectors.
 *
 * @param {number} v1 The first vector.
 * @param {number} v2 The second vector.
 * @returns {Object} A new Vector.
 */
Vector.VectorAdd = function(v1, v2) {
  return new Vector(v1.x + v2.x, v1.y + v2.y);
};

/**
 * Multiply a vector by a scalar value.
 *
 * @param {number} v A vector.
 * @param {number} n Vector will be multiplied by this number.
 * @returns {Object} A new Vector.
 */
Vector.VectorMult = function(v, n) {
  return new Vector(v.x * n, v.y * n);
};

/**
 * Divide two vectors.
 *
 * @param {number} v A vector.
 * @param {number} n Vector will be divided by this number.
 * @returns {Object} A new Vector.
 */
Vector.VectorDiv = function(v, n) {
  return new Vector(v.x / n, v.y / n);
};

/**
 * Calculates the distance between two vectors.
 *
 * @param {number} v1 The first vector.
 * @param {number} v2 The second vector.
 * @returns {number} The distance between the two vectors.
 */
Vector.VectorDistance = function(v1, v2) {
  return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
};

/**
 * Get the midpoint between two vectors.
 *
 * @param {number} v1 The first vector.
 * @param {number} v2 The second vector.
 * @returns {Object} A new Vector.
 */
Vector.VectorMidPoint = function(v1, v2) {
  return Vector.VectorAdd(v1, v2).div(2); // midpoint = (v1 + v2)/2
};

/**
 * Get the angle between two vectors.
 *
 * @param {number} v1 The first vector.
 * @param {number} v2 The second vector.
 * @returns {number} An angle.
 */
Vector.VectorAngleBetween = function(v1, v2) {
  var dot = v1.dot(v2),
  theta = Math.acos(dot / (v1.mag() * v2.mag()));
  return theta;
};

Vector.prototype.name = 'Vector';

/**
* Returns an new vector with all properties and methods of the
* old vector copied to the new vector's prototype.
*
* @returns {Object} A vector.
*/
Vector.prototype.clone = function() {
  function F() {}
  F.prototype = this;
  return new F;
};

/**
 * Adds a vector to this vector.
 *
 * @param {Object} vector The vector to add.
 * @returns {Object} This vector.
 */
Vector.prototype.add = function(vector) {
  this.x += vector.x;
  this.y += vector.y;
  return this;
};

/**
 * Subtracts a vector from this vector.
 *
 * @param {Object} vector The vector to subtract.
 * @returns {Object} This vector.
 */
Vector.prototype.sub = function(vector) {
  this.x -= vector.x;
  this.y -= vector.y;
  return this;
};

/**
 * Multiplies this vector by a passed value.
 *
 * @param {number} n Vector will be multiplied by this number.
 * @returns {Object} This vector.
 */
Vector.prototype.mult = function(n) {
  this.x *= n;
  this.y *= n;
  return this;
};

/**
 * Divides this vector by a passed value.
 *
 * @param {number} n Vector will be divided by this number.
 * @returns {Object} This vector.
 */
Vector.prototype.div = function(n) {
  this.x = this.x / n;
  this.y = this.y / n;
  return this;
};

/**
 * Calculates the magnitude of this vector.
 *
 * @returns {number} The vector's magnitude.
 */
Vector.prototype.mag = function() {
  return Math.sqrt((this.x * this.x) + (this.y * this.y));
};

/**
 * Limits the vector's magnitude.
 *
 * @param {number} opt_high The upper bound of the vector's magnitude
 * @param {number} opt_low The lower bound of the vector's magnitude.
 * @returns {Object} This vector.
 */
Vector.prototype.limit = function(opt_high, opt_low) {
  var high = opt_high || null,
      low = opt_low || null;
  if (high && this.mag() > high) {
    this.normalize();
    this.mult(high);
  }
  if (low && this.mag() < low) {
    this.normalize();
    this.mult(low);
  }
  return this;
};

/**
 * Divides a vector by its magnitude to reduce its magnitude to 1.
 * Typically used to retrieve the direction of the vector for later manipulation.
 *
 * @returns {Object} This vector.
 */
Vector.prototype.normalize = function() {
  var m = this.mag();
  if (m !== 0) {
    return this.div(m);
  }
};

/**
 * Calculates the distance between this vector and a passed vector.
 *
 * @param {Object} vector The target vector.
 * @returns {Object} The distance between the two vectors.
 */
Vector.prototype.distance = function(vector) {
  return Math.sqrt(Math.pow(vector.x - this.x, 2) + Math.pow(vector.y - this.y, 2));
};

/**
 * Rotates a vector using a passed angle in radians.
 *
 * @param {number} radians The angle to rotate in radians.
 * @returns {Object} This vector.
 */
Vector.prototype.rotate = function(radians) {
  var cos = Math.cos(radians),
    sin = Math.sin(radians),
    x = this.x,
    y = this.y;

  this.x = x * cos - y * sin;
  this.y = x * sin + y * cos;
  return this;
};

/**
 * Calculates the midpoint between this vector and a passed vector.
 *
 * @param {Object} v1 The first vector.
 * @param {Object} v1 The second vector.
 * @returns {Object} A vector representing the midpoint between the passed vectors.
 */
Vector.prototype.midpoint = function(vector) {
  return Vector.VectorAdd(this, vector).div(2);
};

/**
 * Calulates the dot product.
 *
 * @param {Object} vector The target vector.
 * @returns {Object} A vector.
 */
Vector.prototype.dot = function(vector) {
  if (this.z && vector.z) {
    return this.x * vector.x + this.y * vector.y + this.z * vector.z;
  }
  return this.x * vector.x + this.y * vector.y;
};

module.exports = Vector;
},{}],13:[function(require,module,exports){
/*global document */

var Vector = require('vector2d-lib');

/**
 * Creates a new Item.
 * @constructor
 * @param {string} opt_name The item's class name.
 */
function Item() {
  Item._idCount++;
}

/**
 * Holds a count of item instances.
 * @memberof Item
 * @private
 */
Item._idCount = 0;

/**
 * Holds a transform property based on supportedFeatures.
 * @memberof Item
 * @private
 */
Item._stylePosition =
    'transform: translate3d(<x>px, <y>px, 0) rotate(<angle>deg) scale(<scale>, <scale>); ' +
    '-webkit-transform: translate3d(<x>px, <y>px, 0) rotate(<angle>deg) scale(<scale>, <scale>); ' +
    '-moz-transform: translate3d(<x>px, <y>px, 0) rotate(<angle>deg) scale(<scale>, <scale>); ' +
    '-o-transform: translate3d(<x>px, <y>px, 0) rotate(<angle>deg) scale(<scale>, <scale>); ' +
    '-ms-transform: translate3d(<x>px, <y>px, 0) rotate(<angle>deg) scale(<scale>, <scale>);';

/**
 * The base DOM element to use as the Item view.
 * @type {string}
 * @memberof Item
 * @private
 */
Item.baseElement = 'div';

/**
 * The base DOM element attributes.
 * @type {Object}
 * @memberof Item
 * @private
 */
Item.baseElementAttributes = {};

/**
 * Resets all properties.
 * @function init
 * @memberof Item
 *
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {number} [opt_options.name = 'Item'] The item's name.
 * @param {number} [opt_options.width = 10] Width.
 * @param {number} [opt_options.height = 10] Height.
 * @param {number} [opt_options.scale = 1] Scale.
 * @param {number} [opt_options.angle = 0] Angle.
 * @param {Array} [opt_options.colorMode = 'rgb'] Color mode. Possible values are 'rgb' and 'hsl'.
 * @param {Array} [opt_options.color = 200, 200, 200] Color.
 * @param {Array} [opt_options.borderWidth = 0] borderWidth.
 * @param {Array} [opt_options.borderStyle = 'none'] borderStyle.
 * @param {Array} [opt_options.borderColor = 255, 255, 255] borderColor.
 * @param {Array} [opt_options.borderRadius = 0] borderRadius.
 * @param {Array} [opt_options.boxShadowOffsetX = 0] boxShadowOffsetX.
 * @param {Array} [opt_options.boxShadowOffsetY = 0] boxShadowOffsetY.
 * @param {Array} [opt_options.boxShadowBlur = 0] boxShadowBlur.
 * @param {Array} [opt_options.boxShadowSpread = 0] boxShadowSpread.
 * @param {Array} [opt_options.boxShadowColor = 255, 255, 255] boxShadowColor.
 * @param {Array} [opt_options.opacity = 1] opacity.
 * @param {Array} [opt_options.zIndex = 0] zIndex.
 * @param {number} [opt_options.mass = 10] mass.
 * @param {Function|Object} [opt_options.acceleration = new Vector()] acceleration.
 * @param {Function|Object} [opt_options.velocity = new Vector()] velocity.
 * @param {Function|Object} [opt_options.location = new Vector()] location.
 * @param {number} [opt_options.maxSpeed = 10] maxSpeed.
 * @param {number} [opt_options.minSpeed = 0] minSpeed.
 * @param {bounciness} [opt_options.bounciness = 0] bounciness.
 * @param {number} [opt_options.life = 0] life.
 * @param {number} [opt_options.lifespan = -1] lifespan.
 * @param {boolean} [opt_options.checkWorldEdges = true] Set to true to check for world boundary collisions.
 * @param {boolean} [opt_options.wrapWorldEdges = false] Set to true to check for world boundary collisions and position item at the opposing boundary.
 * @param {Function} [opt_options.beforeStep = function() {}] This function will be called at the beginning of the item's step() function.
 * @param {Function} [opt_options.afterStep = function() {}] This function will be called at the end of the item's step() function.
 * @param {string} [opt_options.controlCamera = false] Set to true to set world's position relaive to this item.
 */
Item.prototype.init = function(world, opt_options) {

  if (!world || typeof world !== 'object') {
    throw new Error('Item requires an instance of World.');
  }

  this.world = world;

  var options = opt_options || {};

  this.name = typeof this.name !== 'undefined' ? this.name :
      options.name || 'Item';

  this.width = typeof this.width !== 'undefined' ? this.width :
      typeof options.width === 'undefined' ? 10 : options.width;

  this.height = typeof this.height !== 'undefined' ? this.height :
      typeof options.height === 'undefined' ? 10 : options.height;

  this.scale = typeof this.scale !== 'undefined' ? this.scale :
      typeof options.scale === 'undefined' ? 1 : options.scale;

  this.angle = typeof this.angle !== 'undefined' ? this.angle :
      options.angle || 0;

  this.colorMode = typeof this.colorMode !== 'undefined' ? this.colorMode :
      options.colorMode || 'rgb';

  this.color = typeof this.color !== 'undefined' ? this.color :
      options.color || [200, 200, 200];

  this.borderWidth = typeof this.borderWidth !== 'undefined' ? this.borderWidth :
      options.borderWidth || 0;

  this.borderStyle = typeof this.borderStyle !== 'undefined' ? this.borderStyle :
      options.borderStyle || 'none';

  this.borderColor = typeof this.borderColor !== 'undefined' ? this.borderColor :
      options.borderColor || [255, 255, 255];

  this.borderRadius = typeof this.borderRadius !== 'undefined' ? this.borderRadius :
      options.borderRadius || 0;

  this.boxShadowOffsetX = typeof this.boxShadowOffsetX !== 'undefined' ? this.boxShadowOffsetX :
      options.boxShadowOffsetX || 0;

  this.boxShadowOffsetY = typeof this.boxShadowOffsetY !== 'undefined' ? this.boxShadowOffsetY :
      options.boxShadowOffsetY || 0;

  this.boxShadowBlur = typeof this.boxShadowBlur !== 'undefined' ? this.boxShadowBlur :
      options.boxShadowBlur || 0;

  this.boxShadowSpread = typeof this.boxShadowSpread !== 'undefined' ? this.boxShadowSpread :
      options.boxShadowSpread || 0;

  this.boxShadowColor = typeof this.boxShadowColor !== 'undefined' ? this.boxShadowColor :
      options.boxShadowColor || [255, 255, 255];

  this.opacity = typeof this.opacity !== 'undefined' ? this.opacity :
      typeof options.opacity === 'undefined' ? 1 : options.opacity;

  this.zIndex = typeof this.zIndex !== 'undefined' ? this.zIndex :
      options.zIndex || 0;

  this.visibility = typeof this.visibility !== 'undefined' ? this.visibility :
      options.visibility || 'visible';

  this.mass = typeof this.mass !== 'undefined' ? this.mass :
      typeof options.mass === 'undefined' ? 10 : options.mass;

  this.acceleration = typeof this.acceleration !== 'undefined' ? this.acceleration :
      options.acceleration || new Vector();

  this.velocity = typeof this.velocity !== 'undefined' ? this.velocity :
      options.velocity || new Vector();

  this.location = typeof this.location !== 'undefined' ? this.location :
      options.location || new Vector(this.world.width / 2, this.world.height / 2);

  this.maxSpeed = typeof this.maxSpeed !== 'undefined' ? this.maxSpeed :
      typeof options.maxSpeed === 'undefined' ? 10 : options.maxSpeed;

  this.minSpeed = typeof this.minSpeed !== 'undefined' ? this.minSpeed :
      options.minSpeed || 0;

  this.bounciness = typeof this.bounciness !== 'undefined' ? this.bounciness :
      typeof options.bounciness === 'undefined' ? 0.5 : options.bounciness;

  this.life = typeof this.life !== 'undefined' ? this.life :
      options.life || 0;

  this.lifespan = typeof this.lifespan !== 'undefined' ? this.lifespan :
      typeof options.lifespan === 'undefined' ? -1 : options.lifespan;

  this.checkWorldEdges = typeof this.checkWorldEdges !== 'undefined' ? this.checkWorldEdges :
      typeof options.checkWorldEdges === 'undefined' ? true : options.checkWorldEdges;

  this.wrapWorldEdges = typeof this.wrapWorldEdges !== 'undefined' ? this.wrapWorldEdges :
      !!options.wrapWorldEdges;

  this.beforeStep = typeof this.beforeStep !== 'undefined' ? this.beforeStep :
      options.beforeStep || function() {};

  this.afterStep = typeof this.afterStep !== 'undefined' ? this.afterStep :
      options.afterStep || function() {};

  this.controlCamera = typeof this.controlCamera !== 'undefined' ? this.controlCamera :
      !!options.controlCamera;

  this._force = this._force || new Vector();

  this.id = this.name + Item._idCount;
  if (!this.el) {
    this.el = document.createElement(Item.baseElement);
    for (var i in Item.baseElementAttributes) {
      if (Item.baseElementAttributes.hasOwnProperty(i)) {
        this.el[i] = Item.baseElementAttributes[i];
      }
    }
    this.el.id = this.id;
    this.el.className = 'item ' + this.name.toLowerCase();
    this.el.style.position = 'absolute';
    this.el.style.top = '-5000px';
    this.world.add(this.el);
  }
};

/**
 * Applies forces to item.
 * @function step
 * @memberof Item
 */
Item.prototype.step = function() {

  var x = this.location.x,
      y = this.location.y;

  this.beforeStep.call(this);
  this.applyForce(this.world.gravity);
  this.applyForce(this.world.wind);
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxSpeed, this.minSpeed);
  this.location.add(this.velocity);
  if (this.checkWorldEdges) {
    this._checkWorldEdges();
  } else if (this.wrapWorldEdges) {
    this._wrapWorldEdges();
  }
  if (this.controlCamera) { // need the corrected velocity which is the difference bw old/new location
    this._checkCameraEdges(x, y, this.location.x, this.location.y);
  }
  this.acceleration.mult(0);
  this.afterStep.call(this);
};

/**
 * Adds a force to this object's acceleration.
 * @function applyForce
 * @memberof Item
 * @param {Object} force A Vector representing a force to apply.
 * @returns {Object} A Vector representing a new acceleration.
 */
Item.prototype.applyForce = function(force) {
  // calculated via F = m * a
  if (force) {
    this._force.x = force.x;
    this._force.y = force.y;
    this._force.div(this.mass);
    this.acceleration.add(this._force);
    return this.acceleration;
  }
};

/**
 * Prevents object from moving beyond world bounds.
 * @function _checkWorldEdges
 * @memberof Item
 * @private
 */
Item.prototype._checkWorldEdges = function() {

  var worldRight = this.world.width,
      worldBottom = this.world.height,
      location = this.location,
      velocity = this.velocity,
      width = this.width * this.scale,
      height = this.height * this.scale,
      bounciness = this.bounciness;

  if (location.x + width / 2 > worldRight) {
    location.x = worldRight - width / 2;
    velocity.x *= -1 * bounciness;
  } else if (location.x < width / 2) {
    location.x = width / 2;
    velocity.x *= -1 * bounciness;
  }

  if (location.y + height / 2 > worldBottom) {
    location.y = worldBottom - height / 2;
    velocity.y *= -1 * bounciness;
  } else if (location.y < height / 2) {
    location.y = height / 2;
    velocity.y *= -1 * bounciness;
  }
};

/**
 * If item moves beyond world bounds, position's object at the opposite boundary.
 * @function _wrapWorldEdges
 * @memberof Item
 * @private
 */
Item.prototype._wrapWorldEdges = function() {

  var worldRight = this.world.width,
      worldBottom = this.world.height,
      location = this.location,
      width = this.width * this.scale,
      height = this.height * this.scale;

  if (location.x - width / 2 > worldRight) {
    location.x = -width / 2;
  } else if (location.x < -width / 2) {
    location.x = worldRight + width / 2;
  }

  if (location.y - height / 2 > worldBottom) {
    location.y = -height / 2;
  } else if (location.y < -height / 2) {
    location.y = worldBottom + height / 2;
  }
};

/**
 * Moves the world in the opposite direction of the Camera's controlObj.
 */
Item.prototype._checkCameraEdges = function(lastX, lastY, x, y) {
  this.world._camera.x = lastX - x;
  this.world._camera.y = lastY - y;
};

/**
 * Updates the corresponding DOM element's style property.
 * @function draw
 * @memberof Item
 */
Item.prototype.draw = function() {
  var cssText = this.getCSSText({
    x: this.location.x - (this.width / 2),
    y: this.location.y - (this.height / 2),
    angle: this.angle,
    scale: this.scale || 1,
    width: this.width,
    height: this.height,
    colorMode: this.colorMode,
    color0: this.color[0],
    color1: this.color[1],
    color2: this.color[2],
    opacity: this.opacity,
    zIndex: this.zIndex,
    visibility: this.visibility
  });
  this.el.style.cssText = cssText;
};

/**
 * Concatenates a new cssText string.
 *
 * @function getCSSText
 * @memberof Item
 * @param {Object} props A map of object properties.
 * @returns {string} A string representing cssText.
 */
Item.prototype.getCSSText = function(props) {
  return Item._stylePosition.replace(/<x>/g, props.x).replace(/<y>/g, props.y).replace(/<angle>/g, props.angle).replace(/<scale>/g, props.scale) + 'width: ' + props.width + 'px; height: ' + props.height + 'px; background-color: ' + props.colorMode + '(' + props.color0 + ', ' + props.color1 + (props.colorMode === 'hsl' ? '%' : '') + ', ' + props.color2 + (props.colorMode === 'hsl' ? '%' : '') + '); opacity: ' + props.opacity + '; z-index: ' + props.zIndex + '; visibility: ' + props.visibility + ';';
};

module.exports = Item;

},{"vector2d-lib":12}],14:[function(require,module,exports){
module.exports = {
  Item: require('./item'),
  System: require('./system'),
  Utils: require('drawing-utils-lib'),
  Vector: require('vector2d-lib'),
  World: require('./world')
};

},{"./item":13,"./system":15,"./world":16,"drawing-utils-lib":10,"vector2d-lib":12}],15:[function(require,module,exports){
/*global window, document */
/*jshint supernew:true */

var Item = require('./item'),
    World = require('./world'),
    Vector = require('vector2d-lib'),
    Utils = require('drawing-utils-lib'),
    FPSDisplay = require('fpsdisplay');

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

/** @namespace */
var System = {
  name: 'System'
};

/**
 * Holds additional classes that can be defined at runtime.
 * @memberof System
 */
System.Classes = {
  'Item': Item
};

/**
 * Holds a vector describing the system gravity.
 * @memberof System
 */
System.gravity = new Vector(0, 1);

/**
 * Holds a vector describing the system wind.
 * @memberof System
 */
System.wind = new Vector();

/**
 * Stores references to all items in the system.
 * @memberof System
 * @private
 */
System._records = [];

/**
 * Stores references to all items removed from the system.
 * @memberof System
 * @private
 */
System._pool = [];

/**
 * Holds the current and last mouse/touch positions relative
 * to the browser window. Also, holds the current mouse velocity.
 * @public
 */
System.mouse = {
  location: new Vector(),
  lastLocation: new Vector(),
  velocity: new Vector()
};

/**
 * Increments with each call to System.loop.
 * @type {number}
 * @private
 */
System.clock = 0;

/**
 * System.loop() calls this function. Use to execute
 * a function in the animation loop outside of any items.
 * @type {Function}
 * @private
 */
System.frameFunction = null;

 /**
  * Call to execute any setup code before starting the animation loop.
  * @function setup
  * @param  {Object} opt_func   A function to run before the function exits.
  * @memberof System
  */
System.setup = function(opt_func) {

  var func = opt_func || function() {}, i, l, max;

  document.body.onorientationchange = System.updateOrientation;

  // save the current and last mouse position
  Utils.addEvent(document, 'mousemove', System._recordMouseLoc);

  // save the current and last touch position
  Utils.addEvent(window, 'touchstart', System._recordMouseLoc);
  Utils.addEvent(window, 'touchmove', System._recordMouseLoc);
  Utils.addEvent(window, 'touchend', System._recordMouseLoc);

  // listen for key up
  Utils.addEvent(window, 'keyup', System._keyup);

  // save the setup callback in case we need to reset the system.
  System.setupFunc = func;

  System.setupFunc.call(this);
};

 /**
  * Call to execute any setup code before starting the animation loop.
  * Note: Deprecated in v3. Use setup();
  * @function setup
  * @param  {Object} opt_func   A function to run before the function exits.
  * @param  {Object|Array} opt_worlds A instance or array of instances of World.
  * @memberof System
  */
System.init = function(opt_func, opt_worlds) {
  System.setup(opt_func, opt_worlds);
};

/**
 * Adds world to System records and worlds cache.
 *
 * @function _addWorld
 * @memberof System
 * @private
 * @param {Object} world An instance of World.
 */
System._addWorld = function(world) {
  System._records.push(world);
};

/**
 * Adds instances of class to _records and calls init on them.
 * @function add
 * @memberof System
 * @param {string} [opt_klass = 'Item'] The name of the class to add.
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {Object} [opt_world = System._records[0]] An instance of World to contain the item.
 * @returns {Object} An instance of the added item.
 */
System.add = function(opt_klass, opt_options, opt_world) {

  var klass = opt_klass || 'Item',
      options = opt_options || {},
      world = opt_world || System.firstWorld(),
      records = this._records, obj;

  // recycle object if one is available; obj must be an instance of the same class
  for (var i = 0, max = System._pool.length; i < max; i++) {
    if (System._pool[i].name === klass) {
      obj = System._cleanObj(System._pool.splice(i, 1)[0]);
      break;
    }
  }

  if (!obj) {
    if (klass.toLowerCase() === 'world') {
      obj = new World(options);
    } else if (System.Classes[klass]) {
      obj = new System.Classes[klass](options);
    } else {
      obj = new Item();
    }
  }

  options.name = klass;
  obj.init(world, options);
  records.push(obj);
  return obj;
};

/**
 * Removes all properties from the passed object.
 * @param  {Object} obj An object.
 * @return {Object}     The passed object.
 */
System._cleanObj = function(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      delete obj[prop];
    }
  }
  return obj;
};

/**
 * Removes an item from the system.
 * @function remove
 * @memberof System
 * @param {Object} obj The item to remove.
 */
System.remove = function (obj) {

  var i, max, records = System._records;

  for (i = 0, max = records.length; i < max; i++) {
    if (records[i].id === obj.id) {
      if (records[i].el) {
        records[i].el.style.visibility = 'hidden'; // hide item
      }
      System._pool[System._pool.length] = records.splice(i, 1)[0]; // move record to pool array
      break;
    }
  }
};

/**
 * Removes an item from the system.
 * Note: Deprecated in v3. Use remove().
 * @function remove
 * @memberof System
 * @param {Object} obj The item to remove.
 */
System.destroy = function (obj) {
  System.remove(obj);
};

/**
 * Iterates over records.
 * @param {Function} [opt_function=function(){}] A function.
 * @function loop
 * @memberof System
 */
System.loop = function(opt_function) {

  var i, records = System._records,
      len = System._records.length,
      frameFunction = opt_function || function() {};

  if (!System.frameFunction) {
    System.frameFunction = frameFunction;
  }

  for (i = len - 1; i >= 0; i -= 1) {

    if (records[i] && records[i].step && !records[i].world.pauseStep) {

      if (records[i].life < records[i].lifespan) {
        records[i].life += 1;
      } else if (records[i].lifespan !== -1) {
        System.remove(records[i]);
        continue;
      }
      records[i].step();
    }
  }
  len = System._records.length; // check length in case items were removed in step()
  for (i = len - 1; i >= 0; i -= 1) {
    records[i].draw();
  }
  System.clock++;
  if (FPSDisplay.active) {
    FPSDisplay.update(len);
  }
  System.frameFunction.call(this);
  if (typeof window.requestAnimationFrame !== 'undefined') {
    window.requestAnimationFrame(System.loop);
  }
};

/**
 * Pauses the system and processes one step in records.
 *
 * @function _stepForward
 * @memberof System
 * @private
 */
System._stepForward = function() {

  var i, j, max, records = System._records,
      world, worlds = System.allWorlds();

  for (i = 0, max = worlds.length; i < max; i++) {
    world = worlds[i];
    world.pauseStep = true;
    for (j = records.length - 1; j >= 0; j -= 1) {
      if (records[j].step) {
        records[j].step();
      }
    }
    for (j = records.length - 1; j >= 0; j -= 1) {
      if (records[j].draw) {
        records[j].draw();
      }
    }
  }
  System.clock++;
};

/**
 * Saves the mouse/touch location relative to the browser window.
 *
 * @function _recordMouseLoc
 * @memberof System
 * @private
 */
System._recordMouseLoc = function(e) {

  var touch, world = System.firstWorld();

  System.mouse.lastLocation.x = System.mouse.location.x;
  System.mouse.lastLocation.y = System.mouse.location.y;

  if (e.changedTouches) {
    touch = e.changedTouches[0];
  }

  /**
   * Mapping window size to world size allows us to
   * lead an agent around a world that's not bound
   * to the window.
   */
  if (e.pageX && e.pageY) {
    System.mouse.location.x = Utils.map(e.pageX, 0, window.innerWidth, 0, world.width);
    System.mouse.location.y = Utils.map(e.pageY, 0, window.innerHeight, 0, world.height);
  } else if (e.clientX && e.clientY) {
    System.mouse.location.x = Utils.map(e.clientX, 0, window.innerWidth, 0, world.width);
    System.mouse.location.y = Utils.map(e.clientY, 0, window.innerHeight, 0, world.height);
  } else if (touch) {
    System.mouse.location.x = touch.pageX;
    System.mouse.location.y = touch.pageY;
  }

  System.mouse.velocity.x = System.mouse.lastLocation.x - System.mouse.location.x;
  System.mouse.velocity.y = System.mouse.lastLocation.y - System.mouse.location.y;
};

/**
 * Returns the first world in the system.
 *
 * @function firstWorld
 * @memberof System
 * @returns {null|Object} An instance of World.
 */
System.firstWorld = function() {
  return this._records.length ? this._records[0] : null;
};

/**
 * Returns all worlds.
 *
 * @function allWorlds
 * @memberof System
 * @return {Array.<World>} An array of worlds.
 */
System.allWorlds = function() {
  return System.getAllItemsByName('World');
};

/**
 * Returns an array of items created from the same constructor.
 *
 * @function getAllItemsByName
 * @memberof System
 * @param {string} name The 'name' property.
 * @param {Array} [opt_list = this._records] An optional list of items.
 * @returns {Array} An array of items.
 */
System.getAllItemsByName = function(name, opt_list) {

  var i, max, arr = [],
      list = opt_list || this._records;

  for (i = 0, max = list.length; i < max; i++) {
    if (list[i].name === name) {
      arr[arr.length] = list[i];
    }
  }
  return arr;
};

/**
 * Returns an array of items with an attribute that matches the
 * passed 'attr'. If 'opt_val' is passed, 'attr' must equal 'val'.
 *
 * @function getAllItemsByAttribute
 * @memberof System
 * @param {string} attr The property to match.
 * @param {*} [opt_val=] The 'attr' parameter must equal this param.
 * @param {string} name The item's name property must equal this param.
 * @returns {Array} An array of items.
 */
System.getAllItemsByAttribute = function(attr, opt_val, opt_name) { // TODO: add test

  var i, max, arr = [], records = this._records,
      val = typeof opt_val !== 'undefined' ? opt_val : null,
      name = opt_name || false;

  for (i = 0, max = records.length; i < max; i++) {
    if (typeof records[i][attr] !== 'undefined') {
      if (val !== null && records[i][attr] !== val) {
        continue;
      }
      if (name && records[i].name !== name) {
        continue;
      }
      arr[arr.length] = records[i];
    }
  }
  return arr;
};

/**
 * Handles orientation evenst and forces the world to update its bounds.
 *
 * @function updateOrientation
 * @memberof System
 */
System.updateOrientation = function() {
  var worlds = System.allWorlds(),
  i, max, l = worlds.length;
  for (i = 0; i < l; i++) {
    worlds[i].width = worlds[i].el.scrollWidth;
    worlds[i].height = worlds[i].el.scrollHeight;
  }
};

/**
 * Handles keyup events.
 *
 * @function _keyup
 * @memberof System
 * @private
 * @param {Object} e An event.
 */
System._keyup = function(e) {

  var i, max, world, worlds = System.allWorlds();

  switch(e.keyCode) {
    case 39:
      System._stepForward();
      break;
    case 80: // p; pause/play
      for (i = 0, max = worlds.length; i < max; i++) {
        world = worlds[i];
        world.pauseStep = !world.pauseStep;
      }
      break;
    case 82: // r; reset
      System._resetSystem();
      break;
    case 83: // s; reset
      System._toggleFPS();
      break;
  }
};

/**
 * Resets the system.
 *
 * @function _resetSystem
 * @memberof System
 * @private
 */
System._resetSystem = function() {

  var i, max, world, worlds = System.allWorlds();

  for (i = 0, max = worlds.length; i < max; i++) {
    world = worlds[i];
    world.pauseStep = false;
    world.pauseDraw = false;

    while(world.el.firstChild) {
      world.el.removeChild(world.el.firstChild);
    }
  }

  System._records = [];
  System._pool = [];
  System.clock = 0;
  System.setup(System.setupFunc);
};

/**
 * Toggles stats display.
 *
 * @function _toggleFPS
 * @memberof System
 * @private
 */
System._toggleFPS = function() {
  if (!FPSDisplay.fps) {
    FPSDisplay.init();
  } else {
    FPSDisplay.active = !FPSDisplay.active;
  }

  if (!FPSDisplay.active) {
    FPSDisplay.hide();
  } else {
    FPSDisplay.show();
  }
};

module.exports = System;

},{"./item":13,"./world":16,"drawing-utils-lib":10,"fpsdisplay":11,"vector2d-lib":12}],16:[function(require,module,exports){
var Vector = require('vector2d-lib'),
    Item = require('./item'),
    Utils = require('drawing-utils-lib');

/**
 * Creates a new World.
 *
 * @param {Object} [opt_options=] A map of initial properties.
 * @constructor
 */
function World(opt_options) {

  Item.call(this);

  var options = opt_options || {};

  this.el = options.el || document.body;
  this.name = 'World';

  /**
   * Worlds do not have worlds. However, assigning an
   * object literal makes for less conditions in the
   * update loop.
   */
  this.world = {};
}
Utils.extend(World, Item);

/**
 * Resets all properties.
 * @function init
 * @memberof World
 *
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {number} [opt_options.width = this.el.scrollWidth] Width.
 * @param {number} [opt_options.height = this.el.scrollHeight] Height.
 *
 */
World.prototype.init = function(world, opt_options) {

  World._superClass.init.call(this, this.world, opt_options);

  var options = opt_options || {};

  this.color = options.color || [0, 0, 0];
  this.width = options.width || this.el.scrollWidth;
  this.height = options.height || this.el.scrollHeight;
  this.location = options.location || new Vector(document.body.scrollWidth / 2, document.body.scrollHeight / 2);
  this.borderWidth = options.borderWidth || 0;
  this.borderStyle = options.borderStyle || 'none';
  this.borderColor = options.borderColor || [0, 0, 0];
  this.gravity = options.gravity || new Vector(0, 1);
  this.c = typeof options.c !== 'undefined' ? options.c : 0.1;
  this.pauseStep = !!options.pauseStep;
  this.pauseDraw = !!options.pauseDraw;
  this.el.className = this.name.toLowerCase();
  this._camera = this._camera || new Vector();
};

/**
 * Adds an item to the world's view.
 * @param {Object} item An instance of item.
 */
World.prototype.add = function(item) {
  this.el.appendChild(item);
};

/**
 * Applies forces to world.
 * @function step
 * @memberof World
 */
World.prototype.step = function() {
  this.location.add(this._camera);
};

/**
 * Updates the corresponding DOM element's style property.
 * @function draw
 * @memberof World
 */
World.prototype.draw = function() {
  var cssText = this.getCSSText({
    x: this.location.x - (this.width / 2),
    y: this.location.y - (this.height / 2),
    angle: this.angle,
    scale: this.scale || 1,
    width: this.width,
    height: this.height,
    color0: this.color[0],
    color1: this.color[1],
    color2: this.color[2],
    borderWidth: this.borderWidth,
    borderStyle: this.borderStyle,
    borderColor1: this.borderColor[0],
    borderColor2: this.borderColor[1],
    borderColor3: this.borderColor[2]
  });
  this.el.style.cssText = cssText;
};

/**
 * Concatenates a new cssText string.
 *
 * @function getCSSText
 * @memberof World
 * @param {Object} props A map of object properties.
 * @returns {string} A string representing cssText.
 */
World.prototype.getCSSText = function(props) {
  return Item._stylePosition.replace(/<x>/g, props.x).replace(/<y>/g, props.y).replace(/<angle>/g, props.angle).replace(/<scale>/g, props.scale) + 'width: ' + props.width + 'px; height: ' + props.height + 'px; background-color: rgb(' + props.color0 + ', ' + props.color1 + ', ' + props.color2 + '); border: ' + props.borderWidth + 'px ' + props.borderStyle + ' rgb(' + props.borderColor1 + ', ' + props.borderColor2 + ', ' + props.borderColor3 + ')';
};

module.exports = World;

},{"./item":13,"drawing-utils-lib":10,"vector2d-lib":12}],17:[function(require,module,exports){
module.exports=require(8)
},{"/Users/vince/Dev/Foldi/Bit-Shadow-Items/node_modules/borderpalette/node_modules/drawing-utils-lib/src/drawing-utils-lib.js":8}],18:[function(require,module,exports){
var Utils = require('drawing-utils-lib');
/**
 * Creates a new ColorPalette object.
 *
 * Use this class to create a palette of colors randomly selected
 * from a range created with initial start and end colors. You
 * can also generate gradients that smoothly interpolate from
 * start and end colors.
 *
 * @param {string|number} [opt_id=] An optional id. If an id is not passed, a default id is created.
 * @constructor
 */
function ColorPalette(opt_id) {

  /**
   * Holds a list of arrays representing 3-digit color values
   * smoothly interpolated between start and end colors.
   * @private
   */
  this._gradients = [];

  /**
   * Holds a list of arrays representing 3-digit color values
   * randomly selected from start and end colors.
   * @private
   */
  this._colors = [];

  this.id = opt_id || ColorPalette._idCount;
  ColorPalette._idCount++; // increment id
}

/**
 * Increments as each ColorPalette is created.
 * @type number
 * @default 0
 * @private
 */
ColorPalette._idCount = 0;

ColorPalette.prototype.name = 'ColorPalette';

/**
 * Creates a color range of 255 colors from the passed start and end colors.
 * Adds a random selection of these colors to the color property of
 * the color palette.
 *
 * @param {Object} options A set of required options
 *    that includes:
 *    options.min {number} The minimum number of colors to add.
 *    options.max {number} The maximum number of color to add.
 *    options.startColor {Array} The beginning color of the color range.
 *    options.endColor {Array} The end color of the color range.
 */
ColorPalette.prototype.addColor = function(options) {

  if (!options.min || !options.max || !options.startColor || !options.endColor) {
    throw new Error('ColorPalette.addColor must pass min, max, startColor and endColor options.');
  }

  var i, ln, colors;

  ln = Utils.getRandomNumber(options.min, options.max);
  colors = ColorPalette._createColorRange(options.startColor, options.endColor, 255);

  for (i = 0; i < ln; i++) {
    this._colors.push(colors[Utils.getRandomNumber(0, colors.length - 1)]);
  }

  return this;
};

/**
 * Creates an array of RGB color values interpolated between
 * a passed startColor and endColor.
 *
 * @param {Array} startColor The beginning of the color array.
 * @param {Array} startColor The end of the color array.
 * @param {number} totalColors The total numnber of colors to create.
 * @returns {Array} An array of color values.
 */
ColorPalette._createColorRange = function(startColor, endColor, totalColors) {

  var i, colors = [],
      startRed = startColor[0],
      startGreen = startColor[1],
      startBlue = startColor[2],
      endRed = endColor[0],
      endGreen = endColor[1],
      endBlue = endColor[2],
      diffRed, diffGreen, diffBlue,
      newRed, newGreen, newBlue;

  diffRed = endRed - startRed;
  diffGreen = endGreen - startGreen;
  diffBlue = endBlue - startBlue;

  for (i = 0; i < totalColors; i++) {
    newRed = parseInt(diffRed * i/totalColors, 10) + startRed;
    newGreen = parseInt(diffGreen * i/totalColors, 10) + startGreen;
    newBlue = parseInt(diffBlue * i/totalColors, 10) + startBlue;
    colors.push([newRed, newGreen, newBlue]);
  }
  return colors;
};

/**
 * @returns An array representing a randomly selected color
 *    from the colors property.
 * @throws {Error} If the colors property is empty.
 */
ColorPalette.prototype.getColor = function() {

  if (this._colors.length > 0) {
    return this._colors[Utils.getRandomNumber(0, this._colors.length - 1)];
  } else {
    throw new Error('ColorPalette.getColor: You must add colors via addColor() before using getColor().');
  }
};

// TODO: add the following

/**
 * Adds color arrays representing a color range to the gradients property.
 *
 * @param {Object} options A set of required options
 *    that includes:
 *    options.startColor {Array} The beginning color of the color range.
 *    options.endColor {Array} The end color of the color range.
 *    options.totalColors {number} The total number of colors in the gradient.
 * @private
 */
/*ColorPalette.prototype.createGradient = function(options) {

  if (!options.startColor || !options.endColor || !options.totalColors) {
    throw new Error('ColorPalette.addColor must pass startColor, endColor and totalColors options.');
  }
  this.startColor = options.startColor;
  this.endColor = options.endColor;
  this.totalColors = options.totalColors || 255;
  this._gradients.push(ColorPalette._createColorRange(this.startColor, this.endColor, this.totalColors));
};*/

/**
 * Renders a strip of colors representing the color range
 * in the colors property.
 *
 * @param {Object} parent A DOM object to contain the color strip.
 */
/*ColorPalette.prototype.createSampleStrip = function(parent) {

  var i, max, div;

  for (i = 0, max = this._colors.length; i < max; i++) {
    div = document.createElement('div');
    div.className = 'color-sample-strip';
    div.style.background = 'rgb(' + this._colors[i].toString() + ')';
    parent.appendChild(div);
  }
};*/

module.exports = ColorPalette;

},{"drawing-utils-lib":17}],19:[function(require,module,exports){
/*jshint bitwise:false */
/**
* https://gist.github.com/304522
* Ported from Stefan Gustavson's java implementation
* http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
* Read Stefan's excellent paper for details on how this code works.
*
* @author Sean McCullough banksean@gmail.com
*
* You can pass in a random number generator object if you like.
* It is assumed to have a random() method.
*/

/**
 * @namespace
 */

var SimplexNoise = {};

SimplexNoise.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
SimplexNoise.p = [];
SimplexNoise.perm = [];
// A lookup table to traverse the simplex around a given point in 4D.
// Details can be found where this table is used, in the 4D noise method.
SimplexNoise.simplex = [
  [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],
  [0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],
  [1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],
  [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],
  [2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],
  [2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]];

SimplexNoise.config = function(r) {

  var i, p = SimplexNoise.p, perm = SimplexNoise.perm;

  if (typeof r === 'undefined') {
    r = Math;
  }

  for (i = 0; i < 256; i += 1) {
    SimplexNoise.p[i] = Math.floor(r.random() * 256);
  }
  // To remove the need for index wrapping, double the permutation table length
  for(i = 0; i < 512; i += 1) {
    perm[i] = p[i & 255];
  }
};

SimplexNoise.noise = function(xin, yin) {

  var grad3 = SimplexNoise.grad3;
  var p = SimplexNoise.p;
  var perm = SimplexNoise.perm;
  var simplex = SimplexNoise.simplex;

  if (!p.length) {
    SimplexNoise.config();
  }

  var n0, n1, n2; // Noise contributions from the three corners

  // Skew the input space to determine which simplex cell we're in
  var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
  var s = (xin + yin) * F2; // Hairy factor for 2D
  var i = Math.floor(xin + s);
  var j = Math.floor(yin + s);
  var G2 = (3.0 -Math.sqrt(3.0)) / 6.0;
  var t = (i + j) * G2;
  var X0 = i - t; // Unskew the cell origin back to (x,y) space
  var Y0 = j - t;
  var x0 = xin - X0; // The x,y distances from the cell origin
  var y0 = yin - Y0;

  // For the 2D case, the simplex shape is an equilateral triangle.
  // Determine which simplex we are in.
  var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
  if (x0 > y0) { i1 = 1; j1 = 0; } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
  else { i1 = 0; j1 = 1; }      // upper triangle, YX order: (0,0)->(0,1)->(1,1)
  // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
  // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
  // c = (3-sqrt(3))/6
  var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
  var y1 = y0 - j1 + G2;
  var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
  var y2 = y0 - 1.0 + 2.0 * G2;

  // Work out the hashed gradient indices of the three simplex corners
  var ii = i & 255;
  var jj = j & 255;
  var gi0 = this.perm[ii + this.perm[jj]] % 12;
  var gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
  var gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;

  // Calculate the contribution from the three corners
  var t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 < 0) {
    n0 = 0.0;
  } else {
    t0 *= t0;
    n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient
  }
  var t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 < 0) {
    n1 = 0.0;
  } else {
    t1 *= t1;
    n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
  }
  var t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 < 0) {
    n2 = 0.0;
  } else {
    t2 *= t2;
    n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
  }
  // Add contributions from each corner to get the final noise value.
  // The result is scaled to return values in the interval [-1,1].
  return 70.0 * (n0 + n1 + n2);

};

SimplexNoise.dot = function(g, x, y) {
  return g[0] * x + g[1] * y;
};

module.exports = SimplexNoise;

},{}],20:[function(require,module,exports){
var Item = require('bitshadowmachine').Item,
		Mover = require('./mover'),
    System = require('bitshadowmachine').System,
    Utils = require('bitshadowmachine').Utils,
    Vector = require('bitshadowmachine').Vector;

/**
 * Creates a new Agent.
 *
 * Agents are basic Flora elements that respond to forces like gravity, attraction,
 * repulsion, etc. They can also chase after other Agents, organize with other Agents
 * in a flocking behavior, and steer away from obstacles. They can also follow the mouse.
 *
 * @constructor
 * @extends Mover
 */
function Agent(opt_options) {
  Mover.call(this);
}
Utils.extend(Agent, Mover);

/**
 * Initializes an instance.
 *
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {boolean} [opt_options.followMouse = false] If true, object will follow mouse.
 * @param {number} [opt_options.maxSteeringForce = 10] Set the maximum strength of any steering force.
 * @param {Object} [opt_options.seekTarget = null] An object to seek.
 * @param {boolean} [opt_options.flocking = false] Set to true to apply flocking forces to this object.
 * @param {number} [opt_options.desiredSeparation = Twice the object's default scale] Sets the desired separation from other objects when flocking = true.
 * @param {number} [opt_options.separateStrength = 1] The strength of the force to apply to separating when flocking = true.
 * @param {number} [opt_options.alignStrength = 1] The strength of the force to apply to aligning when flocking = true.
 * @param {number} [opt_options.cohesionStrength = 1] The strength of the force to apply to cohesion when flocking = true.
 * @param {Object} [opt_options.flowField = null] If a flow field is set, object will use it to apply a force.
 * @param {Array} [opt_options.sensors = ] A list of sensors attached to this object.
 * @param {number} [opt_options.motorSpeed = 2] Motor speed
 * @param {Array} [opt_options.color = 197, 177, 115] Color.
 */
Agent.prototype.init = function(world, opt_options) {
  Agent._superClass.init.call(this, world, opt_options);

  var options = opt_options || {};

  this.name = options.type || 'Agent';
  this.followMouse = !!options.followMouse;
  this.maxSteeringForce = typeof options.maxSteeringForce === 'undefined' ? 5 : options.maxSteeringForce;
  this.seekTarget = options.seekTarget || null;
  this.flocking = !!options.flocking;
  this.separateStrength = typeof options.separateStrength === 'undefined' ? 0.3 : options.separateStrength;
  this.alignStrength = typeof options.alignStrength === 'undefined' ? 0.2 : options.alignStrength;
  this.cohesionStrength = typeof options.cohesionStrength === 'undefined' ? 0.1 : options.cohesionStrength;
  this.flowField = options.flowField || null;

  this.sensors = options.sensors || [];
  this.motorSpeed = options.motorSpeed || 0;

  this.color = options.color || [197, 177, 115];
  this.desiredSeparation = typeof options.desiredSeparation === 'undefined' ? this.scale * 2 : options.desiredSeparation;

  //

  this.separateSumForceVector = new Vector(); // used in Agent.separate()
  this.alignSumForceVector = new Vector(); // used in Agent.align()
  this.cohesionSumForceVector = new Vector(); // used in Agent.cohesion()
  this.followTargetVector = new Vector(); // used in Agent.applyAdditionalForces()
  this.followDesiredVelocity = new Vector(); // used in Agent.follow()
  this.motorDir = new Vector(); // used in Agent.applyAdditionalForces()

  if (!this.velocity.mag()) {
    this.velocity.x = 1; // angle = 0;
    this.velocity.y = 0;
    this.velocity.normalize();
    this.velocity.rotate(Utils.degreesToRadians(this.angle));
    this.velocity.mult(this.motorSpeed);
  }

  // TODO: test this
  for (var i = 0, max = this.sensors.length; i < max; i++) {
    this.sensors[i].parent = this;
  }
};

/**
 * Applies Agent-specific forces.
 *
 * @returns {Object} This object's acceleration vector.
 */
Agent.prototype.applyAdditionalForces = function() {

  var i, max, sensorActivated, sensor, r, theta, x, y;

  if (this.sensors.length > 0) { // Sensors
    for (i = 0, max = this.sensors.length; i < max; i += 1) {

      sensor = this.sensors[i];

      r = sensor.offsetDistance; // use angle to calculate x, y
      theta = Utils.degreesToRadians(this.angle + sensor.offsetAngle);
      x = r * Math.cos(theta);
      y = r * Math.sin(theta);

      sensor.location.x = this.location.x;
      sensor.location.y = this.location.y;
      sensor.location.add(new Vector(x, y)); // position the sensor

      if (i) {
        sensor.borderStyle = 'none';
      }

      if (sensor.activated) {
        if (typeof sensor.behavior === 'function') {
          this.applyForce(sensor.behavior.call(this, sensor, sensor.target));
        } else {
          this.applyForce(sensor.getBehavior().call(this, sensor, sensor.target));
        }
        sensorActivated = true;
      }

    }
  }

  /**
   * If no sensors were activated and this.motorSpeed != 0,
   * apply a force in the direction of the current velocity.
   */
  if (!sensorActivated && this.motorSpeed) {
    this.motorDir.x = this.velocity.x;
    this.motorDir.y = this.velocity.y;
    this.motorDir.normalize();
    if (this.velocity.mag() > this.motorSpeed) { // decelerate to defaultSpeed
      this.motorDir.mult(-this.motorSpeed);
    } else {
      this.motorDir.mult(this.motorSpeed);
    }
    this.applyForce(this.motorDir); // constantly applies a force
  }

  // TODO: cache a vector for new location
  if (this.followMouse) { // follow mouse
    var t = {
      location: new Vector(System.mouse.location.x,
          System.mouse.location.y)
    };
    this.applyForce(this._seek(t));
  }

  if (this.seekTarget) { // seek target
    this.applyForce(this._seek(this.seekTarget));
  }

  if (this.flowField) { // follow flow field
    var res = this.flowField.resolution,
      col = Math.floor(this.location.x/res),
      row = Math.floor(this.location.y/res),
      loc, target;

    if (this.flowField.field[col]) {

      loc = this.flowField.field[col][row];
      if (loc) { // sometimes loc is not available for edge cases
        this.followTargetVector.x = loc.x;
        this.followTargetVector.y = loc.y;
      } else {
        this.followTargetVector.x = this.location.x;
        this.followTargetVector.y = this.location.y;
      }
      target = {
        location: this.followTargetVector
      };
      this.applyForce(this._follow(target));
    }

  }

  if (this.flocking) {
    this._flock(System.getAllItemsByName(this.name));
  }

  return this.acceleration;
};

/**
 * Calculates a steering force to apply to an object seeking another object.
 *
 * @param {Object} target The object to seek.
 * @returns {Object} The force to apply.
 * @private
 */
Agent.prototype._seek = function(target) {

  var world = this.world,
    desiredVelocity = Vector.VectorSub(target.location, this.location),
    distanceToTarget = desiredVelocity.mag();

  desiredVelocity.normalize();

  if (distanceToTarget < world.width / 2) { // slow down to arrive at target
    var m = Utils.map(distanceToTarget, 0, world.width / 2, 0, this.maxSpeed);
    desiredVelocity.mult(m);
  } else {
    desiredVelocity.mult(this.maxSpeed);
  }

  desiredVelocity.sub(this.velocity);
  desiredVelocity.limit(this.maxSteeringForce);

  return desiredVelocity;
};

/**
 * Calculates a steering force to apply to an object following another object.
 * Agents with flow fields will use this method to calculate a steering force.
 *
 * @param {Object} target The object to follow.
 * @returns {Object} The force to apply.
 */
Agent.prototype._follow = function(target) {

  this.followDesiredVelocity.x = target.location.x;
  this.followDesiredVelocity.y = target.location.y;

  this.followDesiredVelocity.mult(this.maxSpeed);
  this.followDesiredVelocity.sub(this.velocity);
  this.followDesiredVelocity.limit(this.maxSteeringForce);

  return this.followDesiredVelocity;
};

/**
 * Bundles flocking behaviors (separate, align, cohesion) into one call.
 *
 * @returns {Object} This object's acceleration vector.
 */
Agent.prototype._flock = function(items) {
  this.applyForce(this._separate(items).mult(this.separateStrength));
  this.applyForce(this._align(items).mult(this.alignStrength));
  this.applyForce(this._cohesion(items).mult(this.cohesionStrength));
  return this.acceleration;
};

/**
 * Loops through a passed items array and calculates a force to apply
 * to avoid all items.
 *
 * @param {array} items An array of Flora items.
 * @returns {Object} A force to apply.
 */
Agent.prototype._separate = function(items) {

  var i, max, item, diff, d,
  sum, count = 0, steer;

  this.separateSumForceVector.x = 0;
  this.separateSumForceVector.y = 0;
  sum = this.separateSumForceVector;

  for (i = 0, max = items.length; i < max; i += 1) {
    item = items[i];
    if (this.id !== item.id) {

      d = this.location.distance(item.location);

      if ((d > 0) && (d < this.desiredSeparation)) {
        diff = Vector.VectorSub(this.location, item.location);
        diff.normalize();
        diff.div(d);
        sum.add(diff);
        count += 1;
      }
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxSpeed);
    sum.sub(this.velocity);
    sum.limit(this.maxSteeringForce);
    return sum;
  }
  return new Vector(); // TODO: do we need this?
};

/**
 * Loops through a passed items array and calculates a force to apply
 * to align with all items.
 *
 * @param {array} items An array of Flora items.
 * @returns {Object} A force to apply.
 */
Agent.prototype._align = function(items) {

  var i, max, item, d,
    neighbordist = this.scale * 2,
    sum, count = 0, steer;

  this.alignSumForceVector.x = 0;
  this.alignSumForceVector.y = 0;
  sum = this.alignSumForceVector;

  for (i = 0, max = items.length; i < max; i += 1) {
    item = items[i];
    d = this.location.distance(item.location);

    if ((d > 0) && (d < neighbordist)) {
      if (this.id !== item.id) {
        sum.add(item.velocity);
        count += 1;
      }
    }
  }

  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxSpeed);
    sum.sub(this.velocity);
    sum.limit(this.maxSteeringForce);
    return sum;
  }
  return new Vector();
};

/**
 * Loops through a passed items array and calculates a force to apply
 * to stay close to all items.
 *
 * @param {array} items An array of Flora items.
 * @returns {Object} A force to apply.
 */
Agent.prototype._cohesion = function(items) {

  var i, max, item, d,
    neighbordist = this.scale * 2,
    sum, count = 0, desiredVelocity, steer;

  this.cohesionSumForceVector.x = 0;
  this.cohesionSumForceVector.y = 0;
  sum = this.cohesionSumForceVector;

  for (i = 0, max = items.length; i < max; i += 1) {
    item = items[i];
    d = this.location.distance(item.location);

    if ((d > 0) && (d < neighbordist)) {
      if (this.id !== item.id) {
        sum.add(item.location);
        count += 1;
      }
    }
  }

  if (count > 0) {
    sum.div(count);
    sum.sub(this.location);
    sum.normalize();
    sum.mult(this.maxSpeed);
    sum.sub(this.velocity);
    sum.limit(this.maxSteeringForce);
    return sum;
  }
  return new Vector();
};



module.exports = Agent;
},{"./mover":24,"bitshadowmachine":5}],21:[function(require,module,exports){
/**
 * @namespace
 */
var config = {
  borderStyles: [
    'none',
    'solid',
    'dotted',
    'dashed',
    'double',
    'inset',
    'outset',
    'groove',
    'ridge'
  ],
  defaultColorList: [
    {
      name: 'cold',
      startColor: [88, 129, 135],
      endColor: [171, 244, 255],
      boxShadowColor: [132, 192, 201]
    },
    {
      name: 'food',
      startColor: [186, 255, 130],
      endColor: [84, 187, 0],
      boxShadowColor: [57, 128, 0]
    },
    {
      name: 'heat',
      startColor: [255, 132, 86],
      endColor: [175, 47, 0],
      boxShadowColor: [255, 69, 0]
    },
    {
      name: 'light',
      startColor: [255, 255, 255],
      endColor: [189, 148, 0],
      boxShadowColor: [255, 200, 0]
    },
    {
      name: 'oxygen',
      startColor: [130, 136, 255],
      endColor: [49, 56, 205],
      boxShadowColor: [60, 64, 140]
    }
  ],
  keyMap: {
    pause: 80,
    resetSystem: 82,
    stats: 83
  },
  touchMap: {
    stats: 2,
    pause: 3,
    reset: 4
  }
};

module.exports.config = config;

},{}],22:[function(require,module,exports){
var Item = require('bitshadowmachine').Item,
    Utils = require('bitshadowmachine').Utils,
    Vector = require('bitshadowmachine').Vector;

/**
 * Creates a new Food.
 *
 * Foods are the most basic Flora item. They represent a fixed point in
 * 2D space and are just an extension of Burner Item with isStatic set to true.
 *
 * @constructor
 * @extends Item
 */
function Food() {
  Item.call(this);
}
Utils.extend(Food, Item);

/**
 * Initializes an instance of Food.
 *
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {Array} [opt_options.color = 200, 200, 200] Color.
 */
Food.prototype.init = function(world, opt_options) {
  Food._superClass.init.call(this, world, opt_options);

  var options = opt_options || {};

  this.name = options.type || 'Food';
  this.color = options.color || [200, 200, 200];
  this.offsetDistance = typeof options.offsetDistance === 'undefined' ? -10 : options.offsetDistance;
  this.offsetAngle = options.offsetAngle || 0;
  this.beforeStep = options.beforeStep || function() {};

	this.offsetVector = new Vector();
};

Food.prototype.step = function() {

	this.beforeStep.call(this);

	if (this.parent) {
		if (this.offsetDistance) {
			var r = this.offsetDistance; // use angle to calculate x, y
	    var theta = Utils.degreesToRadians(this.parent.angle + this.offsetAngle);
	    var x = r * Math.cos(theta);
	    var y = r * Math.sin(theta);

	    this.location.x = this.parent.location.x;
	    this.location.y = this.parent.location.y;
	    this.offsetVector.x = x;
	    this.offsetVector.y = y;
	    this.location.add(this.offsetVector); // position the child
  	} else {
	  	this.location.x = this.parent.location.x;
			this.location.y = this.parent.location.y;
		}
	}
};

module.exports = Food;
},{"bitshadowmachine":5}],23:[function(require,module,exports){
var Utils = require('bitshadowmachine').Utils;

var BitShadowItems = {
  Agent: require('./agent'),
  Food: require('./food'),
  Mover: require('./mover'),
  Oscillator: require('./oscillator'),
  Particle: require('./particle'),
  Point: require('./point'),
  Sensor: require('./sensor'),
  Stimulus: require('./stimulus'),
  Walker: require('./walker'),
  configure: function(System) {
  	var sys = require('bitshadowmachine').System;

  	for (i in System) {
  		if (System.hasOwnProperty(i)) {
  			sys[i] = System[i];
  		}
  	}

  }
};

// TODO: add...

//Attractor: require('./attractor'),
//Connector: require('./connector'),
//Dragger: require('./dragger'),
//FlowField: require('./flowfield'),
//ParticleSystem: require('./particlesystem'),
//Repeller: require('./repeller'),


module.exports = BitShadowItems;

},{"./agent":20,"./food":22,"./mover":24,"./oscillator":25,"./particle":26,"./point":27,"./sensor":28,"./stimulus":29,"./walker":30,"bitshadowmachine":5}],24:[function(require,module,exports){
var Item = require('bitshadowmachine').Item,
    System = require('bitshadowmachine').System,
    Utils = require('bitshadowmachine').Utils,
    Vector = require('bitshadowmachine').Vector;

/**
 * Creates a new Mover.
 *
 * Movers are the root object for any item that moves. They are not
 * aware of other Movers or stimuli. They have no means of locomotion
 * and change only due to external forces. You will never directly
 * implement Mover.
 *
 * @constructor
 * @extends Item
 */
function Mover() {
  Item.call(this);
}
Utils.extend(Mover, Item);

/**
 * Initializes an instance of Mover.
 * @param {Object} world An instance of World.
 * @param {Object} opt_options A map of initial properties.
 * @param {string|Array} [opt_options.color = 255, 255, 255] Color.
 * @param {number} [opt_options.borderRadius = 100] Border radius.
 * @param {number} [opt_options.borderWidth = 2] Border width.
 * @param {string} [opt_options.borderStyle = 'solid'] Border style.
 * @param {Array} [opt_options.borderColor = 60, 60, 60] Border color.
 * @param {boolean} [opt_options.pointToDirection = true] If true, object will point in the direction it's moving.
 * @param {Object} [opt_options.parent = null] A parent object. If set, object will be fixed to the parent relative to an offset distance.
 * @param {boolean} [opt_options.pointToParentDirection = true] If true, object points in the direction of the parent's velocity.
 * @param {number} [opt_options.offsetDistance = 30] The distance from the center of the object's parent.
 * @param {number} [opt_options.offsetAngle = 0] The rotation around the center of the object's parent.
 * @param {function} [opt_options.afterStep = null] A function to run after the step() function.
 * @param {function} [opt_options.isStatic = false] Set to true to prevent object from moving.
 * @param {Object} [opt_options.parent = null] Attach to another Flora object.
 */
Mover.prototype.init = function(world, opt_options) {
  Mover._superClass.init.call(this, world, opt_options);

  var options = opt_options || {};

  this.color = options.color || [255, 255, 255];
  /*this.borderRadius = options.borderRadius || 0;
  this.borderWidth = options.borderWidth || 0;
  this.borderStyle = options.borderStyle || 'none';
  this.borderColor = options.borderColor || [0, 0, 0];*/
  this.pointToDirection = typeof options.pointToDirection === 'undefined' ? true : options.pointToDirection;
  this.parent = options.parent || null;
  this.pointToParentDirection = typeof options.pointToParentDirection === 'undefined' ? true : options.pointToParentDirection;
  this.offsetDistance = typeof options.offsetDistance === 'undefined' ? 0 : options.offsetDistance;
  this.offsetAngle = options.offsetAngle || 0;
  this.isStatic = !!options.isStatic;

  this._friction = new Vector();
};

Mover.prototype.step = function() {

  var i, max, x = this.location.x,
      y = this.location.y;

  this.beforeStep.call(this);

  if (this.isStatic) {
    return;
  }

  // start apply forces

  if (this.world.c) { // friction
    this._friction.x = this.velocity.x;
    this._friction.y = this.velocity.y;
    this._friction.mult(-1);
    this._friction.normalize();
    this._friction.mult(this.world.c);
    this.applyForce(this._friction);
  }
  this.applyForce(this.world.gravity); // gravity

  // attractors
  var attractors = System.getAllItemsByName('Attractor');
  for (i = 0, max = attractors.length; i < max; i += 1) {
    if (this.id !== attractors[i].id) {
      this.applyForce(attractors[i].attract(this));
    }
  }

  // repellers
  var repellers = System.getAllItemsByName('Repeller');
  for (i = 0, max = repellers.length; i < max; i += 1) {
    if (this.id !== repellers[i].id) {
      this.applyForce(repellers[i].attract(this));
    }
  }

  // draggers
  var draggers = System.getAllItemsByName('Dragger');
  for (i = 0, max = draggers.length; i < max; i += 1) {
    if (this.id !== draggers[i].id && Utils.isInside(this, draggers[i])) {
      this.applyForce(draggers[i].drag(this));
    }
  }

  if (this.applyAdditionalForces) {
    this.applyAdditionalForces.call(this);
  }

  this.velocity.add(this.acceleration); // add acceleration

  this.velocity.limit(this.maxSpeed, this.minSpeed);

  this.location.add(this.velocity); // add velocity

  if (this.pointToDirection) { // object rotates toward direction
    if (this.velocity.mag() > 0.1) {
      this.angle = Utils.radiansToDegrees(Math.atan2(this.velocity.y, this.velocity.x));
    }
  }

  if (this.wrapWorldEdges) {
    this._wrapWorldEdges();
  } else if (this.checkWorldEdges) {
    this._checkWorldEdges();
  }

  if (this.controlCamera) {
    this._checkCameraEdges(x, y, this.location.x, this.location.y);
  }

  if (this.parent) { // parenting

    if (this.offsetDistance) {

      r = this.offsetDistance; // use angle to calculate x, y
      theta = Utils.degreesToRadians(this.parent.angle + this.offsetAngle);
      x = r * Math.cos(theta);
      y = r * Math.sin(theta);

      this.location.x = this.parent.location.x;
      this.location.y = this.parent.location.y;
      this.location.add(new Vector(x, y)); // position the child

      if (this.pointToParentDirection) {
        this.angle = Utils.radiansToDegrees(Math.atan2(this.parent.velocity.y, this.parent.velocity.x));
      }

    } else {
      this.location.x = this.parent.location.x;
      this.location.y = this.parent.location.y;
    }
  }

  this.acceleration.mult(0);

  if (this.life < this.lifespan) {
    this.life += 1;
  } else if (this.lifespan !== -1) {
    System.remove(this);
    return;
  }

  this.afterStep.call(this);
};

module.exports = Mover;

},{"bitshadowmachine":5}],25:[function(require,module,exports){
var Item = require('bitshadowmachine').Item,
    SimplexNoise = require('quietriot'),
    System = require('bitshadowmachine').System,
    Utils = require('bitshadowmachine').Utils,
    Vector = require('bitshadowmachine').Vector;

function Oscillator(opt_options) {
  Item.call(this);
}
Utils.extend(Oscillator, Item);

Oscillator.prototype.init = function(world, opt_options) {
  Oscillator._superClass.init.call(this, world, opt_options);

  var options = opt_options || {};

  this.acceleration = options.acceleration || new Vector(0.01, 0);
  this.aVelocity = options.aVelocity || new Vector();
  this.isStatic = !!options.isStatic;
  this.perlin = !!options.perlin;
  this.perlinSpeed = typeof options.perlinSpeed === 'undefined' ? 0.005 : options.perlinSpeed;
  this.perlinTime = options.perlinTime || 0;
  this.perlinAccelLow = typeof options.perlinAccelLow === 'undefined' ? -2 : options.perlinAccelLow;
  this.perlinAccelHigh = typeof options.perlinAccelHigh === 'undefined' ? 2 : options.perlinAccelHigh;
  this.perlinOffsetX = typeof options.perlinOffsetX === 'undefined' ? Math.random() * 10000 : options.perlinOffsetX;
  this.perlinOffsetY = typeof options.perlinOffsetY === 'undefined' ? Math.random() * 10000 : options.perlinOffsetY;
  this.color = options.color || [200, 100, 0];
  this.opacity = typeof options.opacity === 'undefined' ? 0.75 : options.opacity;
  this.zIndex = typeof options.zIndex === 'undefined' ? 1 : options.zIndex;
  this.parent = options.parent || null;
  this.pointToDirection = !!options.pointToDirection;

  //

  this.lastLocation = new Vector();
  this.amplitude = options.amplitude || new Vector(this.world.width / 2,
      this.world.height / 2);
  this.initialLocation = options.initialLocation ||
    new Vector(this.world.width / 2, this.world.height / 2);
  this.location.x = this.initialLocation.x;
  this.location.y = this.initialLocation.y;
};

Oscillator.prototype.step = function () {

  this.beforeStep.call(this);

  if (this.isStatic) {
    return;
  }

  if (this.perlin) {
    this.perlinTime += this.perlinSpeed;
    this.aVelocity.x =  Utils.map(SimplexNoise.noise(this.perlinTime + this.perlinOffsetX, 0), -1, 1, this.perlinAccelLow, this.perlinAccelHigh);
    this.aVelocity.y =  Utils.map(SimplexNoise.noise(0, this.perlinTime + this.perlinOffsetY), -1, 1, this.perlinAccelLow, this.perlinAccelHigh);
  } else {
    this.aVelocity.add(this.acceleration); // add acceleration
  }

  if (this.parent) { // parenting
    this.initialLocation.x = this.parent.location.x;
    this.initialLocation.y = this.parent.location.y;
  }

  this.location.x = this.initialLocation.x + Math.cos(this.aVelocity.x) * this.amplitude.x;
  this.location.y = this.initialLocation.y + Math.sin(this.aVelocity.y) * this.amplitude.y;

  if (this.pointToDirection) { // object rotates toward direction
      velDiff = Vector.VectorSub(this.location, this.lastLocation);
      this.angle = Utils.radiansToDegrees(Math.atan2(velDiff.y, velDiff.x));
  }

  if (this.life < this.lifespan) {
    this.life += 1;
  } else if (this.lifespan !== -1) {
    System.remove(this);
  }

  this.afterStep.call(this);

  this.lastLocation.x = this.location.x;
  this.lastLocation.y = this.location.y;
};

module.exports = Oscillator;

},{"bitshadowmachine":5,"quietriot":19}],26:[function(require,module,exports){
var Item = require('bitshadowmachine').Item,
    Mover = require('./mover'),
    Utils = require('bitshadowmachine').Utils,
    Vector = require('bitshadowmachine').Vector;

/**
 * Creates a new Particle object.
 *
 * @constructor
 * @extends Mover
 */
function Particle(opt_options) {
  Mover.call(this);
}
Utils.extend(Particle, Mover);

/**
 * Initializes Particle.
 * @param  {Object} world An instance of World.
 * @param  {Object} [opt_options=] A map of initial properties.
 * @param {Array} [opt_options.color = [200, 200, 200]] Color.
 * @param {number} [opt_options.lifespan = 50] The max life of the object. Set to -1 for infinite life.
 * @param {number} [opt_options.life = 0] The current life value. If greater than this.lifespan, object is destroyed.
 * @param {boolean} {opt_options.fade = true} If true, opacity decreases proportionally with life.
 * @param {boolean} {opt_options.shrink = true} If true, width and height decrease proportionally with life.
 * @param {boolean} [opt_options.checkWorldEdges = false] Set to true to check the object's location against the world's bounds.
 * @param {number} [opt_options.maxSpeed = 4] Maximum speed.
 * @param {number} [opt_options.zIndex = 1] The object's zIndex.
 */
Particle.prototype.init = function(world, opt_options) {
  Particle._superClass.init.call(this, world, opt_options);

  var options = opt_options || {};

  this.color = options.color || [200, 200, 200];
  this.lifespan = typeof options.lifespan === 'undefined' ? 50 : options.lifespan;
  this.life = options.life || 0;
  this.fade = typeof options.fade === 'undefined' ? true : options.fade;
  this.shrink = typeof options.shrink === 'undefined' ? true : options.shrink;
  this.checkWorldEdges = !!options.checkWorldEdges;
  this.maxSpeed = typeof options.maxSpeed === 'undefined' ? 4 : options.maxSpeed;
  this.zIndex = typeof options.zIndex === 'undefined' ? 1 : options.zIndex;

  if (!options.acceleration) {
    this.acceleration = new Vector(1, 1);
    this.acceleration.normalize();
    this.acceleration.mult(this.maxSpeed ? this.maxSpeed : 3);
    this.acceleration.rotate(Utils.getRandomNumber(0, Math.PI * 2, true));
  }
  if (!options.velocity) {
    this.velocity = new Vector();
  }
  this.initScale = this.scale;
};

/**
 * Applies additional forces.
 */
Particle.prototype.afterStep = function() {
  if (this.fade) {
    this.opacity = Utils.map(this.life, 0, this.lifespan, 1, 0);
  }
  if (this.shrink) {
    this.scale = Utils.map(this.life, 0, this.lifespan, this.initScale, 0);
  }
};

module.exports = Particle;

},{"./mover":24,"bitshadowmachine":5}],27:[function(require,module,exports){
var Item = require('bitshadowmachine').Item,
    Utils = require('bitshadowmachine').Utils;

/**
 * Creates a new Point.
 *
 * Points are the most basic Flora item. They represent a fixed point in
 * 2D space and are just an extension of Burner Item with isStatic set to true.
 *
 * @constructor
 * @extends Item
 */
function Point() {
  Item.call(this);
}
Utils.extend(Point, Item);

/**
 * Initializes an instance of Point.
 *
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {Array} [opt_options.color = 200, 200, 200] Color.
 * @param {Array} [opt_options.isStatic = true] Static.
 */
Point.prototype.init = function(world, opt_options) {
  Point._superClass.init.call(this, world, opt_options);

  var options = opt_options || {};

  this.name = options.type || 'Point';
  this.color = options.color || [200, 200, 200];
  this.isStatic = typeof options.isStatic === 'undefined' ? true : options.isStatic;
};

Point.prototype.step = function() {
	this.beforeStep.call(this);
	if (this.parent && !this.isStatic && !this.special) {
		this.location.x = this.parent.location.x;
		this.location.y = this.parent.location.y;
	}
};

module.exports = Point;
},{"bitshadowmachine":5}],28:[function(require,module,exports){
var Mover = require('./mover'),
    System = require('bitshadowmachine').System,
    Utils = require('bitshadowmachine').Utils,
    Vector = require('bitshadowmachine').Vector;

/**
 * Creates a new Sensor object.
 *
 * @constructor
 * @extends Mover
 *
 * @param {Object} [opt_options=] A map of initial properties.
 */
function Sensor(opt_options) {
  Mover.call(this);
}
Utils.extend(Sensor, Mover);

/**
 * Initializes Sensor.
 * @param  {Object} world An instance of World.
 * @param  {Object} [opt_options=] A map of initial properties.
 * @param {string} [opt_options.type = ''] The type of stimulus that can activate this sensor. eg. 'cold', 'heat', 'light', 'oxygen', 'food', 'predator'
 * @param {string} [opt_options.targetClass = 'Stimulus'] The class of Item that can activate this sensor. eg. 'Stimulus', 'Agent', 'Sheep', 'Wolf'
 * @param {string} [opt_options.behavior = ''] The vehicle carrying the sensor will invoke this behavior when the sensor is activated.
 * @param {number} [opt_options.sensitivity = 200] The higher the sensitivity, the farther away the sensor will activate when approaching a stimulus.
 * @param {number} [opt_options.width = 7] Width.
 * @param {number} [opt_options.height = 7] Height.
 * @param {number} [opt_options.offsetDistance = 30] The distance from the center of the sensor's parent.
 * @param {number} [opt_options.offsetAngle = 0] The angle of rotation around the vehicle carrying the sensor.
 * @param {number} [opt_options.opacity = 0.75] Opacity.
 * @param {number} [opt_options.minOpacity = 0.1] Min opacity.
 * @param {number} [opt_options.maxOpacity = 0.5] Max opacity.
 * @param {Object} [opt_options.target = null] A stimulator.
 * @param {boolean} [opt_options.activated = false] True if sensor is close enough to detect a stimulator.
 * @param {Array} [opt_options.activatedColor = [255, 255, 255]] The color the sensor will display when activated.
 * @param {number} [opt_options.borderRadius = 100] Border radius.
 * @param {number} [opt_options.borderWidth = 2] Border width.
 * @param {string} [opt_options.borderStyle = 'solid'] Border style.
 * @param {Array} [opt_options.borderColor = [255, 255, 255]] Border color.
 * @param {Function} [opt_options.onConsume = null] If sensor.behavior == 'CONSUME', sensor calls this function when consumption is complete.
 * @param {Function} [opt_options.onDestroy = null] If sensor.behavior == 'DESTROY', sensor calls this function when target is destroyed.
 */
Sensor.prototype.init = function(world, opt_options) {
  Sensor._superClass.init.call(this, world, opt_options);

  var options = opt_options || {};

  this.type = options.type || '';
  this.targetClass = options.targetClass || 'Stimulus';
  this.behavior = options.behavior || function() {};
  this.sensitivity = typeof options.sensitivity !== 'undefined' ? options.sensitivity : 40;
  this.offsetDistance = typeof options.offsetDistance !== 'undefined' ? options.offsetDistance : 15;
  this.offsetAngle = options.offsetAngle || 0;
  this.opacity = typeof options.opacity !== 'undefined' ? options.opacity : 0;
  this.minOpacity = typeof options.minOpacity !== 'undefined' ? options.minOpacity : 0.1;
  this.maxOpacity = typeof options.maxOpacity !== 'undefined' ? options.maxOpacity : 0.5;
  this.target = options.target || null;
  this.activated = !!options.activated;
  this.activatedColor = options.activatedColor || [255, 255, 255];
  this.onConsume = options.onConsume || null;
  this.onDestroy = options.onDestroy || null;
  this.parent = options.parent || null;
  this.delay = options.delay || 0;

  this.activationLocation = new Vector();
  this._force = new Vector(); // used as a cache Vector
  this.visibility = 'hidden';
  this.clock = 0;
};

/**
 * Called every frame, step() updates the instance's properties.
 */
Sensor.prototype.step = function() {

  this.visibility = 'visible';

  if (this.parent) { // parenting

    if (this.offsetDistance) {

      r = this.offsetDistance; // use angle to calculate x, y
      theta = Utils.degreesToRadians(this.parent.angle + this.offsetAngle);
      x = r * Math.cos(theta);
      y = r * Math.sin(theta);

      this.location.x = this.parent.location.x;
      this.location.y = this.parent.location.y;
      this.location.add(new Vector(x, y)); // position the child

      if (this.pointToParentDirection) {
        this.angle = Utils.radiansToDegrees(Math.atan2(this.parent.velocity.y, this.parent.velocity.x));
      }
    } else {
      this.location.x = this.parent.location.x;
      this.location.y = this.parent.location.y;
    }
  }

  var check = false;

  /**
   * Check if any Stimulus objects exist that match this sensor. If so,
   * loop thru the list and check if sensor should activate.
   */

  if (this.delay <= this.clock) {

    var list = System.getAllItemsByAttribute('type', this.type, this.targetClass || 'Stimulus');

    // we want to target the closest target
    var possibleTargets = [];

    for (var i = 0, max = list.length; i < max; i++) {
      if (this._sensorActive(list[i], this.sensitivity) && !list[i].parent) {
        possibleTargets.push(list[i]);
      }
    }

    if (possibleTargets.length > 0) {
      // loop thru
      for (var j = 0, maxj = possibleTargets.length; j < maxj; j++) {
        // add a property that is the distance to this agent
        possibleTargets[j].distToSensor = Vector.VectorDistance(possibleTargets[j].location, this.location);
      }

      // sort list
      possibleTargets.sort(function(a,b){return (a.distToSensor - b.distToSensor);});

      // take first in list
      this.target = possibleTargets[0]; // target this stimulator
      if (!this.activationLocation.x && !this.activationLocation.y) {
        this.activationLocation.x = this.parent.location.x;
        this.activationLocation.y = this.parent.location.y;
      }
      this.activated = true; // set activation
      this.activatedColor = this.target.color;

      check = true;
    }
  }

  if (!check) {
    this.target = null;
    this.activated = false;
    this.state = null;
    this.color = [255, 255, 255];
    this.opacity = this.minOpacity;
    this.activationLocation.x = null;
    this.activationLocation.y = null;
    if (this.connector) {
      System.remove(this.connector);
      this.connector = null;
    }
  } else {
    this.opacity = this.maxOpacity;
  }

  this.clock++;
  this.afterStep.call(this);
};



Sensor.prototype.getBehavior = function() {

  var i, iMax, j, jMax;

  switch (this.behavior) {

    case 'CONSUME':
      return function(sensor, target) {

        /**
         * CONSUME
         * If inside the target, target shrinks.
         */
         if (Utils.isInside(sensor.parent, target)) {

            if (target.scale > 2) {
              target.scale *= 0.95;
              if (!sensor.parent[target.type + 'Level']) {
                sensor.parent[target.type + 'Level'] = 0;
              }
              sensor.parent[target.type + 'Level'] += 1;
            } else {
              if (sensor.onConsume && !target.consumed) {
                target.consumed = true;
                sensor.onConsume.call(this, sensor, target);
              }
              System.remove(target);
              return;
            }
            if (target.height > 1) {
              target.height *= 0.95;
            }
            if (target.borderWidth > 0) {
              target.borderWidth *= 0.95;
            }
            if (target.boxShadowSpread > 0) {
              target.boxShadowSpread *= 0.95;
            }
         }
      };

    case 'DESTROY':
      return function(sensor, target) {

        /**
         * DESTROY
         * If inside the target, ssytem destroys target.
         */
         if (Utils.isInside(sensor.parent, target)) {

            System.add('ParticleSystem', {
              location: new Vector(target.location.x, target.location.y),
              lifespan: 20,
              borderColor: target.borderColor,
              startColor: target.color,
              endColor: target.color
            });
            System.remove(target);

            if (sensor.onDestroy) {
              sensor.onDestroy.call(this, sensor, target);
            }
         }
      };

    case 'LIKES':
      return function(sensor, target) {

        /**
         * LIKES
         * Steer toward target at max speed.
         */

        // desiredVelocity = difference in target location and agent location
        var desiredVelocity = Vector.VectorSub(target.location, this.location);

        // limit to the maxSteeringForce
        desiredVelocity.limit(this.maxSteeringForce);

        return desiredVelocity;
      };

    case 'COWARD':
      return function(sensor, target) {

        /**
         * COWARD
         * Steer away from target at max speed.
         */

        // desiredVelocity = difference in target location and agent location
        var desiredVelocity = Vector.VectorSub(target.location, this.location);

        // reverse the force
        desiredVelocity.mult(-0.075);

        // limit to the maxSteeringForce
        desiredVelocity.limit(this.maxSteeringForce);

        return desiredVelocity;
      };

    case 'AGGRESSIVE':
      return function(sensor, target) {

        /**
         * AGGRESSIVE
         * Steer and arrive at target. Aggressive agents will hit their target.
         */

        // velocity = difference in location
        var desiredVelocity = Vector.VectorSub(target.location, this.location);

        // get distance to target
        var distanceToTarget = desiredVelocity.mag();

        if (distanceToTarget < this.scale * 2) {

          // normalize desiredVelocity so we can adjust. ie: magnitude = 1
          desiredVelocity.normalize();

          // as agent gets closer, velocity decreases
          var m = distanceToTarget / this.maxSpeed;

          // extend desiredVelocity vector
          desiredVelocity.mult(m);

        }

        // subtract current velocity from desired to create a steering force
        desiredVelocity.sub(this.velocity);

        // limit to the maxSteeringForce
        desiredVelocity.limit(this.maxSteeringForce);

        return desiredVelocity;

      };

    case 'CURIOUS':
      return function(sensor, target) {

        /**
         * CURIOUS
         * Steer and arrive at midpoint bw target location and agent location.
         * After arriving, reverse direction and accelerate to max speed.
         */

        var desiredVelocity, distanceToTarget;

        if (sensor.state !== 'running') {

          var midpoint = sensor.activationLocation.midpoint(target.location);

          // velocity = difference in location
          desiredVelocity = Vector.VectorSub(midpoint, this.location);

          // get distance to target
          distanceToTarget = desiredVelocity.mag();

          // normalize desiredVelocity so we can adjust. ie: magnitude = 1
          desiredVelocity.normalize();

          // as agent gets closer, velocity decreases
          var m = distanceToTarget / this.maxSpeed;

          // extend desiredVelocity vector
          desiredVelocity.mult(m);

          // subtract current velocity from desired to create a steering force
          desiredVelocity.sub(this.velocity);

          if (m < 0.5) {
            sensor.state = 'running';
          }
        } else {

          // note: desired velocity when running is the difference bw target and this agent
          desiredVelocity = Vector.VectorSub(target.location, this.location);

          // reverse the force
          desiredVelocity.mult(-1);

        }

        // limit to the maxSteeringForce
        desiredVelocity.limit(this.maxSteeringForce);

        return desiredVelocity;
      };

    case 'EXPLORER':
      return function(sensor, target) {

        /**
         * EXPLORER
         * Gets close to target but does not change velocity.
         */

        // velocity = difference in location
        var desiredVelocity = Vector.VectorSub(target.location, this.location);

        // get distance to target
        var distanceToTarget = desiredVelocity.mag();

        // normalize desiredVelocity so we can adjust. ie: magnitude = 1
        desiredVelocity.normalize();

        // as agent gets closer, velocity decreases
        var m = distanceToTarget / this.maxSpeed;

        // extend desiredVelocity vector
        desiredVelocity.mult(-m);

        // subtract current velocity from desired to create a steering force
        desiredVelocity.sub(this.velocity);

        // limit to the maxSteeringForce
        desiredVelocity.limit(this.maxSteeringForce * 0.05);

        // add motor speed
        this.motorDir.x = this.velocity.x;
        this.motorDir.y = this.velocity.y;
        this.motorDir.normalize();
        if (this.velocity.mag() > this.motorSpeed) { // decelerate to defaultSpeed
          this.motorDir.mult(-this.motorSpeed);
        } else {
          this.motorDir.mult(this.motorSpeed);
        }

        desiredVelocity.add(this.motorDir);

        return desiredVelocity;

      };

    case 'LOVES':
      return function(sensor, target) {

        /**
         * LOVES
         * Steer and arrive at target.
         */

        // velocity = difference in location
        var desiredVelocity = Vector.VectorSub(target.location, this.location);

        // get total distance
        var distanceToTarget = desiredVelocity.mag();

        if (distanceToTarget > this.scale / 2) {

          // normalize so we can adjust
          desiredVelocity.normalize();

          //
          var m = distanceToTarget / this.maxSpeed;

          desiredVelocity.mult(m);

          var steer = Vector.VectorSub(desiredVelocity, this.velocity);
          steer.limit(this.maxSteeringForce * 0.25);
          return steer;
        }

        this.angle = Utils.radiansToDegrees(Math.atan2(desiredVelocity.y, desiredVelocity.x));

        this._force.x = 0;
        this._force.y = 0;
        return this._force;
      };

    case 'ACCELERATE':
      return function(sensor, target) {

        /**
         * ACCELERATE
         * Accelerate to max speed.
         */

        this._force.x = this.velocity.x;
        this._force.y = this.velocity.y;
        return this._force.mult(2);
      };

    case 'DECELERATE':
      return function(sensor, target) {

        /**
         * DECELERATE
         * Decelerate to min speed.
         */

        this._force.x = this.velocity.x;
        this._force.y = this.velocity.y;
        return this._force.mult(-2);
      };
  }

};

/**
 * Checks if a sensor can detect a stimulus object. Note: Assumes
 * target is a circle.
 *
 * @param {Object} target The stimulator.
 * @return {Boolean} true if sensor's range intersects target.
 */
Sensor.prototype._sensorActive = function(target) {

  // Two circles intersect if distance bw centers is less than the sum of the radii.
  var distance = Vector.VectorDistance(this.location, target.location),
      sensorRadius = this.sensitivity / 2,
      targetRadius = target.scale / 2;

  return distance < sensorRadius + targetRadius;
};

module.exports = Sensor;

},{"./mover":24,"bitshadowmachine":5}],29:[function(require,module,exports){
var BorderPalette = require('borderpalette'),
    ColorPalette = require('colorpalette'),
    config = require('./config').config,
    Mover = require('./mover'),
    Utils = require('bitshadowmachine').Utils;

/**
 * Creates a new Stimulus.
 *
 * @constructor
 * @extends Mover
 */
function Stimulus() {
  Mover.call(this);
}
Utils.extend(Stimulus, Mover);

/**
 * Specific background and box-shadow colors have been added to config.js. When initialized,
 * a new Stimulus item pulls colors from palettes based on these colors.
 */
var i, max, pal, color, border;

/**
 * By default, Stimulus items get a border style randomly selected
 * from a predetermined list.
 * @static
 * @type {Array}
 */
Stimulus.borderStyles = ['double', 'double', 'dotted', 'dashed'];
Stimulus.palettes = {};
Stimulus.borderColors = {};
Stimulus.boxShadowColors = {};

for (i = 0, max = config.defaultColorList.length; i < max; i++) {
  color = config.defaultColorList[i];
  pal = new ColorPalette();
  pal.addColor({
    min: 20,
    max: 200,
    startColor: color.startColor,
    endColor: color.endColor
  });
  Stimulus.palettes[color.name] = pal;
  Stimulus.borderColors[color.name] = color.borderColor;
  Stimulus.boxShadowColors[color.name] = color.boxShadowColor;
}

Stimulus.borderPalette = new BorderPalette();
for (i = 0, max = Stimulus.borderStyles.length; i < max; i++) {
  border = Stimulus.borderStyles[i];
  Stimulus.borderPalette.addBorder({
    min: 2,
    max: 10,
    style: border
  });
}

/**
 * Initializes an instance.
 *
 * @param {Object} [options=] A map of initial properties.
 * @param {Array} [options.mass = 50] Mass.
 * @param {Array} [options.isStatic = true] isStatic.
 * @param {Array} [options.width = 50] Width.
 * @param {Array} [options.height = 50] Height.
 * @param {Array} [options.opacity = 0.75] Opacity.
 * @param {Array} [options.color = [255, 255, 255]] Color.
 * @param {number} [options.borderWidth = this.width / getRandomNumber(2, 8)] Border width.
 * @param {string} [options.borderStyle = 'double'] Border style.
 * @param {Array} [options.borderColor = [220, 220, 220]] Border color.
 * @param {number} [options.borderRadius = 100] Border radius.
 * @param {number} [options.boxShadowSpread = this.width / getRandomNumber(2, 8)] Box-shadow spread.
 * @param {Array} [options.boxShadowColor = [200, 200, 200]] Box-shadow color.
 */
Stimulus.prototype.init = function(world, opt_options) {

  Stimulus._superClass.init.call(this, world, opt_options);

  var options = opt_options || {};

  if (!options.type || typeof options.type !== 'string') {
    throw new Error('Stimulus requires \'type\' parameter as a string.');
  }

  this.type = options.type;

  this.mass = typeof options.mass !== 'undefined' ? options.mass : 50;
  this.isStatic = typeof options.isStatic !== 'undefined' ? options.isStatic : true;
  //this.width = typeof options.width !== 'undefined' ? options.width : 50;
  //this.height = typeof options.height !== 'undefined' ? options.height : 50;
  this.scale = options.scale || 10;
  this.opacity = typeof options.opacity !== 'undefined' ? options.opacity : 0.75;

  this.color = options.color || (Stimulus.palettes[this.type] ?
      Stimulus.palettes[this.type].getColor() : [255, 255, 255]);

  /*this.borderColor = options.borderColor || (Stimulus.palettes[this.type] ?
    Stimulus.palettes[this.type].getColor() : [220, 220, 220]);

  this.boxShadowColor = options.boxShadowColor || (Stimulus.boxShadowColors[this.type] ?
    Stimulus.boxShadowColors[this.type] : [200, 200, 200]);

  this.borderWidth = typeof options.borderWidth !== 'undefined' ?
      options.borderWidth : this.width / Utils.getRandomNumber(2, 8);

  this.borderStyle = typeof options.borderStyle !== 'undefined' ?
      options.borderStyle : Stimulus.borderPalette.getBorder();

  this.borderRadius = typeof options.borderRadius !== 'undefined' ?
      options.borderRadius : 100;

  this.boxShadowSpread = typeof options.boxShadowSpread !== 'undefined' ?
      options.boxShadowSpread : this.width / Utils.getRandomNumber(2, 8);*/

};

module.exports = Stimulus;

},{"./config":21,"./mover":24,"bitshadowmachine":5,"borderpalette":9,"colorpalette":18}],30:[function(require,module,exports){
var Mover = require('./mover'),
    SimplexNoise = require('quietriot'),
    Utils = require('bitshadowmachine').Utils,
    Vector = require('bitshadowmachine').Vector;

/**
 * Creates a new Walker.
 *
 * Walkers have no seeking, steering or directional behavior and just randomly
 * explore their World. Use Walkers to create wandering objects or targets
 * for Agents to seek. They are not affected by gravity or friction.
 *
 * @constructor
 * @extends Mover
 */
function Walker(opt_options) {
  Mover.call(this);
}
Utils.extend(Walker, Mover);

/**
 * Initializes an instance.
 *
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {number} [opt_options.width = 10] Width.
 * @param {number} [opt_options.height = 10] Height.
 * @param {boolean} [opt_options.remainsOnScreen = false] If set to true and perlin = true, object will avoid world edges.
 * @param {number} [opt_options.maxSpeed = 1] maxSpeed.
 * @param {boolean} [opt_options.perlin = true] If set to true, object will use Perlin Noise to calculate its location.
 * @param {number} [opt_options.perlinSpeed = 0.005] If perlin = true, perlinSpeed determines how fast the object location moves through the noise space.
 * @param {number} [opt_options.perlinTime = 0] Sets the Perlin Noise time.
 * @param {number} [opt_options.perlinAccelLow = -0.075] The lower bound of acceleration when perlin = true.
 * @param {number} [opt_options.perlinAccelHigh = 0.075] The upper bound of acceleration when perlin = true.
 * @param {number} [opt_options.perlinOffsetX = Math.random() * 10000] The x offset in the Perlin Noise space.
 * @param {number} [opt_options.perlinOffsetY = Math.random() * 10000] The y offset in the Perlin Noise space.
 * @param {string|Array} [opt_options.color = 255, 150, 50] Color.
 * @param {string|number} [opt_options.borderWidth = '1em'] Border width.
 * @param {string} [opt_options.borderStyle = 'double'] Border style.
 * @param {string|Array} [opt_options.borderColor = 255, 255, 255] Border color.
 * @param {string} [opt_options.borderRadius = 100] Border radius.
 * @param {number} [opt_options.opacity = 0.75] The object's opacity.
 * @param {number} [opt_options.zIndex = 1] The object's zIndex.
 */
Walker.prototype.init = function(world, opt_options) {
  Walker._superClass.init.call(this, world, opt_options);

  var options = opt_options || {};

  this.width = typeof options.width === 'undefined' ? 10 : options.width;
  this.height = typeof options.height === 'undefined' ? 10 : options.height;
  this.remainsOnScreen = !!options.remainsOnScreen;
  this.maxSpeed = typeof options.maxSpeed === 'undefined' ? 1 : options.maxSpeed;
  this.perlin = typeof options.perlin === 'undefined' ? true : options.perlin;
  this.perlinSpeed = typeof options.perlinSpeed === 'undefined' ? 0.005 : options.perlinSpeed;
  this.perlinTime = options.perlinTime || 0;
  this.perlinAccelLow = typeof options.perlinAccelLow === 'undefined' ? -0.075 : options.perlinAccelLow;
  this.perlinAccelHigh = typeof options.perlinAccelHigh === 'undefined' ? 0.075 : options.perlinAccelHigh;
  this.perlinOffsetX = typeof options.perlinOffsetX === 'undefined' ? Math.random() * 10000 : options.perlinOffsetX;
  this.perlinOffsetY = typeof options.perlinOffsetY === 'undefined' ? Math.random() * 10000 : options.perlinOffsetY;
  this.color = options.color || [255, 150, 50];
  this.borderWidth = typeof options.borderWidth === 'undefined' ? 0 : options.borderWidth;
  this.borderStyle = options.borderStyle || 'none';
  this.borderColor = options.borderColor || [255, 255, 255];
  this.borderRadius = typeof options.borderRadius === 'undefined' ? 100 : options.borderRadius;
  this.opacity = typeof options.opacity === 'undefined' ? 1 : options.opacity;
  this.zIndex = typeof options.zIndex === 'undefined' ? 0 : options.zIndex;

  this._randomVector = new Vector();
};

/**
 * If walker uses perlin noise, updates acceleration based on noise space. If walker
 * is a random walker, updates location based on random location.
 */
Walker.prototype.applyAdditionalForces = function() {

  // walker use either perlin noise or random walk
  if (this.perlin) {

    this.perlinTime += this.perlinSpeed;

    if (this.remainsOnScreen) {
      this.acceleration = new Vector();
      this.velocity = new Vector();
      this.location.x =  Utils.map(SimplexNoise.noise(this.perlinTime + this.perlinOffsetX, 0), -1, 1, 0, this.world.width);
      this.location.y =  Utils.map(SimplexNoise.noise(0, this.perlinTime + this.perlinOffsetY), -1, 1, 0, this.world.height);
    } else {
      this.acceleration.x =  Utils.map(SimplexNoise.noise(this.perlinTime + this.perlinOffsetX, 0), -1, 1, this.perlinAccelLow, this.perlinAccelHigh);
      this.acceleration.y =  Utils.map(SimplexNoise.noise(0, this.perlinTime + this.perlinOffsetY), -1, 1, this.perlinAccelLow, this.perlinAccelHigh);
    }
    return;
  }

  // point to a random angle and move toward it
  this._randomVector.x = 1;
  this._randomVector.y = 1;
  this._randomVector.normalize();
  this._randomVector.rotate(Utils.degreesToRadians(Utils.getRandomNumber(0, 359)));
  this._randomVector.mult(this.maxSpeed);
  this.applyForce(this._randomVector);
};

module.exports = Walker;

},{"./mover":24,"bitshadowmachine":5,"quietriot":19}]},{},[23])(23)
});