/* Metadata schema:
 *
 * BlogData : {
 *  title: 'blog title'
 *  name: 'blog_name' (same as containing folder)
 *  created: date
 *  updated: date
 *  tags: [] (for this particular blog)
 * }
 *
 * BlogsIndex: {
 *  blogs [
 *    "blog1"
 *    "blog2"
 *  ]
 *  tags: [] (of all blogs)
 * }
 * 
 */

var utl = require('./utl')
  , fs = require('fs')
  , log = require('npmlog')
  , path = require('path')
  ;

function createBlogMetadata(current, opts) {
  var metadata = utl.merge(current, opts)
    , json = JSON.stringify(metadata, undefined, 2)
    ;

  log.info('publish', 'Created/Updated BlogMetadata:', json);
  return { metadata: metadata, json: json };
}

function createIndexMetadata(current, blogMetadata) {

  if(current.blogs.indexOf(blogMetadata.name) < 0) current.blogs.push(blogMetadata.name);

  blogMetadata.tags.forEach(function (tag) {
    if(current.tags.indexOf(tag) < 0) { 
      log.info('publish', 'adding tag', tag);
      current.tags.push(tag);
    }
  });

  var json = JSON.stringify(current, undefined, 2);

  log.info('publish', 'Created/Updated IndexMetadata:', json);
  return { metadata: current, json: json };
}

/* 
 * Calls back with metadata found inside given file if it exists, otherwise with null
 */
function resolveCurrentMetadata(metadataFile, cb) {
  var metadata;

  utl.exists(metadataFile, function (exists) {
    if (!exists) { 
      cb(null, null);
      return;
    }

    fs.readFile(metadataFile, 'utf8', function (err, data) {
      if (err) { cb(err); return; }  
      try {
        var current = JSON.parse(data);
        cb(null, current);
      } catch (excep) {
        cb(excep);
      }
    });
  });
}

function publish(blogdir, opts, published) {
  var blogMetadataFile        =  path.join(blogdir, 'blog.json')
    , blogIndexMetadataFile   =  path.join(blogdir, '..', 'blogs.json')
    , defaultBlogMetadata =  {
        created :  utl.now()
      , updated :  utl.now()
      , tags    :  []
      , name    :  utl.innermostDir(blogdir)
      , title   :  "Untitled"
      }
    , defaultIndexMetadata = {
        blogs :  []
      , tags  :  []
      }
    , metadata
    ;
  
  function writeBlogMetadata(cb) {

    resolveCurrentMetadata(blogMetadataFile, function (err, currentMetadata) {
      if (err) { published(err); return; }

      metadata = createBlogMetadata(currentMetadata || defaultBlogMetadata, opts);
      fs.writeFile(blogMetadataFile, metadata.json, 'utf8', function (err) {
        if (err) published(err); else cb(metadata.metadata);
      });
    });
  }

  function writeIndexMetadata(blogMetadata) {

    resolveCurrentMetadata(blogIndexMetadataFile, function (err, currentIndexMetadata) {
      if (err) { published(err); return; }
      
      metadata = createIndexMetadata(currentIndexMetadata || defaultIndexMetadata, blogMetadata);
      fs.writeFile(blogIndexMetadataFile, metadata.json, 'utf8', function (err) {
        if (err) published(err); else published(null);
      });
    });
  }

  opts.updated = utl.now();

  utl.ensurePathExists(blogdir, function (err) {
    if (err) { published(err); return; }

    writeBlogMetadata(writeIndexMetadata);
  });
}

/*
var blogdir = path.join(__dirname, '..', 'blog', 'example');

publish(
    blogdir
  , { name: 'example', title: 'My Example Blog', tags: [ 'javascript', 'testing' ] }
  , function (err, data) {
      if (err) { log.error('publish', err); return; }
    }
);

*/
module.exports = publish;
