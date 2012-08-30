#!/usr/bin/env node

var render = module.exports.render = require('./lib/renderer').render;

if (module.parent) return;

var log = require('npmlog')
  , path = require('path')
  ;

var argv = require('optimist')
    .default('a', 'preview')
    .alias('a', 'action')
    .demand('b')
    .alias('b', 'blog')
    .argv
  , blogdir = path.join(__dirname, 'blog', argv.blog)
  ;

if (argv.action === 'preview') {
  
  render(blogdir, function (err, html) {

    if (err) { log.error('blog', err); return; }


    log.info('preview', 'Opening blog %s in browser', argv.blog);

    require('./lib/preview')(blogdir, html);
  });

}

  





