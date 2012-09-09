var fs = require('fs')
  , path = require('path')
  , util = require('util')
  , exists = fs.exists || path.exists
  , existsSync = fs.existsSync || path.existsSync
  ;
  
function ensurePathExists(entry, cb) {
  exists(entry, function (exists) {
    if (!exists) cb(new Error('Path ' + entry + ' doesn\'t exist'));
    else cb(null);
  });
}

function regexEscape(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function merge(def, custom, acceptUndefined) {
  var tgt = {};
  // Copy defaults
  Object.keys(def).forEach(function (key) {
    tgt[key] = def[key];
  });

  // Merge all custom props, possibly overwriting defaults
  Object.keys(custom).forEach(function (key) {
    if (acceptUndefined || custom[key])
      tgt[key] = custom[key];
  });


  return tgt;
}

// Indirection to current time to allow stubbing during testing 
function now() {
  return new Date();
}

function stringToDate(dateString) {
  return dateString ? new Date(dateString) : new Date();
}

function innermostDir(dir) {
  // node 0.6 has no path.sep
  path.sep = path.sep || /[\/\\]/;
  var dirs = dir.split(path.sep)
    , len = dirs.length
    ;

  // Empty string
  if (len === 0) return '';

  var lastdir = dirs[len - 1].trim();

  if (lastdir.length > 0) return lastdir;
  
  // Last dir empty e.g., when given 'foo/'?, then try second to last 
  return len > 1 ? dirs[len - 2].trim() : '';
}

function split(string, separator) {
  separator = separator || ' ';
  return string
    .split(separator)
    .map(function (s) { return s.trim(); });
}

function copy(srcFile, tgtFile, cb) {

  ensurePathExists(srcFile, function (err) {
    if (err) { cb(err); return; }

    var readStream = fs.createReadStream(srcFile)
      , writeStream = fs.createWriteStream(tgtFile); 

    writeStream
      .on('close', cb)
      .on('error', cb); 

    readStream
      .on('error', cb);

    readStream.pipe(writeStream);
  });
}

function copyFiles(srcFiles, tgtdir, cb) {
  var tasks = srcFiles.length
    , abort = false;

  if (tasks === 0) { cb(); return; }

  ensurePathExists(tgtdir, function (err) {
    if (err) { cb(err); return; }
    
    srcFiles.forEach(function (srcFile) {
      if (abort) return;

      var tgtFile = path.join(tgtdir, path.basename(srcFile));

      copy(srcFile, tgtFile, function (err) {
        if (err) { abort = true; cb(err); return; }
        if (--tasks === 0) cb();
      });
    });
  });
}

function copyFilesInside(srcdir, tgtdir, cb) {
  fs.readdir(srcdir, function (err, files) {
    if (err) { cb(err); return; }
    var fullPaths = files.map(function (file) {
      return path.join(srcdir, file);
    });

    copyFiles(fullPaths, tgtdir, cb);
  });
}

function findMatches(arr, str) {
  if (!str || str.length === 0) throw new Error('Cannot find matches for empty or undefined string');

  return arr
    .map(function (s) { 
      return s.trim(); 
    })
    .filter(function (item) {
      return item.indexOf(str) === 0;
    });
}

module.exports = {
    ensurePathExists :  ensurePathExists
  , regexEscape      :  regexEscape
  , exists           :  exists
  , existsSync       :  existsSync
  , merge            :  merge
  , now              :  now
  , stringToDate     :  stringToDate
  , innermostDir     :  innermostDir
  , split            :  split
  , copy             :  copy
  , copyFiles        :  copyFiles
  , copyFilesInside  :  copyFilesInside
  , findMatches      :  findMatches
};
