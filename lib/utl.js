var fs = require('fs')
  , path = require('path')
  , exists = fs.exists || path.exists
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

function merge(def, custom) {
  var tgt = {};
  // Copy defaults
  Object.keys(def).forEach(function (key) {
    tgt[key] = def[key];
  });

  // Merge all custom props, possibly overwriting defaults
  Object.keys(custom).forEach(function (key) {
    tgt[key] = custom[key];
  });

  return tgt;
}

// Indirection to current time to allow stubbing during testing 
function now() {
  return new Date();
}

function innermostDir(dir) {
  var dirs = dir.split(path.sep)
    , len;
  return (len = dirs.length) > 0 ? dirs[len - 1] : '';
}

module.exports = {
    ensurePathExists :  ensurePathExists
  , regexEscape      :  regexEscape
  , exists           :  exists
  , merge            :  merge
  , now              :  now
  , innermostDir     :  innermostDir
};
