/*jshint asi:true, esnext:true */

var dog          =  require('..')
  , test         =  require('tap').test
  , fs           =  require('fs')
  , path         =  require('path')
  , postmetaDir  =  path.join(__dirname, 'fixtures', 'testblog', 'post-metadata')
  , postjsonFile =  path.join(postmetaDir, 'post.json')
  ;

function setup () {
  var post = {
        created: new Date(2012, 1, 1, 7, 12, 23)
      , updated: new Date(2012, 2, 3, 5, 12, 23)
      , name   : 'post-meta'
      , title  : 'Post Meta Test'
      , tags   : ['tuno', 'tdos']
    }
  , postjson = JSON.stringify(post, null, 2)
  ;

  fs.writeFileSync(postjsonFile, postjson, 'utf8');
}

test('when rendering a post that has meta tags for title, created, updated and tags', function (t) {
  setup()

  dog.renderer.render(postmetaDir, function (err, html) {
    console.log(html)
    t.test('# renders title', function (t) {
      t.ok(~html.indexOf('<h1>Post Meta Test</h1>'))
      t.end()
    })

    fs.unlinkSync(postjsonFile)
    
    t.end()
  });
});
