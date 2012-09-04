/*
 * Simple Server Example
 * =====================
 *
 * This example demonstrates how to use the dog provider in order to serve the blog via a website.
 *
 * Please keep in mind that I favored simplicity over correctness and robustness.
 * I used shorter (and somewhat naive) implementations and avoided using libraries to let this example stand on its own.
 *
 * The following should be improved if this was to be used for real:
 *
 *  - implement a more robust router or use libraries like  director or express
 *  - the server and blog initialization need more robust error handling
 *  - the code should be modularized
 *
 */

var dog           =  require('./../../..')
  , provider      =  dog.provider
  , log           =  require('npmlog')
  , http          =  require('http')
  , path          =  require('path')
  , fs            =  require('fs')
  , pagegen       =  require('./page-generator')
  , blogdir       =  path.join(__dirname, '..', 'blog')
  , staticdir     =  path.join(__dirname, 'static')
  , imagesdir     =  path.join(staticdir, 'images')
  , nodejsImg     =  path.join(imagesdir, 'nodejs.png')
  , stylesdir     =  path.join(staticdir, 'styles')
  , blogstyleFile =  path.join(stylesdir, 'blog.css')
  , PORT          =  3000
  , postsNames
  , posts
  ;


function serveSite () {
  http
    .createServer(function (req, res) {

      function respond(data, type) {
        res.writeHead(
            200
          , { 
              'Content-Type'   :  type
            , 'Content-Length' :  data.length
          });
        res.end(data);
      }

      function fail(status) {
          res.writeHead(status);
          res.end();
      }

      log.info('blog-server', '%s %s', req.method, req.url);

      switch(req.url) {
        case '/':
          var postlinks = postsNames.map(function (postname) {
                log.info('blog-server','map', posts[postname].metadata);
                return '<a href="/blog/' + postname + '">' + posts[postname].metadata.title + '</a>';  
              })
              .join('\n')
            , html = [
                '<h1>Welcome!</h1>'
              , '<p>Please select a post from below</p>'
              , postlinks
              ]
              .join('\n');

          respond(pagegen.wrap(html), 'text/html');
          break;
        case '/blog/first-post':
          respond(pagegen.wrap(posts['first-post'].html), 'text/html');
          break;
        case '/blog/disclaimer':
          respond(pagegen.wrap(posts['disclaimer'].html), 'text/html');
          break;

        case '/blog/assets/styles/blog.css':
          fs.readFile(blogstyleFile, 'utf8', function (err, data) {
            if (err) { fail(505); return; }
            respond(data, 'text/css');
          });
          break;

        case '/blog/assets/images/nodejs.png':
          fs.readFile(nodejsImg, function (err, data) {
            if (err) { fail(505); return; }
            respond(data, 'image/png');
          });
          break;
        
        default:
          log.error('blog-server', 'Unknown route: ', req.url);
          fail(404);
          break;
      }
    })
    .listen(PORT, 'localhost');

  log.info('blog-server', 'Listening at localhost:', PORT);
  log.info('blog-server', 'Please point your browser to http://localhost:%s', PORT);
}

function initializeBlog (initialized) {
  provider.provideFrom(blogdir);

  initImages();

  function initImages () {
    provider.copyImages(imagesdir, function (err) {
      if (err) { log.error('blog-server', err); }
      initStyles();
    });
  }

  function initStyles () {
    provider.concatenateStyles(function (err, css) {
      if (err) { log.error('blog-server', err); }
      fs.writeFile(blogstyleFile, css, 'utf8', function (err) {
        if (err) { log.error('blog-server', err); }
        initPosts();
      });
    });
  }

  function initPosts () {
    provider.getAllPosts(function (err, postnamesArg) {
      if (err) { log.error('blog-server', err); }
      postsNames = postnamesArg
      
      provider.provideAll(function (err, metadata) {
        if (err) { log.error('blog-server', err); }
        posts = {};

        metadata.forEach(function (meta) {
          posts[meta.name] = meta;
          log.info('blog-server', 'Providing: %s\n', meta.name, meta.metadata);
        });

        log.info('blog-server', 'Initialized posts', postsNames);

        initialized();
      });
    });
  }
}

initializeBlog(serveSite);
