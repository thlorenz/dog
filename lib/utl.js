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

module.exports = {
    ensurePathExists: ensurePathExists
  , regexEscape: regexEscape
  , exists: exists
};
