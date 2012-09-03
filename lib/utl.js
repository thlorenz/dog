var fs = require('fs')
  , path = require('path')
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
    , len;
  return (len = dirs.length) > 0 ? dirs[len - 1] : '';
}

function split(string, separator) {
  separator = separator || ' ';
  return string
    .split(separator)
    .map(function (s) { return s.trim(); });
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
};
