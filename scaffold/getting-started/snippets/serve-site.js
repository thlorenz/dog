function serveSite () {

  function getRoot () {
    var postList = Object.keys(posts).map(function (name) {
      return '<li><a href="/post/' + name + '">' + posts[name].title + '</a></li>';
    });
    wrapnServe(this.res, '<ul>' + postList + '</ul>');
  }

  function getPost (post) {
    wrapnServe(this.res, posts[post].html);
  }

  function getImage (file) {
    var res = this.res
      , imgMime = path.extname(file).slice(1)
      , imageFile = path.join(dog.provider.getImagesDir(), file);
      
    fs.readFile(imageFile, function (err, data) {
      res.writeHead(200, { 'Content-Type': 'image/' + imgMime, 'Content-Length': data.length });
      res.end(data); 
    });
  }

  function getBlogCss () {
    this.res.writeHead(200, { 'Content-Type': 'text/css', 'Content-Length': blogCss.length });
    this.res.end(blogCss); 
  }

  var router = new director.http.Router({
      '/'                :  { get :  getRoot }
    , '/post/:post'      :  { get :  getPost }
    , '/styles/blog.css' :  { get :  getBlogCss }
    , '/images/:file'    :  { get :  getImage }
  });

  var server = http.createServer(function (req, res) {

    router.dispatch(req, res, function (err) {
      if (err) {
        console.error('app', err);
        res.writeHead(404);
        res.end();
      }
    });
  });

  server.listen(3000, function () {
    console.log('server listening at ', root);
  });
}
