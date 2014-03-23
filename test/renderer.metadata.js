/*jshint asi:true, esnext:true */

var dog          =  require('..')
  , test         =  require('tap').test
  , fs           =  require('fs')
  , path         =  require('path')
  , postmetaDir  =  path.join(__dirname, 'fixtures', 'testblog', 'post-metadata')
  , postjsonFile =  path.join(postmetaDir, 'post.json')
  ;

require('npmlog').level = 'silly'; 
function setup () {
  var post = {
        created: new Date(2012, 1, 1, 7, 12, 23)
      , updated: new Date(2012, 2, 3, 17, 12, 23)
      , name   : 'post-meta'
      , title  : 'Post Meta Test'
      , tags   : ['tuno', 'tdos']
    }
  , postjson = JSON.stringify(post, null, 2)
  ;

  fs.writeFileSync(postjsonFile, postjson, 'utf8');
}

test('when rendering a post that has meta tags for title, created, updated and tags', function (t) {
  t.plan(4)

  setup()

  dog.renderer.render(postmetaDir, function (err, html) {
    if (err) { console.trace(); console.error(err); }

    t.test('# renders title', function (t) {
      t.plan(1)
      t.ok(~html.indexOf('<h1 id="-meta-title-">Post Meta Test</h1>'))
      t.end()
    })

    t.test('# renders created time', function (t) {
      t.plan(1)
      t.ok(~html.indexOf('Created: <span class="created">Wednesday, February 1st, 2012, 7:12:23 AM</span>'))
      t.end()
    })

    t.test('# renders updated time', function (t) {
      t.plan(1)
      t.ok(~html.indexOf('Updated: <span class="updated">Saturday, March 3rd, 2012, 5:12:23 PM</span>'))
      t.end()
    })

    t.test('# renders tags', function (t) {
      t.plan(4)
      t.ok(~html.indexOf('<ul class="tags">'),  'ul open tag')
      t.ok(~html.indexOf('<li>tuno</li>')    ,  'first list item')
      t.ok(~html.indexOf('<li>tdos</li>')    ,  'second list item')
      t.ok(~html.indexOf('</ul>')            ,  'ul close tag')
      t.end()
    });

    fs.unlinkSync(postjsonFile)
    
    t.end()
  });
});
