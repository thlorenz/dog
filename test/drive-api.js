var blog = require('..')
  , path = require('path')
  , blogunoDir = path.join(__dirname, 'fixtures', 'bloguno')
  ;

blog.render(blogunoDir, function (err, html) {
  if (err) { console.error(err); return; }
  else console.dir(html);
});


