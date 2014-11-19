function Box(opt_options) {
  var options = opt_options || {};
  options.name = 'Box';
  BitShadowMachine.Item.call(this, options);
}
BitShadowMachine.Utils.extend(Box, BitShadowMachine.Item);

// An init() method is required.
Box.prototype.init = function(options) {
  this.color = options.color || [100, 100, 100];
  this.location = options.location || new BitShadowMachine.Vector(this.world.width / 2, this.world.height / 2);
  this.acceleration = options.acceleration || new BitShadowMachine.Vector(-0.6, 0);
  this.velocity = options.velocity || new BitShadowMachine.Vector();
  this.mass = options.mass || 10;
  this.maxSpeed = typeof options.maxSpeed === 'undefined' ? 10 : options.maxSpeed;
  this.minSpeed = options.minSpeed || 0;
  this.bounciness = options.bounciness || 1;
  this._force = new BitShadowMachine.Vector();
};

Box.prototype.step = function() {
  if (this.beforeStep) {
    this.beforeStep.call(this);
  }
  //this.applyForce(this.world.gravity);
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxSpeed, this.minSpeed);
  this.location.add(this.velocity);
  this._wrapWorldEdges();
  this.acceleration.mult(0);
};

Box.prototype.applyForce = function(force) {
  if (force) {
    this._force.x = force.x;
    this._force.y = force.y;
    this._force.div(this.mass);
    this.acceleration.add(this._force);
    return this.acceleration;
  }
};

Box.prototype._checkWorldEdges = function() {
  if (this.location.y > this.world.height) { // bottom
    this.velocity.mult(-this.bounciness);
    this.location.y = this.world.height;
    return;
  }
};

Box.prototype._wrapWorldEdges = function() {
  if (this.location.y > this.world.height) { // bottom
    this.location.y = 0;
    return;
  }

  if (this.location.x < 0) { // left
    this.location.x = this.world.width;
    return;
  }
};