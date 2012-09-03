#!/usr/bin/env node

var utl           =  require('./lib/utl')
  , render        =  module.exports.render     =  require('./lib/renderer').render
  , publish       =  module.exports.publish    =  require('./lib/publisher').publish
  , includeStyles =  module.exports.publish    =  require('./lib/publisher').includeStyles
  , provider      =  require('./lib/provider')
  ;

Object.keys(provider).forEach(function (exp) {
  module.exports[exp] = provider[exp];  
});

if (module.parent) return;

var log = require('npmlog')
  , path = require('path')
  ;

var argv = require('optimist')
    .usage('$0 -a <action> [options]')

    .options('a', {
        alias: 'action'
      , describe: 'One of the following: preview, publish, summary, includeStyles'
      , default: 'preview'
    })
    .options('p', {
        alias: 'post'
      , describe: 'The directory in which the post resides inside the blog directory'
    })
    .options('t', {
        alias: 'title'
      , describe: 'The title to give to the post'
      , default: 'Untitled'
    })
    .options('g', {
        alias: 'tags'
      , describe: 'Tags which should be applied to the post'
      , default: 'untagged'
    })
    .options('s', {
        alias: 'styles'
      , describe: 'Styles (without ".css" extension) to be included when the blog is provided'
      , default: 'code code-fixes blog'
    })

    .check(function (args) {
        switch(args.action) {
          case 'preview':
            if (!args.post) throw new Error('Please specify post to preview.');
            break;
          case 'publish':
            if (!args.post) throw new Error('Please specify post to publish.');
            break;
          case 'includeStyles':
            if (!args.styles) throw new Error('Please specify styles to include.');
            break;
            
          default:
            return true;
        }
      })

    .argv
  , postdir = path.join(__dirname, 'blog', argv.post)
  ;

  
switch(argv.action) {

  case 'preview':
    render(postdir, function (err, html) {
      if (err) { log.error('blog', err); return; }

      log.info('preview', 'Opening blog %s in browser', argv.blog);
      require('./lib/preview')(postdir, html);
    });
    break;
  
  case 'publish':

    var tags = utl.split(argv.tags)
      , opts = {
          title: argv.title
        , tags: tags
      };

    publish(postdir, opts, function (err) {
      if (err) { log.error('publisher', err); return; }
      log.info('publisher', 'Post %s successfully published/updated', argv.post);
    });
    break;
  case 'summary':
    provider.printSummary();
    break;

  case 'includeStyles':
    var styles = utl.split(argv.styles);
    includeStyles(postdir, styles, function (err) {
      if (err) { log.error('publisher', err); return; }
      log.info('publisher', 'Styles: "%s" successfully included', argv.styles);
    });
    break;

  
  default:
    log.error('blog-engine', 'Unknown action:', argv.action);
    break;
}
  





