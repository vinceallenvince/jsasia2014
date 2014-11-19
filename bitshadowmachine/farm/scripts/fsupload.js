/**
 * Creates a new FileSystemAPI Uploader.
 *
 * FSUpload saves a file to the browser's local file system and executes a passed
 * callback with properties that include the saved file's url.
 *
 * @param {Object} options A map of initial properties.
 * @param {Function} [opt_callback] A function to call on successful file upload. The callback
 *    is passed a map of properties:
 *    {
 *      fileURL: the url to locate the uploaded file in the browser's file system,
 *      fileInput: a reference to the file input,
 *      index: an index representing the position of this file in the list of submitted files,
 *      totalFiles: the total number of submitted files
 *    }
 * @constructor
 */
var FSUpload = function(fileInput, opt_callback) {

  if (!fileInput) {
    throw new Error('FSUpload requires a reference to the file input passed via options.fileInput');
  }

  this.fileInput = fileInput;
  this.callback = opt_callback || function() {};
}

/**
 * Adds an event listener to file input to request a new file system
 * when a file or files are selected.
 */
FSUpload.prototype.init = function() {

  var me = this;

  this.fileInput.addEventListener('change', function(e) {
    (window.requestFileSystem || window.webkitRequestFileSystem).call(window, window.TEMPORARY,
        5*1024*1024, me.onInitFs.bind(me, this.files), me.onError);
  }, false);
};

/**
 * Iterates over items and saves file system object returned
 * from file system request.
 *
 * @param {Object} files A list of files retuned from file input.
 * @param {Object} fs The file system object.
 */
FSUpload.prototype.onInitFs = function(files, fs) {
  
  var i, max, file;

  for (i = 0, max = files.length; i < max; i++) {
    file = files[i];
    this.writeFile(fs.root, file, i, files.length);
  }
};

/**
 * Writes a passed file to the file system. On successful write,
 * calls displayImage to visually confirm write.
 *
 * @param {String} parentDirectory The parent folder to contain the file.
 * @param {Object} file The file to write.
 * @param {number} i An index representing the position of this file in the list of files submitted.
 * @param {number} totalFiles The total number of fiesl submitted.
 */
FSUpload.prototype.writeFile = function(parentDirectory, file, i, totalFiles) {

  var me = this;

  parentDirectory.getFile(file.name, {create: true, exclusive: false},
    function(fileEntry) {
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onwrite = function(e) {
          me.callback.call(me, {
            fileURL: fileEntry.toURL(),
            index: i,
            totalFiles: totalFiles
          });
        };
        fileWriter.onerror = function(e) {
          me.onError();
        };
        fileWriter.write(file);
      }, me.onError);
    },
    me.onError
  );
};

/**
 * Called on any file system error.
 */
FSUpload.prototype.onError = function(e) {

  var msg = '';

  switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
          msg = 'QUOTA_EXCEEDED_ERR';
          break;
      case FileError.NOT_FOUND_ERR:
          msg = 'NOT_FOUND_ERR';
          break;
      case FileError.SECURITY_ERR:
          msg = 'SECURITY_ERR';
          break;
      case FileError.INVALID_MODIFICATION_ERR:
          msg = 'INVALID_MODIFICATION_ERR';
          break;
      case FileError.INVALID_STATE_ERR:
          msg = 'INVALID_STATE_ERR';
          break;
      default:
          msg = 'Unknown Error';
          break;
  }

  console.log('Error: ' + msg);
};
