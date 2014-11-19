!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.TinyTornado=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var BitShadowItems = {
  Mover: require('./mover'),
  Oscillator: require('./oscillator'),
  Particle: require('./particle')
};

// TODO: add...
//Agent: require('./agent'),
//Attractor: require('./attractor'),
//Connector: require('./connector'),
//Dragger: require('./dragger'),
//FlowField: require('./flowfield'),
//ParticleSystem: require('./particlesystem'),
//Point: require('./point'),
//RangeDisplay: require('./rangedisplay'),
//Repeller: require('./repeller'),
//Sensor: require('./sensor'),
//Stimulus: require('./stimulus'),
//Walker: require('./walker')

module.exports = BitShadowItems;

},{"./mover":2,"./oscillator":3,"./particle":4}],2:[function(require,module,exports){
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
 * @param  {Object} world An instance of World.
 * @param  {Object} opt_options A map of initial properties.
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
  this.borderRadius = options.borderRadius || 0;
  this.borderWidth = options.borderWidth || 0;
  this.borderStyle = options.borderStyle || 'none';
  this.borderColor = options.borderColor || [0, 0, 0];
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

},{"bitshadowmachine":9}],3:[function(require,module,exports){
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

},{"bitshadowmachine":9,"quietriot":21}],4:[function(require,module,exports){
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

},{"./mover":2,"bitshadowmachine":9}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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


},{"./item":8,"./system":10,"burner":16}],7:[function(require,module,exports){
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
},{"./item":8,"./system":10,"burner":16}],8:[function(require,module,exports){
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
    this.velocity.mult(-this.bounciness);
    this.location.y = 0;
    return;
  }

  if (this.location.x > this.world.width) { // right
    this.velocity.mult(-this.bounciness);
    this.location.x = this.world.width;
    return;
  }

  if (this.location.y > this.world.height) { // bottom
    this.velocity.mult(-this.bounciness);
    this.location.y = this.world.height;
    return;
  }

  if (this.location.x < 0) { // left
    this.velocity.mult(-this.bounciness);
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

},{"burner":16}],9:[function(require,module,exports){
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
},{"./anim":6,"./animunit":7,"./item":8,"./system":10,"burner":16,"quietriot":21}],10:[function(require,module,exports){
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
  if (System.saveData) {
    System.saveDataComplete(System.clock, System.data);
  }
  System.clock++;
  if (FPSDisplay.active) { // TODO: test this
    FPSDisplay.update(len);
  }
  System.frameFunction.call(this);
  if (typeof window.requestAnimationFrame !== 'undefined') {
    window.requestAnimationFrame(System.loop);
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

},{"./item":8,"./world":11,"burner":16,"fpsdisplay":5}],11:[function(require,module,exports){
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

},{"./item":8,"burner":16}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
module.exports=require(5)
},{"/Users/vince/Dev/Foldi/tinytornado/node_modules/bitshadowmachine/node_modules/fpsdisplay/src/fpsdisplay.js":5}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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
    this.el = document.createElement('div');
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

},{"vector2d-lib":14}],16:[function(require,module,exports){
module.exports = {
  Item: require('./item'),
  System: require('./system'),
  Utils: require('drawing-utils-lib'),
  Vector: require('vector2d-lib'),
  World: require('./world')
};

},{"./item":15,"./system":17,"./world":18,"drawing-utils-lib":12,"vector2d-lib":14}],17:[function(require,module,exports){
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

},{"./item":15,"./world":18,"drawing-utils-lib":12,"fpsdisplay":13,"vector2d-lib":14}],18:[function(require,module,exports){
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

},{"./item":15,"drawing-utils-lib":12,"vector2d-lib":14}],19:[function(require,module,exports){
module.exports=require(12)
},{"/Users/vince/Dev/Foldi/tinytornado/node_modules/burner/node_modules/drawing-utils-lib/src/drawing-utils-lib.js":12}],20:[function(require,module,exports){
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

},{"drawing-utils-lib":19}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
var Burner = require('burner');
var Utils = require('burner').Utils;
var Vector = require('burner').Vector;

/**
 * Creates a new Base.
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {boolean} [opt_options.width = 10] Width.
 * @param {boolean} [opt_options.height = 10] Height.
 * @param {boolean} [opt_options.color = 0] Color.
 * @param {boolean} [opt_options.perlin = true] Set to true to move the base via perlin noise.
 * @param {number} [opt_options.perlinSpeed = 0.0001] Perlin speed.
 * @param {number} [opt_options.perlinTime = 100] Initial perlin time.
 * @param {Object} [opt_options.initialLocation = bottom middle of the world] Initial base location.
 * @param {Object} [opt_options.amplitude = world.width / 4, 0] Limit of the base location.
 * @param {number} [opt_options.opacity = 0] Opacity.
 * @constructor
 */
function Base(opt_options) {

  var options = opt_options || {};

  this.width = typeof options.width !== 'undefined' ? options.width : 10;
  this.height = typeof options.height !== 'undefined' ? options.height : 10;
  this.color = typeof options.color !== 'undefined' ? options.color : 0;
  this.perlin = typeof options.perlin !== 'undefined' ? options.perlin : true;
  this.perlinSpeed = options.perlinSpeed || 0.0001;
  this.perlinTime = options.perlinTime || 100;
  this.initialLocation = options.initialLocation || null;
  this.amplitude = options.amplitude || null;
  this.opacity = options.opacity || 0;
  this.particleOptions = options.particleOptions || {};
}

/**
 * Configures an instance.
 * @param  {Object} world A world.
 * @memberOf Base
 */
Base.prototype.configure = function(world) {
  this.initialLocation = new Vector(world.width / 2, world.height);
  this.amplitude = new Vector(world.width / 4, 0);
};

module.exports = Base;

},{"burner":16}],23:[function(require,module,exports){
var ColorPalette = require('colorpalette');
var System = require('bitshadowmachine').System;
var Utils = require('burner').Utils;
var Vector = require('burner').Vector;

/**
 * Creates a new DebrisBit.
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {number} [opt_options.sizeMin = 1] Minimum particle size.
 * @param {number} [opt_options.sizeMax = 3] Maximum particle size.
 * @param {number} [opt_options.speedMin = 1] Minimum particle speed.
 * @param {number} [opt_options.speedMax = 20] Maximum particle speed.
 * @param {number} [opt_options.opacityMin = 0.1] Minimum opacity.
 * @param {number} [opt_options.opacityMax = 0.2] Maximum opacity.
 * @param {number} [opt_options.lifespanMin = 70] Minimum lifespan.
 * @param {number} [opt_options.lifespanMax = 120] Maximum lifespan.
 * @param {number} [opt_options.colorMin = 100] Minimum color. Valid values bw 0 - 255.
 * @param {number} [opt_options.colorMax = 200] Maximum color. Valid values bw 0 - 255.
 * @constructor
 */
function DebrisBit(opt_options) {

  var options = opt_options || {};

  this.sizeMin = typeof options.sizeMin !== 'undefined' ? options.sizeMin : 1;
  this.sizeMax = typeof options.sizeMax !== 'undefined' ? options.sizeMax : 2;
  this.speedMin = typeof options.speedMin !== 'undefined' ? options.speedMin : 1;
  this.speedMax = typeof options.speedMax !== 'undefined' ? options.speedMax : 30;
  this.opacityMin = typeof options.opacityMin !== 'undefined' ? options.opacityMin : 0.05;
  this.opacityMax = typeof options.opacityMax !== 'undefined' ? options.opacityMax : 0.3;
  this.lifespanMin = typeof options.lifespanMin !== 'undefined' ? options.lifespanMin : 70;
  this.lifespanMax = typeof options.lifespanMax !== 'undefined' ? options.lifespanMax : 120;
  this.colorMin = typeof options.colorMin !== 'undefined' ? options.colorMin : 100;
  this.colorMax = typeof options.colorMax !== 'undefined' ? options.colorMax : 200;
  this.rate = options.rate || 1;
  this.fade = !!options.fade;

  this.width = 0;
  this.height = 0;
  this.lifespan = -1;
  this.startColor = [100, 100, 100]; // TODO: make these options
  this.endColor = [200, 200, 200];
  this.pl = new ColorPalette();
  this.pl.addColor({ // adds a random sampling of colors to palette
    min: 12,
    max: 24,
    startColor: this.startColor,
    endColor: this.endColor
  });
  this.opacity = 0;
  this.beforeStep = this._beforeStep.bind(this);

}

/**
 * Called before each step function.
 * @private
 * @memberOf DebrisBit
 */
DebrisBit.prototype._beforeStep = function() {

  for (var i = 0; i < 1; i++) {

    var accel = new Vector(1, 1);
    accel.normalize();
    accel.mult(Utils.getRandomNumber(0.1, 0.25, true));
    accel.rotate(Utils.degreesToRadians(Utils.getRandomNumber(140, 310, true)));
    this.acceleration = accel;

    var size = Utils.getRandomNumber(this.sizeMin, this.sizeMax, this.sizeMin || this.sizeMax);
    var maxSpeed = Utils.getRandomNumber(this.speedMin, this.speedMax, true);
    var opacity = Utils.map(size, this.sizeMin, this.sizeMax, this.opacityMax, this.opacityMin);
    var lifespan = Utils.getRandomNumber(this.lifespanMin, this.lifespanMax);
    var color = Utils.getRandomNumber(this.colorMin, this.colorMax);

    System.add('Particle', {
      location: new Vector(this.parent.location.x, this.parent.location.y),
      acceleration: accel,
      scale: size,
      maxSpeed: maxSpeed,
      opacity: opacity,
      fade: this.fade,
      lifespan: lifespan
    });
  }
};

/**
 * Configures an instance of DebrisBit.
 * @param {Object} [opt_options=] A map of options.
 * @param {Object} [opt_options.parent = null] The DebrisBit's parent.
 * @memberOf DebrisBit
 */
DebrisBit.prototype.configure = function(opt_options) {
  var options = opt_options || {};
  this.parent = options.parent || null;
};

module.exports = DebrisBit;

},{"bitshadowmachine":9,"burner":16,"colorpalette":20}],24:[function(require,module,exports){
var BitShadowMachine = require('bitshadowmachine');
var Mover = require('bitshadowitems').Mover;
var Oscillator = require('bitshadowitems').Oscillator;
var Particle = require('bitshadowitems').Particle;
var Utils = require('burner').Utils;
var Vector = require('burner').Vector;
var SimplexNoise = require('quietriot');
var Easing = require('../easing');

/**
 * Creates a new RunnerBit.
 * @param {Object} base A map of properties describing the base of the tornado.
 * @param {Object} debris A map of properties describing the debris at the base of the tornado.
 * @param {Object} spine A map of properties describing the tornado's spine.
 * @param {Object} shell A map of properties describing the tornado's shell (funnel).
 * @constructor
 */
function RunnerBit(base, debris, spine, shell) {
  this.base = base;
  this.debris = debris;
  this.spine = spine;
  this.shell = shell;
}

/**
 * Holds a Perlin noise value.
 * @type {Number}
 * @memberof RunnerBit
 */
RunnerBit.noise = 0;

/**
 * Initializes an instance of RunnerBit.
 * @param {Object} [opt_options=] A map of initial world properties.
 * @param {Object} [opt_options.el = document.body] World's DOM object.
 * @param {number} [opt_options.width = 800] World width in pixels.
 * @param {number} [opt_options.height = 600] World height in pixels.
 * @param {number} [opt_options.borderWidth = 1] World border widthin pixels.
 * @param {string} [opt_options.borderStyle = 'solid'] World border style.
 * @param {Object} [opt_options.borderColor = 0, 0, 0] World border color.
 * @memberof RunnerBit
 */
RunnerBit.prototype.init = function(opt_options) {

  var options = opt_options || {};

  BitShadowMachine.System.Classes = {
    Mover: Mover,
    Oscillator: Oscillator,
    Particle: Particle
  };
  BitShadowMachine.System.setup(this._setupCallback.bind(this, options));
  BitShadowMachine.System.clock = 10000; // advance the clock so we start deeper in the noise space
  BitShadowMachine.System.loop(this._getNoise.bind(this));
};

/**
 * Sets up the world and items.
 * @param {Object} options World options.
 * @memberof RunnerBit
 * @private
 */
RunnerBit.prototype._setupCallback = function(options) {

  var rand = Utils.getRandomNumber,
      map = Utils.map;

  var world = BitShadowMachine.System.add('World', {
    el: options.el || document.body,
    resolution: options.resolution || 4,
    color: options.color || [40, 40, 40],
    width: options.width || 800,
    height: options.height || 600,
    gravity: new Vector(),
    c: 0
  });

  // BASE
  this.base.configure(world);
  var myBase = BitShadowMachine.System.add('Oscillator', this.base);

  // DEBRIS
  this.debris.configure({
    parent: myBase
  });
  BitShadowMachine.System.add('Mover', this.debris);

  // SPINE
  for (var i = 0, max = Math.floor(world.height / this.spine.density); i < max; i++) {

    var ease = Easing[this.spine.easing].call(null, i, 0, 1, max - 1);

    // joints
    var joint = BitShadowMachine.System.add('Mover', {
      parent: myBase,
      offsetDistance: ease * world.height,
      offsetAngle: 270,
      opacity: this.spine.opacity,
      afterStep: this._jointAfterStep
    });
    joint.index = i;

    // use Perlin noise to generate the parent node's offset from the funnel's y-axis
    // use easing so the effect is amplified
    joint.offsetFromCenter = Easing.easeInSine(i, 0, 1, max - 1) *
        SimplexNoise.noise(i * 0.1, 0) * 10;

    // pillows
    var easeShellShape = Easing[this.shell.easing].call(null, i, 0, 1, max - 1);

    var colorNoise = Math.floor(Utils.map(SimplexNoise.noise(i * 0.05, 0),
        -1, 1, this.shell.colorMin, this.shell.colorMax));

    for (var j = 0; j < (i + 1) * 4; j++) {

      var scale = (easeShellShape * this.shell.maxScale) + this.shell.minScale;
      BitShadowMachine.System.add('Oscillator', {
        perlin: false,
        parent: joint,
        blur: easeShellShape,
        color: [colorNoise, colorNoise, colorNoise],
        opacity: Utils.map(scale, this.shell.minScale, this.shell.maxScale, 0.3, 0.1),
        scale: scale,
        amplitude: new Vector(Utils.map(easeShellShape, 0, 1, 1, rand(50, 100)),
            Utils.map(easeShellShape, 0, 1, 1, rand(10, 64))),
        acceleration: new BitShadowMachine.Vector(2 / (i + 1), 0.05),
        aVelocity: new BitShadowMachine.Vector(rand(0, 40), rand(0, 40))
      });
    }
  }
};

/**
 * Called at the end of the joints' step function.
 * @memberof RunnerBit
 * @private
 */
RunnerBit.prototype._jointAfterStep = function() {
  var offset = this.index * this.offsetFromCenter * RunnerBit.noise;
  this.location.x = this.location.x + offset;
};

/**
 * Called at the end of each animation frame.
 * @memberof RunnerBit
 * @private
 */
RunnerBit.prototype._getNoise = function() {
  RunnerBit.noise = SimplexNoise.noise(BitShadowMachine.System.clock * 0.0001, 0);
};

module.exports = RunnerBit;

},{"../easing":27,"bitshadowitems":1,"bitshadowmachine":9,"burner":16,"quietriot":21}],25:[function(require,module,exports){
/**
 * Creates a new Shell.
 *
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {number} [opt_options.minScale = 0.3] Minium width of the shell base.
 * @param {number} [opt_options.opacity = 0] shell opacity.
 * @param {number} [opt_options.blur = 350] shell blur. Recommended values bw 300 - 400.
 * @param {number} [opt_options.spread = 250] shell spread. Recommended values bw 200 - 300.
 * @param {string} [opt_options.easing = 'easeInExpo'] An easing function to determine shell shape along the spine. See Easing docs for possible values.
 * @param {number} [opt_options.colorMin = 50] Minimum color. Valid values bw 0 - 255.
 * @param {number} [opt_options.colorMax = 255] Maximum color. Valid values bw 0 - 255.
 * @constructor
 */
function Shell(opt_options) {

  var options = opt_options || {};

  this.minScale = typeof options.minScale !== 'undefined' ? options.minScale : 0.1;
  this.maxScale = typeof options.maxScale !== 'undefined' ? options.maxScale : 8;
  this.opacity = typeof options.opacity !== 'undefined' ? options.opacity : 0.75;
  this.blur = typeof options.blur !== 'undefined' ? options.blur : 30;
  this.easing = options.easing || 'easeInExpo';
  this.colorMin = typeof options.colorMin !== 'undefined' ? options.colorMin : 100;
  this.colorMax = typeof options.colorMax !== 'undefined' ? options.colorMax : 255;
}

module.exports = Shell;

},{}],26:[function(require,module,exports){
var ColorPalette = require('colorpalette');
var System = require('burner').System;
var Utils = require('burner').Utils;
var Vector = require('burner').Vector;

/**
 * Creates a new Debris.
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {number} [opt_options.sizeMin = 1] Minimum particle size.
 * @param {number} [opt_options.sizeMax = 3] Maximum particle size.
 * @param {number} [opt_options.speedMin = 1] Minimum particle speed.
 * @param {number} [opt_options.speedMax = 20] Maximum particle speed.
 * @param {number} [opt_options.opacityMin = 0.1] Minimum opacity.
 * @param {number} [opt_options.opacityMax = 0.2] Maximum opacity.
 * @param {number} [opt_options.lifespanMin = 70] Minimum lifespan.
 * @param {number} [opt_options.lifespanMax = 120] Maximum lifespan.
 * @param {number} [opt_options.colorMin = 100] Minimum color. Valid values bw 0 - 255.
 * @param {number} [opt_options.colorMax = 200] Maximum color. Valid values bw 0 - 255.
 * @constructor
 */
function Debris(opt_options) {

  var options = opt_options || {};

  this.sizeMin = typeof options.sizeMin !== 'undefined' ? options.sizeMin : 1;
  this.sizeMax = typeof options.sizeMax !== 'undefined' ? options.sizeMax : 3;
  this.speedMin = typeof options.speedMin !== 'undefined' ? options.speedMin : 1;
  this.speedMax = typeof options.speedMax !== 'undefined' ? options.speedMax : 30;
  this.opacityMin = typeof options.opacityMin !== 'undefined' ? options.opacityMin : 0.1;
  this.opacityMax = typeof options.opacityMax !== 'undefined' ? options.opacityMax : 0.7;
  this.lifespanMin = typeof options.lifespanMin !== 'undefined' ? options.lifespanMin : 70;
  this.lifespanMax = typeof options.lifespanMax !== 'undefined' ? options.lifespanMax : 120;
  this.colorMin = typeof options.colorMin !== 'undefined' ? options.colorMin : 100;
  this.colorMax = typeof options.colorMax !== 'undefined' ? options.colorMax : 200;

  this.width = 0;
  this.height = 0;
  this.lifespan = -1;
  this.startColor = [100, 100, 100]; // TODO: make these options
  this.endColor = [200, 200, 200];
  this.pl = new ColorPalette();
  this.pl.addColor({ // adds a random sampling of colors to palette
    min: 12,
    max: 24,
    startColor: this.startColor,
    endColor: this.endColor
  });

  this.beforeStep = this._beforeStep.bind(this);

}

/**
 * Called before each step function.
 * @private
 * @memberOf Debris
 */
Debris.prototype._beforeStep = function() {

  if ((System.clock % 3) === 0) {

    var accel = new Vector(1, 1);
    accel.normalize();
    accel.mult(Utils.getRandomNumber(0.1, 1, true));
    accel.rotate(Utils.degreesToRadians(Utils.getRandomNumber(140, 310)));
    this.acceleration = accel;

    var size = Utils.getRandomNumber(this.sizeMin, this.sizeMax, this.sizeMin || this.sizeMax);
    var maxSpeed = Utils.getRandomNumber(this.speedMin, this.speedMax, true);
    var opacity = Utils.getRandomNumber(this.opacityMin, this.opacityMax, true);
    var lifespan = Utils.getRandomNumber(this.lifespanMin, this.lifespanMax, true);
    var color = Utils.getRandomNumber(this.colorMin, this.colorMax);

    System.add('Particle', {
      location: new Vector(this.parent.location.x, this.parent.location.y),
      acceleration: accel,
      width: 0,
      height: 0,
      borderWidth: 0,
      boxShadowBlur: size * 10,
      boxShadowSpread: size * 3,
      boxShadowColor: this.pl.getColor(),
      maxSpeed: maxSpeed,
      opacity: opacity,
      lifespan: lifespan
    });
  }
};

/**
 * Configures an instance of Debris.
 * @param {Object} [opt_options=] A map of options.
 * @param {Object} [opt_options.parent = null] The Debris' parent.
 * @memberOf Debris
 */
Debris.prototype.configure = function(opt_options) {
  var options = opt_options || {};
  this.parent = options.parent || null;
};

module.exports = Debris;

},{"burner":16,"colorpalette":20}],27:[function(require,module,exports){
/**
 * Robert Penner's easing functions. http://gizma.com/easing/
 * @namespace
 */
var Easing = {};

/**
 * Simple linear tweening - no easing, no acceleration
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.linearTween = function (t, b, c, d) {
  return c * t / d + b;
};

/**
 * Quadratic easing in - accelerating from zero velocity
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeInQuad = function (t, b, c, d) {
  t /= d;
  return c * t * t + b;
};

/**
 * Quadratic easing out - decelerating to zero velocity
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeOutQuad = function (t, b, c, d) {
  t /= d;
  return -c * t *(t - 2) + b;
};

/**
 * Quadratic easing in/out - acceleration until halfway, then deceleration
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeInOutQuad = function (t, b, c, d) {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t + b;
  t--;
  return -c / 2 * (t * (t - 2) - 1) + b;
};

/**
 * Cubic easing in - accelerating from zero velocity
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeInCubic = function (t, b, c, d) {
  t /= d;
  return c * t * t * t + b;
};

/**
 * Cubic easing out - decelerating to zero velocity
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeOutCubic = function (t, b, c, d) {
  t /= d;
  t--;
  return c* (t * t * t + 1) + b;
};

/**
 * Cubic easing in/out - acceleration until halfway, then deceleration
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeInOutCubic = function (t, b, c, d) {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t * t + b;
  t -= 2;
  return c / 2 * (t * t * t + 2) + b;
};

/**
 * Quartic easing in - accelerating from zero velocity
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeInQuart = function (t, b, c, d) {
  t /= d;
  return c * t * t * t * t + b;
};

/**
 * Quartic easing out - decelerating to zero velocity
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeOutQuart = function (t, b, c, d) {
  t /= d;
  t--;
  return -c * (t * t * t * t - 1) + b;
};

/**
 * Quartic easing in/out - acceleration until halfway, then deceleration
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeInOutQuart = function (t, b, c, d) {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t * t * t + b;
  t -= 2;
  return -c / 2 * ( t * t * t * t - 2) + b;
};

/**
 * Quintic easing in - accelerating from zero velocity
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeInQuint = function (t, b, c, d) {
  t /= d;
  return c * t * t * t * t * t + b;
};

/**
 * Quintic easing out - decelerating to zero velocity
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeOutQuint = function (t, b, c, d) {
  t /= d;
  t--;
  return c * (t * t * t * t * st + 1) + b;
};

/**
 * Quintic easing in/out - acceleration until halfway, then deceleration
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeInOutQuint = function (t, b, c, d) {
  t /= d / 2;
  if (t < 1) return c / 2 * t * t * t * t * t + b;
  t -= 2;
  return c / 2 * (t * t * t * t * t + 2) + b;
};

/**
 * Sinusoidal easing in - accelerating from zero velocity
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeInSine = function (t, b, c, d) {
  return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
};

/**
 * Sinusoidal easing out - decelerating to zero velocity
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeOutSine = function (t, b, c, d) {
  return c * Math.sin(t / d * (Math.PI / 2)) + b;
};

/**
 * Sinusoidal easing in/out - accelerating until halfway, then decelerating
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeInOutSine = function (t, b, c, d) {
  return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
};

/**
 * Exponential easing in - accelerating from zero velocity
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeInExpo = function (t, b, c, d) {
  return c * Math.pow(2, 10 * (t / d - 1) ) + b;
};

/**
 * Exponential easing out - decelerating to zero velocity
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeOutExpo = function (t, b, c, d) {
  return c * (-Math.pow(2, -10 * t / d ) + 1 ) + b;
};

/**
 * Exponential easing in/out - accelerating until halfway, then decelerating
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeInOutExpo = function (t, b, c, d) {
  t /= d / 2;
  if (t < 1) return c / 2 * Math.pow(2, 10 * (t - 1) ) + b;
  t--;
  return c / 2 * (-Math.pow(2, -10 * t) + 2 ) + b;
};

/**
 * Circular easing in - accelerating from zero velocity
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeInCirc = function (t, b, c, d) {
  t /= d;
  return -c * (Math.sqrt(1 - t * t) - 1) + b;
};

/**
 * Circular easing out - decelerating to zero velocity
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeOutCirc = function (t, b, c, d) {
  t /= d;
  t--;
  return c * Math.sqrt(1 - t * t) + b;
};

/**
 * Circular easing in/out - acceleration until halfway, then deceleration
 * @param  {number} t current time
 * @param  {number} b start value
 * @param  {number} c change in value
 * @param  {number} d duration
 * @return {number} The current easing value.
 */
Easing.easeInOutCirc = function (t, b, c, d) {
  t /= d / 2;
  if (t < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
  t -= 2;
  return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
};

module.exports = Easing;

},{}],28:[function(require,module,exports){
var Item = require('burner').Item,
    System = require('burner').System,
    Utils = require('burner').Utils,
    Vector = require('burner').Vector;

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
function Mover(opt_options) {
  Item.call(this);
}
Utils.extend(Mover, Item);

/**
 * Initializes an instance of Mover.
 * @param  {Object} world An instance of World.
 * @param  {Object} opt_options A map of initial properties.
 * @param {string|Array} [opt_options.color = 255, 255, 255] Color.
 * @param {number} [opt_options.borderRadius = 100] Border radius.
 * @param {number} [opt_options.borderWidth = 2] Border width.
 * @param {string} [opt_options.borderStyle = 'solid'] Border style.
 * @param {Array} [opt_options.borderColor = 60, 60, 60] Border color.
 * @param {boolean} [opt_options.pointToDirection = true] If true, object will point in the direction it's moving.
 * @param {boolean} [opt_options.draggable = false] If true, object can move via drag and drop.
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
  this.borderRadius = options.borderRadius || 0;
  this.borderWidth = options.borderWidth || 0;
  this.borderStyle = options.borderStyle || 'none';
  this.borderColor = options.borderColor || [0, 0, 0];
  this.pointToDirection = typeof options.pointToDirection === 'undefined' ? true : options.pointToDirection;
  this.draggable = !!options.draggable;
  this.parent = options.parent || null;
  this.pointToParentDirection = typeof options.pointToParentDirection === 'undefined' ? true : options.pointToParentDirection;
  this.offsetDistance = typeof options.offsetDistance === 'undefined' ? 0 : options.offsetDistance;
  this.offsetAngle = options.offsetAngle || 0;
  this.isStatic = !!options.isStatic;

  var me = this;

  this.isMouseOut = false;
  this.isPressed = false;
  this.mouseOutInterval = false;
  this._friction = new Vector();

  if (this.draggable) {

    Utils.addEvent(this.el, 'mouseover', (function() {
      return function(e) {
        Mover.mouseover.call(me, e);
      };
    }()));

    Utils.addEvent(this.el, 'mousedown', (function() {
      return function(e) {
        Mover.mousedown.call(me, e);
      };
    }()));

    Utils.addEvent(this.el, 'mousemove', (function() {
      return function(e) {
        Mover.mousemove.call(me, e);
      };
    }()));

    Utils.addEvent(this.el, 'mouseup', (function() {
      return function(e) {
        Mover.mouseup.call(me, e);
      };
    }()));

    Utils.addEvent(this.el, 'mouseout', (function() {
      return function(e) {
        Mover.mouseout.call(me, e);
      };
    }()));
  }
};

/**
 * Handles mouseup events.
 */
Mover.mouseover = function() {
  this.isMouseOut = false;
  clearInterval(this.mouseOutInterval);
};

/**
 * Handles mousedown events.
 */
Mover.mousedown = function() {
  this.isPressed = true;
  this.isMouseOut = false;
};

/**
 * Handles mousemove events.
 * @param  {Object} e An event object.
 */
Mover.mousemove = function(e) {

  var x, y;

  if (this.isPressed) {

    this.isMouseOut = false;

    if (e.pageX && e.pageY) {
      x = e.pageX - this.world.el.offsetLeft;
      y = e.pageY - this.world.el.offsetTop;
    } else if (e.clientX && e.clientY) {
      x = e.clientX - this.world.el.offsetLeft;
      y = e.clientY - this.world.el.offsetTop;
    }

    if (x & y) {
      this.location = new Vector(x, y);
    }

    this._checkWorldEdges();
  }

};

/**
 * Handles mouseup events.
 */
Mover.mouseup = function() {
  this.isPressed = false;
  // TODO: add mouse to obj acceleration
};

/**
 * Handles mouse out events.
 */
Mover.mouseout = function() {

  var x, y, me = this, mouse = System.mouse;

  if (this.isPressed) {

    this.isMouseOut = true;

    this.mouseOutInterval = setInterval(function () { // if mouse is too fast for block update, update via an interval until it catches up

      if (me.isPressed && me.isMouseOut) {

        x = mouse.location.x - me.world.el.offsetLeft;
        y = mouse.location.y - me.world.el.offsetTop;

        me.location = new Vector(x, y);
      }
    }, 16);
  }
};

Mover.prototype.step = function() {

  var i, max, x = this.location.x,
      y = this.location.y;

  this.beforeStep.call(this);

  if (this.isStatic || this.isPressed) {
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

/**
 * Updates the corresponding DOM element's style property.
 * @function draw
 * @memberof Mover
 */
Mover.prototype.draw = function() {
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
    visibility: this.visibility,
    borderRadius: this.borderRadius,
    borderWidth: this.borderWidth,
    borderStyle: this.borderStyle,
    borderColor0: this.borderColor[0],
    borderColor1: this.borderColor[1],
    borderColor2: this.borderColor[2]
  });
  this.el.style.cssText = cssText;
};

/**
 * Concatenates a new cssText string.
 *
 * @function getCSSText
 * @memberof Mover
 * @param {Object} props A map of object properties.
 * @returns {string} A string representing cssText.
 */
Mover.prototype.getCSSText = function(props) {
  return Item._stylePosition.replace(/<x>/g, props.x).replace(/<y>/g, props.y).replace(/<angle>/g, props.angle).replace(/<scale>/g, props.scale) + 'width: ' +
      props.width + 'px; height: ' + props.height + 'px; background-color: ' +
      props.colorMode + '(' + props.color0 + ', ' + props.color1 + (props.colorMode === 'hsl' ? '%' : '') + ', ' + props.color2 + (props.colorMode === 'hsl' ? '%' : '') +');  opacity: ' + props.opacity + '; z-index: ' + props.zIndex + '; visibility: ' + props.visibility + '; border: ' +
      props.borderWidth + 'px ' + props.borderStyle + ' ' + props.colorMode + '(' + props.borderColor0 + ', ' + props.borderColor1 + (props.colorMode === 'hsl' ? '%' : '') + ', ' + props.borderColor2 + (props.colorMode === 'hsl' ? '%' : '') + '); border-radius: ' +
      props.borderRadius + '%;';
};

module.exports = Mover;


},{"burner":16}],29:[function(require,module,exports){
module.exports=require(28)
},{"/Users/vince/Dev/Foldi/tinytornado/src/items/Mover.js":28,"burner":16}],30:[function(require,module,exports){
var Item = require('burner').Item,
    SimplexNoise = require('quietriot'),
    System = require('burner').System,
    Utils = require('burner').Utils,
    Vector = require('burner').Vector;

/**
 * Creates a new Oscillator.
 *
 * Oscillators simulate wave patterns and move according to
 * amplitude and angular velocity. Oscillators are not affected
 * by gravity or friction.
 *
 * @constructor
 * @extends Item
 */
function Oscillator(opt_options) {
  Item.call(this);
}
Utils.extend(Oscillator, Item);

/**
 * Initializes Oscillator.
 * @param  {Object} world An instance of World.
 * @param  {Object} [opt_options=] A map of initial properties.
 * @param {Object} [opt_options.initialLocation = The center of the world] The object's initial location.
 * @param {Object} [opt_options.lastLocation = {x: 0, y: 0}] The object's last location. Used to calculate
 *    angle if pointToDirection = true.
 * @param {Object} [opt_options.amplitude = {x: world width, y: world height}] Sets amplitude, the distance from the object's
 *    initial location (center of the motion) to either extreme.
 * @param {Object} [opt_options.acceleration = {x: 0.01, y: 0}] The object's acceleration. Oscillators have a
 *    constant acceleration.
 * @param {Object} [opt_options.aVelocity = new Vector()] Angular velocity.
 * @param {boolean} [opt_options.isStatic = false] If true, object will not move.
 * @param {boolean} [opt_options.perlin = false] If set to true, object will use Perlin Noise to calculate its location.
 * @param {number} [opt_options.perlinSpeed = 0.005] If perlin = true, perlinSpeed determines how fast the object location moves through the noise space.
 * @param {number} [opt_options.perlinTime = 0] Sets the Perlin Noise time.
 * @param {number} [opt_options.perlinAccelLow = -2] The lower bound of acceleration when perlin = true.
 * @param {number} [opt_options.perlinAccelHigh = 2] The upper bound of acceleration when perlin = true.
 * @param {number} [opt_options.offsetX = Math.random() * 10000] The x offset in the Perlin Noise space.
 * @param {number} [opt_options.offsetY = Math.random() * 10000] The y offset in the Perlin Noise space.
 * @param {number} [opt_options.width = 20] Width.
 * @param {number} [opt_options.height = 20] Height.
 * @param {Array} [opt_options.color = 200, 100, 0] Color.
 * @param {number} [opt_options.borderWidth = this.width / 4] Border width.
 * @param {string} [opt_options.borderStyle = 'solid'] Border style.
 * @param {Array} [opt_options.borderColor = 255, 150, 0] Border color.
 * @param {number} [opt_options.borderRadius = 100] Border radius.
 * @param {number} [opt_options.boxShadowSpread = this.width / 4] Box-shadow spread.
 * @param {Array} [opt_options.boxShadowColor = 147, 199, 196] Box-shadow color.
 */
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
  this.width = typeof options.width === 'undefined' ? 20 : options.width;
  this.height = typeof options.height === 'undefined' ? 20 : options.height;
  this.color = options.color || [200, 100, 0];
  this.borderWidth = options.borderWidth || 0;
  this.borderStyle = options.borderStyle || 'solid';
  this.borderColor = options.borderColor || [255, 150, 50];
  this.borderRadius = typeof options.borderRadius === 'undefined' ? 100 : options.borderRadius;
  this.boxShadowOffsetX = options.boxShadowOffsetX || 0;
  this.boxShadowOffsetY = options.boxShadowOffsetY || 0;
  this.boxShadowBlur = options.boxShadowBlur || 0;
  this.boxShadowSpread = options.boxShadowSpread || 0;
  this.boxShadowColor = options.boxShadowColor || [200, 100, 0];
  this.opacity = typeof options.opacity === 'undefined' ? 0.75 : options.opacity;
  this.zIndex = typeof options.zIndex === 'undefined' ? 1 : options.zIndex;
  this.parent = options.parent || null;
  this.pointToDirection = !!options.pointToDirection;

  //

  this.lastLocation = new Vector();
  this.amplitude = options.amplitude || new Vector(this.world.width / 2 - this.width,
      this.world.height / 2 - this.height);
  this.initialLocation = options.initialLocation ||
    new Vector(this.world.width / 2, this.world.height / 2);
  this.location.x = this.initialLocation.x;
  this.location.y = this.initialLocation.y;
};


/**
 * Updates the oscillator's properties.
 */
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

  this.location.x = this.initialLocation.x + Math.sin(this.aVelocity.x) * this.amplitude.x;
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

/**
 * Updates the corresponding DOM element's style property.
 * @function draw
 * @memberof Attractor
 */
Oscillator.prototype.draw = function() {
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
    colorMode: this.colorMode,
    borderRadius: this.borderRadius,
    borderWidth: this.borderWidth,
    borderStyle: this.borderStyle,
    borderColor0: this.borderColor[0],
    borderColor1: this.borderColor[1],
    borderColor2: this.borderColor[2],
    boxShadowOffsetX: this.boxShadowOffsetX,
    boxShadowOffsetY: this.boxShadowOffsetY,
    boxShadowBlur: this.boxShadowBlur,
    boxShadowSpread: this.boxShadowSpread,
    boxShadowColor0: this.boxShadowColor[0],
    boxShadowColor1: this.boxShadowColor[1],
    boxShadowColor2: this.boxShadowColor[2],
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
 * @memberof Attractor
 * @param {Object} props A map of object properties.
 * @returns {string} A string representing cssText.
 */
Oscillator.prototype.getCSSText = function(props) {
  return Item._stylePosition.replace(/<x>/g, props.x).replace(/<y>/g, props.y).replace(/<angle>/g, props.angle).replace(/<scale>/g, props.scale) + 'width: ' +
      props.width + 'px; height: ' + props.height + 'px; background-color: ' +
      props.colorMode + '(' + props.color0 + ', ' + props.color1 + (props.colorMode === 'hsl' ? '%' : '') + ', ' + props.color2 + (props.colorMode === 'hsl' ? '%' : '') +'); border: ' +
      props.borderWidth + 'px ' + props.borderStyle + ' ' + props.colorMode + '(' + props.borderColor0 + ', ' + props.borderColor1 + (props.colorMode === 'hsl' ? '%' : '') + ', ' + props.borderColor2 + (props.colorMode === 'hsl' ? '%' : '') + '); border-radius: ' +
      props.borderRadius + '%; box-shadow: ' + props.boxShadowOffsetX + 'px ' + props.boxShadowOffsetY + 'px ' + props.boxShadowBlur + 'px ' + props.boxShadowSpread + 'px ' + props.colorMode + '(' + props.boxShadowColor0 + ', ' + props.boxShadowColor1 + (props.colorMode === 'hsl' ? '%' : '') + ', ' + props.boxShadowColor2 + (props.colorMode === 'hsl' ? '%' : '') + '); opacity: ' + props.opacity + '; z-index: ' + props.zIndex + '; visibility: ' + props.visibility + ';';
};

module.exports = Oscillator;

},{"burner":16,"quietriot":21}],31:[function(require,module,exports){
var Item = require('burner').Item,
    Mover = require('./Mover'),
    Utils = require('burner').Utils,
    Vector = require('burner').Vector;

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
 * @param {number} [opt_options.width = 20] Width
 * @param {number} [opt_options.height = 20] Height
 * @param {Array} [opt_options.color = [200, 200, 200]] Color.
 * @param {number} [opt_options.borderWidth = this.width / 4] Border width.
 * @param {number} [opt_options.borderRadius = 100] The particle's border radius.
 * @param {number} [opt_options.boxShadowSpread = this.width / 4] Box-shadow spread.
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

  this.width = typeof options.width === 'undefined' ? 20 : options.width;
  this.height = typeof options.height === 'undefined' ? 20 : options.height;
  this.color = options.color || [200, 200, 200];
  this.borderWidth = typeof options.borderWidth === 'undefined' ? this.width / 4 : options.borderWidth;
  this.borderRadius = typeof options.borderRadius === 'undefined' ? 100 : options.borderRadius;
  this.boxShadowSpread = typeof options.boxShadowSpread === 'undefined' ? this.width / 4 : options.boxShadowSpread;
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
  this.initWidth = this.width;
  this.initHeight = this.height;
};

/**
 * Applies additional forces.
 */
Particle.prototype.afterStep = function() {

  if (this.fade) {
    this.opacity = Utils.map(this.life, 0, this.lifespan, 1, 0);
  }

  if (this.shrink) {
    this.width = Utils.map(this.life, 0, this.lifespan, this.initWidth, 0);
    this.height = Utils.map(this.life, 0, this.lifespan, this.initHeight, 0);
  }
};

/**
 * Updates the corresponding DOM element's style property.
 * @function draw
 * @memberof Particle
 */
Particle.prototype.draw = function() {
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
    colorMode: this.colorMode,
    borderRadius: this.borderRadius,
    borderWidth: this.borderWidth,
    borderStyle: this.borderStyle,
    borderColor0: this.borderColor[0],
    borderColor1: this.borderColor[1],
    borderColor2: this.borderColor[2],
    boxShadowOffsetX: this.boxShadowOffsetX,
    boxShadowOffsetY: this.boxShadowOffsetY,
    boxShadowBlur: this.boxShadowBlur,
    boxShadowSpread: this.boxShadowSpread,
    boxShadowColor0: this.boxShadowColor[0],
    boxShadowColor1: this.boxShadowColor[1],
    boxShadowColor2: this.boxShadowColor[2],
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
 * @memberof Particle
 * @param {Object} props A map of object properties.
 * @returns {string} A string representing cssText.
 */
Particle.prototype.getCSSText = function(props) {
  return Item._stylePosition.replace(/<x>/g, props.x).replace(/<y>/g, props.y).replace(/<angle>/g, props.angle).replace(/<scale>/g, props.scale) + 'width: ' +
      props.width + 'px; height: ' + props.height + 'px; background-color: ' +
      props.colorMode + '(' + props.color0 + ', ' + props.color1 + (props.colorMode === 'hsl' ? '%' : '') + ', ' + props.color2 + (props.colorMode === 'hsl' ? '%' : '') +'); border: ' +
      props.borderWidth + 'px ' + props.borderStyle + ' ' + props.colorMode + '(' + props.borderColor0 + ', ' + props.borderColor1 + (props.colorMode === 'hsl' ? '%' : '') + ', ' + props.borderColor2 + (props.colorMode === 'hsl' ? '%' : '') + '); border-radius: ' +
      props.borderRadius + '%; box-shadow: ' + props.boxShadowOffsetX + 'px ' + props.boxShadowOffsetY + 'px ' + props.boxShadowBlur + 'px ' + props.boxShadowSpread + 'px ' + props.colorMode + '(' + props.boxShadowColor0 + ', ' + props.boxShadowColor1 + (props.colorMode === 'hsl' ? '%' : '') + ', ' + props.boxShadowColor2 + (props.colorMode === 'hsl' ? '%' : '') + '); opacity: ' + props.opacity + '; z-index: ' + props.zIndex + '; visibility: ' + props.visibility + ';';
};

module.exports = Particle;


},{"./Mover":28,"burner":16}],32:[function(require,module,exports){
module.exports = {
  Funnel: {
    Base: require('./base'),
    Debris: require('./debris'),
    Spine: require('./spine'),
    Shell: require('./shell'),
    Runner: require('./runner')
  },
  Vortex: {
    Base: require('./base'),
    DebrisBit: require('./bitshadow/debrisbit'),
    Spine: require('./spine'),
    ShellBit: require('./bitshadow/shellbit'),
    RunnerBit: require('./bitshadow/runnerbit')
  }
};

},{"./base":22,"./bitshadow/debrisbit":23,"./bitshadow/runnerbit":24,"./bitshadow/shellbit":25,"./debris":26,"./runner":34,"./shell":35,"./spine":36}],33:[function(require,module,exports){
var Vector = require('burner').Vector;

/**
 * Creates a Mask around the tornado's world.
 * @constructor
 */
function Mask() {
  this.color = [20, 20, 20];
  this.isStatic = true;
  this.borderRadius = 0;
  this.borderWidth = 0;
  this.zIndex = 100;
}

/**
 * Configures an instance of Mask.
 * @param {Object} props A map of required properties.
 * @param {Object} props.location The mask location.
 * @param {number} props.width Width.
 * @param {number} props.height Height.
 * @memberOf Mask
 */
Mask.prototype.configure = function(props) {
  this.location = props.location;
  this.width = props.width;
  this.height = props.height;
};

module.exports = Mask;

},{"burner":16}],34:[function(require,module,exports){
var Burner = require('burner');
var Mover = require('./items/mover');
var Oscillator = require('./items/oscillator');
var Particle = require('./items/particle');
var Utils = require('burner').Utils;
var Vector = require('burner').Vector;
var SimplexNoise = require('quietriot');
var Easing = require('./easing');
var Mask = require('./mask');

/**
 * Creates a new Runner.
 * @param {Object} base A map of properties describing the base of the tornado.
 * @param {Object} debris A map of properties describing the debris at the base of the tornado.
 * @param {Object} spine A map of properties describing the tornado's spine.
 * @param {Object} shell A map of properties describing the tornado's shell (funnel).
 * @constructor
 */
function Runner(base, opt_debris, opt_spine, opt_shell) {
  if (!base) {
    throw new Error('Runner requires a \'base\' parameter.');
  }
  this.base = base;
  this.debris = opt_debris || null;
  this.spine = opt_spine || null;
  this.shell = opt_shell || null;
}

/**
 * Holds a Perlin noise value.
 * @type {number}
 * @memberof Runner
 */
Runner.noise = 0;

/**
 * Initializes an instance of Runner.
 * @param {Object} [opt_options=] A map of initial world properties.
 * @param {Object} [opt_options.el = document.body] World's DOM object.
 * @param {number} [opt_options.width = 800] World width in pixels.
 * @param {number} [opt_options.height = 600] World height in pixels.
 * @param {number} [opt_options.borderWidth = 1] World border widthin pixels.
 * @param {string} [opt_options.borderStyle = 'solid'] World border style.
 * @param {Object} [opt_options.borderColor = 0, 0, 0] World border color.
 * @memberof Runner
 */
Runner.prototype.init = function(opt_options) {

  var options = opt_options || {};

  Burner.System.Classes = {
    Mover: Mover,
    Oscillator: Oscillator,
    Particle: Particle
  };
  Burner.System.setup(this._setupCallback.bind(this, options));
  Burner.System.clock = 10000; // advance the clock so we start deeper in the noise space
  Burner.System.loop(this._getNoise.bind(this));
};

/**
 * Sets up the world and items.
 * @param {Object} options World options.
 * @memberof Runner
 * @private
 */
Runner.prototype._setupCallback = function(options) {

  var world = Burner.System.add('World', {
    el: options.el || document.body,
    color: options.color || [40, 40, 40],
    width: options.width || 800,
    height: options.height || 600,
    borderWidth: options.borderWidth || 1,
    borderStyle: options.borderStyle || 'solid',
    borderColor: options.borderColor || [0, 0, 0],
    gravity: new Vector(),
    c: 0
  });

  // BASE
  this.base.configure(world);
  var myBase = Burner.System.add('Oscillator', this.base);

  // DEBRIS
  if (this.debris) {
    this.debris.configure({
      parent: myBase
    });
    Burner.System.add('Mover', this.debris);
  }

  // SPINE
  if (this.spine) {
    for (var i = 0, max = Math.floor(world.height / this.spine.density); i < max; i++) {

      var ease = Easing[this.spine.easing].call(null, i, 0, 1, max - 1);

      // joints
      var joint = Burner.System.add('Mover', {
        parent: myBase,
        offsetDistance: ease * world.height,
        offsetAngle: 270,
        opacity: this.spine.opacity,
        afterStep: this._jointAfterStep
      });
      joint.index = i;
      joint.offsetFromAxis = this.spine.offsetFromAxis;

      // use Perlin noise to generate the parent node's offset from the funnel's y-axis
      // use easing so the effect is amplified
      joint.offsetFromCenter = Easing.easeInSine(i, 0, 1, max - 1) *
          SimplexNoise.noise(i * 0.1, 0) * 20;

      // pillows
      if (this.shell) {
        var easeShellShape = Easing[this.shell.easing].call(null, i, 0, 1, max - 1);

        var colorNoise = Math.floor(Utils.map(SimplexNoise.noise(i * 0.05, 0),
            -1, 1, this.shell.colorMin, this.shell.colorMax));

        Burner.System.add('Oscillator', {
          width: this.shell.width,
          height: this.shell.height,
          parent: joint,
          opacity: this.shell.opacity,
          color: [colorNoise, colorNoise, colorNoise],
          boxShadowBlur: (easeShellShape * this.shell.blur) + this.shell.minFunnelWidth,
          boxShadowSpread: (easeShellShape * this.shell.spread) + this.shell.minFunnelWidth,
          boxShadowColor: [colorNoise, colorNoise, colorNoise],
          perlin: false,
          amplitude: new Vector((2 - easeShellShape) * 1, 0),
          acceleration: new Vector(1 / (i + 1), 0)
        });
      }
    }
  }

  // MASKS
  var maskWidth = (document.body.scrollWidth - world.width) / 2,
    maskHeight = (document.body.scrollHeight - world.height) / 2;

  var maskTop = new Mask();
  maskTop.configure({
    location: new Vector(world.width/2, -1 - maskHeight / 2),
    world: world,
    width: world.width + 10,
    height: maskHeight
  });
  Burner.System.add('Mover', maskTop);

  var maskBottom = new Mask();
  maskBottom.configure({
    location: new Burner.Vector(world.width/2, world.height + 1 + maskHeight / 2),
    world: world,
    width: world.width + 10,
    height: maskHeight
  });
  Burner.System.add('Mover', maskBottom);

  var maskLeft = new Mask();
  maskLeft.configure({
    location: new Burner.Vector(-1 - maskWidth / 2, world.height / 2),
    world: world,
    width: maskWidth,
    height: document.body.scrollHeight
  });
  Burner.System.add('Mover', maskLeft);

  var maskRight = new Mask();
  maskRight.configure({
    location: new Burner.Vector(world.width + 1 + maskWidth / 2, world.height / 2),
    world: world,
    width: maskWidth,
    height: document.body.scrollHeight
  });
  Burner.System.add('Mover', maskRight);
};

/**
 * Called at the end of the joints' step function.
 * @memberof Runner
 * @private
 */
Runner.prototype._jointAfterStep = function() {
  if (this.offsetFromAxis) {
    var offset = this.index * this.offsetFromCenter * Runner.noise;
    this.location.x = this.location.x + (offset);
  }
};

/**
 * Called at the end of each animation frame.
 * @memberof Runner
 * @private
 */
Runner.prototype._getNoise = function() {
  Runner.noise = SimplexNoise.noise(Burner.System.clock * 0.0001, 0);
};

module.exports = Runner;

},{"./easing":27,"./items/mover":29,"./items/oscillator":30,"./items/particle":31,"./mask":33,"burner":16,"quietriot":21}],35:[function(require,module,exports){
/**
 * Creates a new Shell.
 *
 * @param {Object} [opt_options=] A map of initial properties.
 * @param {number} [opt_options.itemWidth = 0] Item width.
 * @param {number} [opt_options.itemHeight = 0] Item height.
 * @param {number} [opt_options.minFunnelWidth = 5] Minium width of the shell base.
 * @param {number} [opt_options.opacity = 0] shell opacity.
 * @param {number} [opt_options.blur = 350] shell blur. Recommended values bw 300 - 400.
 * @param {number} [opt_options.spread = 250] shell spread. Recommended values bw 200 - 300.
 * @param {string} [opt_options.easing = 'easeInExpo'] An easing function to determine shell shape along the spine. See Easing docs for possible values.
 * @param {number} [opt_options.colorMin = 50] Minimum color. Valid values bw 0 - 255.
 * @param {number} [opt_options.colorMax = 255] Maximum color. Valid values bw 0 - 255.
 * @constructor
 */
function Shell(opt_options) {

  var options = opt_options || {};

  this.width = options.itemWidth || 0;
  this.height = options.itemHeight || 0;
  this.minFunnelWidth = typeof options.minFunnelWidth !== 'undefined' ? options.minFunnelWidth : 5;
  this.opacity = typeof options.opacity !== 'undefined' ? options.opacity : 0.75;
  this.blur = typeof options.blur !== 'undefined' ? options.blur : 350;
  this.spread = typeof options.spread !== 'undefined' ? options.spread : 250;
  this.easing = options.easing || 'easeInExpo';
  this.colorMin = typeof options.colorMin !== 'undefined' ? options.colorMin : 50;
  this.colorMax = typeof options.colorMax !== 'undefined' ? options.colorMax : 255;
}

module.exports = Shell;

},{}],36:[function(require,module,exports){
/**
 * Creates a new Spine.
 *
 * @param {Object} [opt_options=] A map of initial joint properties.
 * @param {number} [opt_options.density = 25] Determines number of joints in the spine. Lower values = more joints.
 * @param {number} [opt_options.opacity = 0] Opacity.
 * @param {string} [opt_options.easing = 'easeInCirc'] An easing function to determine joint distribution along the spine. See Easing docs for possible values.
 * @param {boolean} [opt_options.offsetFromAxis = true] Set to false to prevent spine curvature.
 * @constructor
 */
function Spine(opt_options) {

  var options = opt_options || {};

  this.density = options.density || 25;
  this.opacity = options.opacity || 0;
  this.easing = options.easing || 'easeInCirc';
  this.offsetFromAxis = typeof options.offsetFromAxis !== 'undefined' ? options.offsetFromAxis : true;
}

module.exports = Spine;

},{}]},{},[32])(32)
});