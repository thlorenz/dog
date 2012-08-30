var fs   =  require('fs')
  , log = require('npmlog')
  , path =  require('path')
  , exec =  require('child_process').exec
  ;

function preview (blogdir, rendered) {

  var  html = [
          '<!DOCTYPE HTML>'
        , '<html>'
        , '<head>'
        , '   <meta http-equiv="content-type" content="text/html; charset=utf-8"/>'
        , '   <title>Page of Self</title>'
        , ' <link rel="stylesheet" href="blog/assets/styles/code.css" type="text/css" media="screen" charset="utf-8" />'
        , ' <link rel="stylesheet" href="blog/assets/styles/code-fixes.css" type="text/css" media="screen" charset="utf-8" />'
        , ' <link rel="stylesheet" href="blog/assets/styles/blog.css" type="text/css" media="screen" charset="utf-8" />'
        , ' <link rel="stylesheet" href="blog/assets/styles/preview.css" type="text/css" media="screen" charset="utf-8" />'
        , '</head>'
        , '<body>'
        , rendered
        , '</body>'
        , '</html'
        ].join('\n')
    , htmlFile = path.join(blogdir, '..', '..', 'blog.html')
    ;


  fs.writeFileSync(htmlFile, html, 'utf-8');

  exec('open ' + htmlFile, function () {
    setTimeout(
      function () {
        log.info('preview', 'Cleaned preview file');
        //fs.unlinkSync(htmlFile);
      } 
    , 2000);

  });
  
}

module.exports = preview;
  

