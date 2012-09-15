#!/usr/bin/env node

var utl        =  require('./lib/utl')
  , util       =  require('util')
  , publisher  =  require('./lib/publisher')
  , renderer   =  require('./lib/renderer')
  , provider   =  require('./lib/provider')
  , scaffolder =  require('./lib/scaffolder')
  ;

module.exports = {
    publisher  :  publisher
  , renderer   :  renderer
  , provider   :  provider
  , scaffolder :  scaffolder
};

if (module.parent) return;

var log = require('npmlog')
  , path = require('path')
  , actions = [ 'scaffold', 'preview', 'publish', 'unpublish', 'summary', 'includeStyles', 'help' ]
  ;
  

var cli = require('optimist')
    .usage('$0 <action> <post> [options]')
    .options('a', {
        alias: 'action'
      , describe: 'One of the following: ' + actions.join(', ')
    })
    .options('p', {
        alias: 'post'
      , describe: 'The directory in which the post resides inside the blog directory'
    })
    .options('r', {
        alias: 'root'
      , describe: 'The root directory of your blog e.g., the one that contains blog.json'
      , default: './'
    })
    .options('t', {
        alias: 'title'
      , describe: 'The title to give to the post'
    })
    .options('g', {
        alias: 'tags'
      , describe: 'Tags which should be applied to the post'
    })
    .options('s', {
        alias: 'styles'
      , describe: 'Styles (without ".css" extension) to be included when the blog is provided'
      , default: 'code code-fixes blog'
    })
    .check(function (args) {
      
      // allow omitting --action or -a for first argument e.g., "dog -a publish" is the same as "dog publish"
      if (process.argv.length > 2 && !~process.argv[2].indexOf('-'))
        args.action = process.argv[2];

      // allow omitting --post or -p for second argument e.g., "dog pub -p my-post" is the same as "dog pub my-post"
      if (process.argv.length > 3 && (process.argv[3].indexOf('-') !== 0))
        args.post = process.argv[3];

      var actionMatches = utl.findMatches(actions, args.action);

      if (actionMatches.length === 0) 
        throw new Error(util.format('Unkown action: %s.', args.action));

      if (actionMatches.length > 1)
        throw new Error(
          util.format(
              'Given action string matches more than one action: %s, please be more specific.'
            , actionMatches.join(' and ')
          )
        );

      args.action = actionMatches[0];

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
  , argv = cli.argv

  , postdir = path.join(argv.root, argv.post)
  ;

switch(argv.action) {
  case 'scaffold':
    scaffolder.scaffold(argv.root, function (err) {
      if (err) { log.error('scaffolder', err); return; }
    });
    break;

  case 'preview':
    renderer.render(postdir, function (err, html) {
      if (err) { log.error('blog', err); return; }

      log.info('preview', 'Opening post %s in browser', argv.post);
      require('./lib/preview')(postdir, html);
    });
    break;
  
  case 'publish':

    var tags = argv.tags ? utl.split(argv.tags, /[ ,]+/) : undefined
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
      .provideFrom(argv.root)
      .printSummary();
    break;

  case 'includeStyles':
    var styles = utl.split(argv.styles, /[ ,]+/);
    publisher.includeStyles(postdir, styles, function (err) {
      if (err) { log.error('publisher', err); return; }
      log.info('publisher', 'Styles: "%s" successfully included', argv.styles);
    });
    break;
  case 'help':
    console.log(cli.help());
    break;
  
  default:
    log.error('blog-engine', 'Unknown action:', argv.action);
    break;
}
