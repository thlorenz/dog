/* Metadata schema:
 *
 * PostData : {
 *  title: 'post title'
 *  name: 'post_name' (same as containing folder)
 *  created: date
 *  updated: date
 *  tags: [] (for this particular post)
 * }
 *
 * BlogData: {
 *  posts [
 *    "post1"
 *    "post2"
 *  ]
 *  tags: [] (of all posts)
 * }
 * 
 */

var utl = require('./utl')
  , fs = require('fs')
  , log = require('npmlog')
  , path = require('path')
  ;

function createPostMetadata(current, opts) {
  var metadata = utl.merge(current, opts)
    , json = JSON.stringify(metadata, undefined, 2)
    ;

  log.info('publish', 'Created/Updated PostMetadata:', json);
  return { metadata: metadata, json: json };
}

function createBlogMetadata(current, postMetadata) {

  if(current.posts.indexOf(postMetadata.name) < 0) current.posts.push(postMetadata.name);

  postMetadata.tags.forEach(function (tag) {
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

function publish(postdir, opts, published) {
  var postMetadataFile =  path.join(postdir, 'post.json')
    , blogMetadataFile =  path.join(postdir, '..', 'blog.json')
    , defaultPostMetadata =  {
        created :  utl.now()
      , updated :  utl.now()
      , tags    :  []
      , name    :  utl.innermostDir(postdir)
      , title   :  "Untitled"
      }
    , defaultBlogMetadata = {
        posts :  []
      , tags  :  []
      }
    , metadata
    ;
  
  function writePostMetadata(cb) {

    resolveCurrentMetadata(postMetadataFile, function (err, currentMetadata) {
      if (err) { published(err); return; }

      metadata = createPostMetadata(currentMetadata || defaultPostMetadata, opts);
      fs.writeFile(postMetadataFile, metadata.json, 'utf8', function (err) {
        if (err) published(err); else cb(metadata.metadata);
      });
    });
  }

  function writeBlogMetadata(postMetadata) {

    resolveCurrentMetadata(blogMetadataFile, function (err, currentBlogMetadata) {
      if (err) { published(err); return; }
      
      metadata = createBlogMetadata(currentBlogMetadata || defaultBlogMetadata, postMetadata);
      fs.writeFile(blogMetadataFile, metadata.json, 'utf8', function (err) {
        if (err) published(err); else published(null);
      });
    });
  }

  opts.updated = utl.now();

  utl.ensurePathExists(postdir, function (err) {
    if (err) { published(err); return; }

    writePostMetadata(writeBlogMetadata);
  });
}

/*
var postdir = path.join(__dirname, '..', 'post', 'example');

publish(
    postdir
  , { name: 'example', title: 'My Example Post', tags: [ 'javascript', 'testing' ] }
  , function (err, data) {
      if (err) { log.error('publish', err); return; }
    }
);

*/
module.exports = publish;
