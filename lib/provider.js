var path         =  require('path')
  , fs           =  require('fs')
  , log          =  require('npmlog')
  , render       =  require('./renderer').render
  , blogdir      =  path.join(__dirname, '..', 'blog')
  , blogMetafile =  path.join(blogdir, 'blog.json')
  ;

function getPostMetafile (name) {
  return path.join(blogdir, name, 'post.json');
}

function getPostDir (name) {
  return path.join(blogdir, name);
}

function getMetadata(fullPath, cb) {
  fs.readFile(fullPath, 'utf8', function (err, data) {
    if (err) { cb(err); return; }
    try {
      cb(null, JSON.parse(data));
    } catch (err) {
      cb(err);
    }
  });
}

function getBlogMetadata (cb) {
  getMetadata(blogMetafile, cb);
}

function getAllPosts(cb) {
  getBlogMetadata(function (err, res) {
    if (err) { cb(err); return; }
    cb(null, res.posts);
  });
}

function getAllTags(cb) {
  var meta = getBlogMetadata(function (err, res) {
    if (err) { cb(err); return; }
    cb(null, res.tags);
  });
}

function getPostMetadata(name, cb) {
  getMetadata(getPostMetafile(name), function (err, res) {
    if (err) { cb(err); return; }
    cb(null, res);
  });
}

function getPostHtml (name, cb) {
  render(getPostDir(name), function (err, res) {
    if (err) { cb(err); return; }
    cb(null, res);
  });
}

function getAssetsDir () {
  return path.join(blogdir, 'assets');
}

function getImagesDir () {
  return path.join(blogdir, 'assets', 'images');
}

function getStylesDir () {
  return path.join(blogdir, 'assets', 'styles');
}

function getStylesFiles () {
  var styles = getStylesDir();
  return [
      path.join(styles, 'code.css')
    , path.join(styles, 'code-fixes.css')
    , path.join(styles, 'blog.css')
  ];
}

function concatenateStyles (cb) {
  var files = getStylesFiles()
    , tasks = files.length
    , abort = false
    , contents = []
    ;
  files.forEach(function (file) {
    fs.readFile(file, 'utf8', function (err, content) {
      if (err) { cb(err); abort = true; }
      if (abort) return;
      var comment = '/* +++ ' + path.basename(file) + ' +++ */';
      contents.push(comment);
      contents.push(content);
      if (--tasks === 0) cb(null, contents.join('\n\n'));
    });
    
  });
}


function printSummary(opts) {
  opts = opts || {};
  log.info('provider', 'Assets at: ', getAssetsDir());
  log.info('provider', 'Images at: ', getImagesDir());
  log.info('provider', 'Styles at: ', getStylesDir());
  log.info('provider', 'Styles Files:', getStylesFiles());
  getAllPosts(function (err, posts) {
    log.info('provider', 'All posts: ', posts);

    posts.forEach(function (post) {
      getPostMetadata(post, function (err, metadata) {
        log.info('provider', 'Metadata for:', post);
        log.info('provider', metadata);
      });
      if (opts.includeHtml)
        getPostHtml(post, function (err, html) {
          if (err) log.error('provider', err);
          else {
            log.info('provider', 'Html for:', post);
            log.info('provider', html);
          }
        });
    }); 
  });

  getAllTags(function (err, tags) {
    log.info('provider', 'All tags:', tags);
  });

  if (opts.includeCss) {
    concatenateStyles(function (err, css) {
      if (err) log.error('provider', err);
      else log.info('provider', 'css: ', css);
    });
  }
}

module.exports = {
    getAllPosts       :  getAllPosts
  , getAllTags        :  getAllTags
  , getPostMetadata   :  getPostMetadata
  , getPostHtml       :  getPostHtml
  , getAssetsDir      :  getAssetsDir
  , getImagesDir      :  getImagesDir
  , getStylesDir      :  getStylesDir
  , getStylesFiles    :  getStylesFiles
  , concatenateStyles :  concatenateStyles
  , printSummary      :  printSummary
};

if (module.parent) return;

printSummary({ includeHtml: false, includeCss: false });

