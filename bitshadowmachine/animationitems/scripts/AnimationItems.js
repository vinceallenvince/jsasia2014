/**
 * Tell BitShadowMachine where to find classes.
 */
BitShadowMachine.Classes = {
  Box: Box
};

var worldA = new BitShadowMachine.World(document.getElementById('worldA'), {
  width: 700,
  height: 450,
  resolution: 4,
  colorMode: 'rgba',
  backgroundColor: [0, 0, 0],
  noMenu: true
});

/**
 * Create a new BitShadowMachine system.
 */
BitShadowMachine.System.init(function() {
  var getRandomNumber = BitShadowMachine.Utils.getRandomNumber;
  for (var i = 0; i < 1000; i++) {
    var scale = getRandomNumber(0.25, 2, true);
    this.add('Box', {
      location: new BitShadowMachine.Vector(getRandomNumber(0, worldA.width),
          getRandomNumber(0, worldA.height / 2)),
      opacity: BitShadowMachine.Utils.map(scale, 1, 2, 1, 0.25),
      scale: scale,
      mass: scale
    });
  }
}, worldA, Modernizr);