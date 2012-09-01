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
    .demand('p')
    .alias('p', 'post')
    .describe('p', 'The directory in which the post resides inside the blog directory.')
    .alias('t', 'title')
    .describe('t', 'The title to give to the post (same as the header).')
    .alias('s', 'tags')
    .describe('s', 'Subjects that the post pertains to and under which the post will be tagged.')
    .argv
  , postdir = path.join(__dirname, 'blog', argv.blog)
  ;

  
switch(argv.action) {
  case 'preview':
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
  





