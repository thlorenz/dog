var path         =  require('path')
  , fs           =  require('fs')
  , log          =  require('npmlog')
  , utl          =  require('./utl')
  , render       =  require('./renderer').render
  , blogdir
  , blogMetafile
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

function provideFrom(dir) {
  blogdir      =  dir;
  blogMetafile =  path.join(blogdir, 'blog.json');
  return module.exports;
}

function ensureInitialized() {
  if (!blogdir) {
    log.error('provider', 'Please tell the provider where your blog lives via: "dog.provider.provideFrom(fullPath)"');
    throw new Error('Provider not properly initialized');
  }
}

function getAllPosts(cb) {
  ensureInitialized();
  getBlogMetadata(function (err, res) {
    if (err) { cb(err); return; }
    cb(null, res.posts);
  });
}

function getAllTags(cb) {
  ensureInitialized();
  var meta = getBlogMetadata(function (err, res) {
    if (err) { cb(err); return; }
    cb(null, res.tags);
  });
}

function getBlogMetadata (cb) {
  getMetadata(blogMetafile, cb);
}

function getPostMetadata(name, cb) {
  ensureInitialized();
  getMetadata(getPostMetafile(name), function (err, res) {
    if (err) { cb(err); return; }
    cb(null, res);
  });
}

function getPostHtml (name, cb) {
  ensureInitialized();
  render(getPostDir(name), function (err, res) {
    if (err) { cb(err); return; }
    cb(null, res);
  });
}

function getAssetsDir () {
  ensureInitialized();
  return path.join(blogdir, 'assets');
}

function getImagesDir () {
  ensureInitialized();
  return path.join(blogdir, 'assets', 'images');
}

function copyImages(tgt, cb) {
  ensureInitialized();
  utl.copyFilesInside(getImagesDir(), tgt, cb);
}

function getStylesDir () {
  ensureInitialized();
  return path.join(blogdir, 'assets', 'styles');
}

function getStylesFiles (cb) {
  ensureInitialized();
  var stylesdir = getStylesDir();

  getBlogMetadata(function (err, metadata) {
    if (err) { cb(err); return; }
    var stylesFiles = metadata.styles
      .map(function (style) {
        return path.join(stylesdir, style + '.css');
      });

    cb(null, stylesFiles);
  });
}


function concatenateStyles (concatenated) {
  ensureInitialized();
  
  // Gather contents first (could happen out of order depending on file size)
  // Then concatenate it into one string in the order that the styles where given
  
  function gatherStylesContent (files, cb) {
    var tasks = files.length
      , abort = false
      , contentHash = {}
      ;

    files.forEach(function (file) {
      fs.readFile(file, 'utf8', function (err, content) {
        if (abort) return;
        if (err) { concatenated(err); abort = true; return; }
        contentHash[file] = content;
        if (--tasks === 0) cb(files, contentHash);
      });
    });
  }

  function concatenate (files, contentHash) {
    var contents = [];

    files.forEach(function (file) {
      var comment = '/* +++ ' + path.basename(file) + ' +++ */';
      contents.push(comment);
      contents.push(contentHash[file]);
    });  

    concatenated(null, contents.join('\n\n'));
  }

  getStylesFiles(function (err, files) {
    if (err) { concatenated(err); return; }
    gatherStylesContent (files, concatenate);
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
  ensureInitialized();
  provide(null, cb);
}

function provideUpdatedSince (when, cb) {
  ensureInitialized();
  provide(
      function (post) { 
        return post.metadata.updated >= when; 
      }
    , cb
  );
}


function printSummary(opts) {
  ensureInitialized();

  opts = opts || {};
  log.info('provider', 'Assets at: ', getAssetsDir());
  log.info('provider', 'Images at: ', getImagesDir());
  log.info('provider', 'Styles at: ', getStylesDir());
  getAllPosts(function (err, posts) {
    if (err) { log.error('provider', err); return; }
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

  getStylesFiles(function (err, files) {
    if (err) { log.error('provider', err); return; } 
    log.info('provider', 'Styles Files:', files);
  });

  if (opts.includeCss) {
    concatenateStyles(function (err, css) {
      if (err) log.error('provider', err);
      else log.info('provider', 'css: ', css);
    });
  }
}

module.exports = {
    provideFrom         :  provideFrom
  , getAllPosts         :  getAllPosts
  , getAllTags          :  getAllTags
  , getPostMetadata     :  getPostMetadata
  , getPostHtml         :  getPostHtml
  , getAssetsDir        :  getAssetsDir
  , getImagesDir        :  getImagesDir
  , copyImages          :  copyImages
  , getStylesDir        :  getStylesDir
  , getStylesFiles      :  getStylesFiles
  , concatenateStyles   :  concatenateStyles
  , provideAll          :  provideAll
  , provideUpdatedSince :  provideUpdatedSince
  , printSummary        :  printSummary
};

if (module.parent) return;

// printSummary({ includeHtml: false, includeCss: true });

/*
provideUpdatedSince(new Date(2012, 8, 1), function (err, posts) {
  if(err) log.error('provider', err);
  else log.info('provider', posts);
});
*/
