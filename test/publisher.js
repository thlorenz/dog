/*jshint asi:true, esnext:true */

function jsonify(obj) {
  return JSON.parse(JSON.stringify(obj));
}

var should = require('should')
  , proxyquire = require('proxyquire')
  , path = require('path')
  , fs
  , utl
  , log
  , error
  , opts
  , postname
  , postdir
  , postJsonFile
  , blogJsonFile
  , postdirExists
  , postJsonFileExists
  , blogJsonFileExists
  , now 
  , publish
  , written
  ;

describe('post publishing', function () {
  beforeEach(function () {
    opts = { title: 'My Example Post', tags: [ 'javascript', 'testing' ] }

    error              =  null;
    postname           =  'postname'
    postdir            =  path.join('blog', postname);
    postJsonFile       =  path.join(postdir, 'post.json');
    blogJsonFile       =  path.join(postdir, '..', 'blog.json');
    postdirExists      =  true;
    postJsonFileExists =  false;
    blogJsonFileExists =  false;
    now                =  new Date(2012, 0, 1)
    written            =  {}

    utl = {
        exists: function (entry, cb) { 
          switch(entry) {
            case postJsonFile :  cb(postJsonFileExists) ; break ;
            case blogJsonFile :  cb(blogJsonFileExists) ; break ;
            case postdir      :  cb(postdirExists)      ; break ;
          }
        }
      , ensurePathExists: function (entry, cb) {
          if (entry === postdir && !postdirExists) cb(new Error('not exists'));
          else cb();
        }
      , now: function () { return now; }
    };

    fs = {
      writeFile : function(file, content, encoding, cb) {
        written[file] = JSON.parse(content);
        cb();
      }
    };

    publish = proxyquire.resolve('../lib/publisher', __dirname, { 
          fs      :  fs
        , './utl' :  utl
        , npmlog  :  require('./fakes/npmlog')
      })
      .publish;
  })

  describe('when post doesn\'t exist', function () {
    beforeEach(function () {
      postdirExists = false;

      publish(postdir, opts, function (err) {
        error = err;  
      });
    })

    it('calls back with error', function () {
      should.exist(error);
    })  
  })

  describe('when post wasn\'t published before', function () {
    var meta, index, firstNow;
    beforeEach(function () {
      publish(postdir, opts, function () { });
      meta = written[postJsonFile];
      index = written[blogJsonFile];
    })

    it('adds name to post metadata', function () {
      meta.name.should.eql(postname);
    })

    it('adds title to post metadata', function () {
     meta.title.should.eql(opts.title);
    })

    it('adds created (now) to post metadata', function () {
      meta.created.should.eql(jsonify(now));
    })

    it('adds updated (now) to post metadata', function () {
      meta.updated.should.eql(jsonify(now));
    })

    it('adds tags to post metadata', function () {
     meta.tags.should.eql(opts.tags);
    })

    it('adds post to blogs', function () {
      index.posts.should.include(postname);
    })

    it('adds post tags to blog tags', function () {
      index.tags.should.eql(opts.tags);  
    })

    describe('and I publish the same post again in order to update it\'s title and add a tag', function () {
      var upmeta, upindex, upopts;

      beforeEach(function () {
        firstNow = now; 
        now = new Date(2012, 0, 2);
        upopts = { title: 'new title', tags: ['javascript', 'testing', 'post'] };

        postJsonFileExists = true;
        blogJsonFileExists = true;

        fs.readFile= function (file, encoding, cb) {
          switch(file) {
            case postJsonFile :  cb(null, JSON.stringify(meta))  ; break ;
            case blogJsonFile :  cb(null, JSON.stringify(index)) ; break ;
          }
        }

        publish(postdir, upopts, function () { });

        upmeta = written[postJsonFile];
        upindex = written[blogJsonFile];
      })

      it('keeps name in post metadata', function () {
        upmeta.name.should.eql(postname);
      })

      it('updates new title in post metadata', function () {
        upmeta.title.should.eql(upopts.title);
      })

      it('keeps created (now at first publish) in post metadata', function () {
        upmeta.created.should.eql(jsonify(firstNow));
      })

      it('updates updated (current now) to post metadata', function () {
        upmeta.updated.should.eql(jsonify(now));
      })

      it('adds tags to post metadata', function () {
        upmeta.tags.should.eql(upopts.tags);
      })

      it('updates blog tags', function () {
        upindex.tags.should.eql(upopts.tags);
      })
    })
  })
})


