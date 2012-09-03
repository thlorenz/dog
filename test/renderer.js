/*jshint asi:true, esnext:true */

var dog = require('..')
  , path = require('path')
  , postunoDir = path.join(__dirname, 'fixtures', 'testblog', 'postuno')
  ;

describe('when rendering postuno that has an inlined and an external snippet', function () {
  var result;

  before(function (done) {
    dog.renderer.render(postunoDir, function (err, html) {
      if (err) console.error(err); 
      else result = html;
      done();
    });
  })

  it('contains main header', function () {
    result.should.include('<h1>Blog Uno</h1>');
  })

  it('contains header for inlined snippet', function () {
    result.should.include('<h2>Inlined snippet</h2>');
  })

  it('contains inlined snippet', function () {
    result.should.include('<code class="keyword">var</code> <code class="plain">some = </code><code class="string">\'javascript\'</code>');
  })

  it('contains header for external snippet', function () {
    result.should.include('<h2>Snippet pulled in</h2>');
  })

  it('contains external snippet', function () {
    result.should.include('<code class="keyword">var</code> <code class="plain">simple = 1;</code>');
  })

  it('wraps it in blog-post article', function () {
    result.should.include('<article class="blog-post"');  
  })
})


