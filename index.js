#!/usr/bin/env node

var render = module.exports.render = require('./lib/renderer').render
  , publish = module.exports.publish = require('./lib/publish')
  ;

if (module.parent) return;

var log = require('npmlog')
  , path = require('path')
  ;

var argv = require('optimist')
    .default('a', 'preview')
    .alias('a', 'action')
    .describe('a', 'One of the following: preview, publish')
    .demand('p')
    .alias('p', 'post')
    .describe('p', 'The directory in which the post resides inside the blog directory')
    .alias('t', 'title')
    .describe('t', 'The title to give to the post')
    .alias('s', 'tags')
    .describe('s', 'Post subjects with which it will be tagged')
    .argv
  , postdir = path.join(__dirname, 'blog', argv.blog)
  ;

  
switch(argv.action) {
  case 'preview':
    var postdir = path.join(__dirname, 'blog', argv.post);

    render(postdir, function (err, html) {
      if (err) { log.error('blog', err); return; }

      log.info('preview', 'Opening blog %s in browser', argv.blog);
      require('./lib/preview')(postdir, html);
    });
    break;
  
  default:
    log.error('engine', 'Unknown action:', argv.action);
    break;
}
  





