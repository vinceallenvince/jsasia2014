/*global document, exports */
/**
 * Creates a new PixelPress.
 *
 * @constructor
 */
function PixelPress(opt_options) {

  var options = opt_options, img;

  this.context = options.context || null;
  this.resolution = parseInt(options.resolution, 10) || 8;
  this.origin = options.origin || 'center';
  this.src = options.src || null;
  this.debug = !!options.debug;
  this.frames = null;

}

PixelPress.prototype.name = 'Press';

PixelPress.prototype.init = function(fileProps) {

  var me = this,
      img = new Image();

  this.src = fileProps.src;
  this.originX = fileProps.originX;
  this.originY = fileProps.originY;
  this.resolution = parseInt(fileProps.resolution, 10);
  this.index = fileProps.index;
  this.totalFiles = fileProps.totalFiles;
  this.callback = fileProps.callback;
  this.frames = [];

  img.src = this.src;
  img.onload = function() {
    me.getImageData.call(me, img, me.resolution);
  };
};

PixelPress.prototype.getImageData = function(img, resolution) {

  // clear canvas first
  this.context.clearRect(0, 0, 1000, 1000);

  // draw image in canvas
  this.context.drawImage(img, 0, 0);

  var imgData = this.context.getImageData(0, 0, img.width, img.height);
  if (imgData) {
    this.log('Getting data for ' + imgData.width + ' x ' + imgData.height + ' image. ' +
        imgData.width * imgData.height + ' total pixels.', this.debug);
    this.processImageData(imgData, resolution);
  }
};

PixelPress.prototype.processImageData = function(imgData, resolution) {

  var x, y, red, green, blue, alpha, str,
      originOffsetX, originOffsetY, items = [];

  switch (this.originX) {
    case 'left':
      originOffsetX = 0;
      break;
    case 'center':
      originOffsetX = -imgData.width / 2;
      break;
    case 'right':
      originOffsetX = -imgData.width;
      break;
  }

  switch (this.originY) {
    case 'top':
      originOffsetY = 0;
      break;
    case 'center':
      originOffsetY = -imgData.height / 2;
      break;
    case 'bottom':
      originOffsetY = -imgData.height;
      break;
  }

  // dividing by four b/c image data is separated into four components. (red, green, blue, alpha)
  this.log('Processing image ' + (this.frames.length + 1) + ' of ' + this.totalFiles);
  this.log('Processing ' + (imgData.data.length / 4) + ' pixels.');
  this.log('Breaking into chunks of ' + resolution + ' X ' + resolution +
      ' pixels in a ' + (imgData.width / resolution) + ' X ' + (imgData.height / resolution) + ' grid of ' +
      ((imgData.width / resolution) * (imgData.height / resolution)) + ' blocks.', this.debug);

  for (y = 0; y < imgData.height; y += resolution) {
    for (x = 0; x < imgData.width; x += resolution) {

      red = imgData.data[((y * (imgData.width * 4)) + (x * 4)) + 0];
      green = imgData.data[((y * (imgData.width * 4)) + (x * 4)) + 1];
      blue = imgData.data[((y * (imgData.width * 4)) + (x * 4)) + 2];
      alpha = imgData.data[((y * (imgData.width * 4)) + (x * 4)) + 3];

      // do not add transparent blocks
      if (alpha !== 0 || (x + originOffsetX === 0 && y + originOffsetY === 0)) { // always add the first pixel block
        items.push({
          x: Math.floor((x + originOffsetX) / resolution * 2),
          y: Math.floor((y + originOffsetY) / resolution * 2),
          color: [red, green, blue],
          opacity: parseFloat(PixelPress.map(alpha, 0, 255, 0, 1).toPrecision(2)),
          scale: 1
        });
      }
    }
  }

  this.frames.push({
    items: items
  });

  if (this.frames.length === this.totalFiles) {
    if (this.callback) {
      this.callback.call(this, this.frames, imgData.width, imgData.height);
    }
  }

};

PixelPress.prototype.log = function(msg) {
  if (this.debug && console) {
    console.log(msg);
  }
};

/**
 * Re-maps a number from one range to another.
 *
 * @function map
 * @memberof System
 * @param {number} value The value to be converted.
 * @param {number} min1 Lower bound of the value's current range.
 * @param {number} max1 Upper bound of the value's current range.
 * @param {number} min2 Lower bound of the value's target range.
 * @param {number} max2 Upper bound of the value's target range.
 * @returns {number} A number.
 */
PixelPress.map = function(value, min1, max1, min2, max2) { // returns a new value relative to a new range
  var unitratio = (value - min1) / (max1 - min1);
  return (unitratio * (max2 - min2)) + min2;
};
