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
  this.add('Box');
}, worldA, Modernizr);