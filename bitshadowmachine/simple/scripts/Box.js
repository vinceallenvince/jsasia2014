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
};