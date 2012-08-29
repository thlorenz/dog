var fs = require('fs');
  
function ensurePathExists(entry, cb) {
  fs.exists(entry, function (exists) {
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
};
