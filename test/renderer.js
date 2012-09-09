/*jshint asi:true, esnext:true */

var dog = require('..')
  , test = require('tap').test
  , path = require('path')
  , postunoDir = path.join(__dirname, 'fixtures', 'testblog', 'postuno')
  ;

test('when rendering postuno that has an inlined and an external snippet', function (t) {

  t.plan(4)

  dog.renderer.render(postunoDir, function (err, html) {
    t.test('# renders main header', function (t) {
      t.ok(~html.indexOf('<h1>Blog Uno</h1>'))
      t.end()
    })

    t.test('# renders inlined snippet', function (t) {
      t.ok(~html.indexOf('<h2>Inlined snippet</h2>'), 'header')
      t.ok(~html.indexOf('<code class="keyword">var</code> <code class="plain">some = </code><code class="string">\'javascript\'</code>'), 'snippet')
      t.end()
    })

    t.test('# renders external snippet', function (t) {
      t.ok(~html.indexOf('<h2>Snippet pulled in</h2>'), 'header')
      t.ok(~html.indexOf('<code class="keyword">var</code> <code class="plain">simple = 1;</code>'), 'snippet')
      t.end()
    })

    t.test('# wraps it in blog-post article', function (t) {
      t.ok(~html.indexOf('<article class="blog-post"'))
      t.end()
    })

    t.end()
  })

})


