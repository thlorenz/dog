var path         =  require('path')
  , fs           =  require('fs')
  , log          =  require('npmlog')
  , utl          =  require('./utl')
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
      var metadata = JSON.parse(data);
      metadata.created = utl.stringToDate(metadata.created);
      metadata.updated = utl.stringToDate(metadata.updated);

      cb(null, metadata);
    } catch (err) {
      cb(err);
    }
  });
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

function getBlogMetadata (cb) {
  getMetadata(blogMetafile, cb);
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
      if (abort) return;
      if (err) { cb(err); abort = true; return; }
      var comment = '/* +++ ' + path.basename(file) + ' +++ */';
      contents.push(comment);
      contents.push(content);
      if (--tasks === 0) cb(null, contents.join('\n\n'));
    });
    
  });
}

function provide (filter, provided) {

  function attachMetadata(posts, cb) {
    var tasks = posts.length
      , abort = false
      ;

    posts.forEach(function (post) {
      getPostMetadata(post.name, function (err, metadata) {
        if (abort) return;
        if (err) { cb(err); abort = true; return; }
        post.metadata = metadata;

        if (--tasks === 0) cb(null);
      });
    });
  }

  function attachRenderedHtml(posts, cb) {
    var tasks = posts.length
      , abort = false
      ;

    posts.forEach(function (post) {
      getPostHtml(post.name, function (err, html) {
        if (abort) return;
        if (err) { cb(err); abort = true; return; }
        post.html = html; 

        if (--tasks === 0) cb(null);
      });
    });
  }

  getAllPosts(function (err, postnames) {
    if (err) { provided(err); return; }
    var posts = postnames.map(function (name) { return { name: name }; } );

    attachMetadata(posts, function (err) {
      if (err) { provided(err); return; }
      if (filter) posts = posts.filter(filter);

      attachRenderedHtml(posts, function (err) {
        if (err) { provided(err); return; }
        provided(null, posts);
      });
    });
  });

}

function provideAll(cb) {
  provide(null, cb);
}

function provideUpdatedSince (when, cb) {
  provide(
      function (post) { 
        return post.metadata.updated >= when; 
      }
    , cb
  );
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
    getAllPosts         :  getAllPosts
  , getAllTags          :  getAllTags
  , getPostMetadata     :  getPostMetadata
  , getPostHtml         :  getPostHtml
  , getAssetsDir        :  getAssetsDir
  , getImagesDir        :  getImagesDir
  , getStylesDir        :  getStylesDir
  , getStylesFiles      :  getStylesFiles
  , concatenateStyles   :  concatenateStyles
  , provideAll          :  provideAll
  , provideUpdatedSince :  provideUpdatedSince
  , printSummary        :  printSummary
};

if (module.parent) return;

printSummary({ includeHtml: false, includeCss: false });
provideUpdatedSince(new Date(2012, 8, 1), function (err, posts) {
  if(err) log.error('provider', err);
  else log.info('provider', posts);
});

