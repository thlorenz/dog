#!/usr/bin/env node

var utl           =  require('./lib/utl')
  , publisher     =  require('./lib/publisher')
  , renderer      =  require('./lib/renderer')
  , provider      =  require('./lib/provider')
  ;

module.exports = {
    publisher: publisher
  , renderer: renderer
  , provider: provider
};

if (module.parent) return;

var log = require('npmlog')
  , path = require('path')
  ;

var argv = require('optimist')
    .usage('$0 -a <action> [options]')

    .options('a', {
        alias: 'action'
      , describe: 'One of the following: preview, publish, unpublish, summary, includeStyles'
      , default: 'preview'
    })
    .options('r', {
        alias: 'root'
      , describe: 'The root directory of your blog e.g., the one that contains blog.json'
      , default: './'
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
          case 'unpublish':
            if (!args.post) throw new Error('Please specify post to unpublish');
            break;
          case 'includeStyles':
            if (!args.styles) throw new Error('Please specify styles to include.');
            break;
            
          default:
            return true;
        }
      })

    .argv
  , postdir = path.join(argv.root, argv.post)
  ;

// TODO: print argv used (e.g., filter more than 2 chars long)
switch(argv.action) {

  case 'preview':
    renderer.render(postdir, function (err, html) {
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

    publisher.publish(postdir, opts, function (err) {
      if (err) { log.error('publisher', err); return; }
      log.info('publisher', 'Post %s successfully published/updated', argv.post);
    });
    break;

  case 'unpublish':

    publisher.unpublish(postdir, function (err) {
      if (err) { log.error('publisher', err); return; }
      log.info('publisher', 'Post %s successfully unpublished', argv.post);
    });
    break;

  case 'summary':
    provider
      .initProvider(argv.root)
      .printSummary();
    break;

  case 'includeStyles':
    var styles = utl.split(argv.styles);
    publisher.includeStyles(postdir, styles, function (err) {
      if (err) { log.error('publisher', err); return; }
      log.info('publisher', 'Styles: "%s" successfully included', argv.styles);
    });
    break;
  
  default:
    log.error('blog-engine', 'Unknown action:', argv.action);
    break;
}
  





