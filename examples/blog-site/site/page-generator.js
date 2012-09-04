function wrap (html) {
return [
    '<!DOCTYPE HTML>'
  , '<html>'
  , '<head>'
  , '   <meta http-equiv="content-type" content="text/html; charset=utf-8"/>'
  , '   <title>Dog Blog</title>'
  , ' <link rel="stylesheet" href="assets/styles/blog.css" type="text/css" media="screen" charset="utf-8" />'
  , '</head>'
  , '<body>'
  , html
  , '</body>'
  , '</html'
  ].join('\n');
}

module.exports = {
  wrap : wrap
};

