/*jshint asi:true, esnext:true */

var proxyquire = require('proxyquire')
  , should = require('should')
  , sut = proxyquire.resolve('../lib/publisher', __dirname, { npmlog: require('./fakes/npmlog') })
  , path = require('path')
  , fs = require('fs')
  , utl = require('../lib/utl')

  , blogdir =  path.join(__dirname, 'fixtures', 'testblog')
  , blogjsonFile = path.join(blogdir, 'blog.json')

  , postunodir = path.join(blogdir, 'postuno')
  , postunojsonFile = path.join(postunodir, 'post.json') 

  , postdosdir = path.join(blogdir, 'postdos')
  , postdosjsonFile = path.join(postdosdir, 'post.json') 

  , cleanups = [ blogjsonFile, postunojsonFile, postdosjsonFile ]
  , opts

  , postunojson
  , postdosjson
  , blogjson
  ;

function readJsons() {
  function jsonIfExists(file) {
    if (!utl.existsSync(file)) return null;

    var json = fs.readFileSync(file, 'utf8')
      , metadata = JSON.parse(json)
      ;
     
    metadata.created = utl.stringToDate(metadata.created);
    metadata.updated = utl.stringToDate(metadata.updated);
    
    return metadata;
  }

  blogjson = jsonIfExists(blogjsonFile);
  postunojson = jsonIfExists(postunojsonFile);
  postdosjson = jsonIfExists(postdosjsonFile);

}

describe('publishing and unpublishing', function () {
  before(function () {
    cleanups.forEach(function (file) {
      if (utl.existsSync(file)) fs.unlink(file);
    });      
  })
  
  describe('when I publish bloguno given title and tags uno, dos and tres', function () {

    before(function (done) {
      opts = {
          title: 'title for postuno'
        , tags: [ 'tag-uno', 'tag-dos', 'tag-tres' ]
      };

      sut.publish(postunodir, opts, function (err) {
        if (err) { console.trace(); throw err; }
        readJsons();
        done();
      });
    })
    
    it('publishes name for post', function () {
      postunojson.name.should.eql('postuno');
    })

    it('publishes title for post', function () {
      postunojson.title.should.eql(opts.title);
    })

    it('publishes tags for post', function () {
      postunojson.tags.should.eql(opts.tags);
    })

    it('adds post to blogs', function () {
      blogjson.posts.should.include('postuno');
    })

    it('adds post tags to blog tags', function () {
      blogjson.tags.should.eql(postunojson.tags);  
    })

    describe('and then publish blog dos given title and tags dos, tres, and cuatro', function () {
      before(function (done) {
        
        opts = {
            title: 'title for postdos'
          , tags: [ 'tag-dos', 'tag-tres', 'tag-cuatro' ]
        };

        sut.publish(postdosdir, opts, function (err) {
          if (err) { console.trace(); throw err; }
          readJsons();
          done();
        });
      })

      it('publishes name for post', function () {
        postdosjson.name.should.eql('postdos');
      })

      it('publishes title for post', function () {
        postdosjson.title.should.eql(opts.title);
      })

      it('publishes tags for post', function () {
        postdosjson.tags.should.eql(opts.tags);
      })

      it('blog has both posts', function () {
        blogjson.posts.should.include('postuno');
        blogjson.posts.should.include('postdos');
      })

      it('blog tags combine tags of both blogs without duplicates', function () {
        blogjson.tags.length.should.eql(4);
        blogjson.tags.should.include('tag-uno');  
        blogjson.tags.should.include('tag-dos');  
        blogjson.tags.should.include('tag-tres');  
        blogjson.tags.should.include('tag-cuatro');  
      })
    })

    describe('and I unpublish post uno', function () {
      before(function (done) {
        sut.unpublish(postunodir, function (err) {
          if (err) { console.trace(); throw err; }
          readJsons();
          done();
        });
      })

      it('removes post uno\'s post.json', function () {
        utl.existsSync(postunojsonFile).should.eql(false);
      })
      
      it('removes post uno from blog posts', function () {
        blogjson.posts.length.should.eql(1);
        blogjson.posts.should.include('postdos');
      })

      it('removes tag-uno from blog tags since no other post is tagged with it', function () {
        blogjson.tags.length.should.eql(3);
        blogjson.tags.should.include('tag-dos');  
        blogjson.tags.should.include('tag-tres');  
        blogjson.tags.should.include('tag-cuatro');  
      })
    })

    describe('and I try to unpublish non existent post tres', function () {
      var error
        , posttresdir = path.join(blogdir, 'posttres')
        ;

      before(function (done) {
        sut.unpublish(posttresdir, function (err) {
          error = err;
          done();
        });
      })
      
      it('calls back with error indicating the mistake', function () {
        should.exist(error);  
        error.toString().should.include('post.json doesn\'t exist');
      })
    })
  })
})
