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
  , blogdir
  , blogJsonFile
  , blogindexJsonFile
  , blogdirExists
  , blogJsonFileExists
  , blogindexJsonFileExists
  , now 
  , publish
  , written
  ;

describe('blog publishing', function () {
  beforeEach(function () {
    opts = { name: 'blogname', title: 'My Example Blog', tags: [ 'javascript', 'testing' ] }

    error                   =  null;
    blogdir                 =  path.join('blog', opts.name);
    blogJsonFile            =  path.join(blogdir, 'blog.json');
    blogindexJsonFile       =  path.join(blogdir, '..', 'blogs.json');
    blogdirExists           =  true;
    blogJsonFileExists      =  false;
    blogindexJsonFileExists =  false;
    now                     =  new Date(2012, 0, 1)
    written                 =  {}

    utl = {
        exists: function (entry, cb) { 
          switch(entry) {
            case blogJsonFile      : cb(blogJsonFileExists)      ; break ;
            case blogindexJsonFile : cb(blogindexJsonFileExists) ; break ;
            case blogdir           : cb(blogdirExists)           ; break ;
          }
        }
      , ensurePathExists: function (entry, cb) {
          if (entry === blogdir && !blogdirExists) cb(new Error('not exists'));
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

    // Supress all logging during tests
    log = { 
        info    :  function () {}
      , verbose :  function () {}
      , silly   :  function () {}
      , error   :  function () {}
    };

    publish = proxyquire.resolve('../lib/publish', __dirname, { 
        fs      :  fs
      , './utl' :  utl
      , npmlog  :  log 
    });
  })

  describe('when blog doesn\'t exist', function () {
    beforeEach(function () {
      blogdirExists = false;

      publish(blogdir, opts, function (err) {
        error = err;  
      });
    })

    it('calls back with error', function () {
      should.exist(error);
    })  
  })

  describe('when blog wasn\'t published before', function () {
    var meta, index, firstNow;
    beforeEach(function () {
      firstNow = now; 
      publish(blogdir, opts, function () { });
      meta = written[blogJsonFile];
      index = written[blogindexJsonFile];
    })

    it('adds name to blog metadata', function () {
      meta.name.should.eql(opts.name);
    })

    it('adds title to blog metadata', function () {
     meta.title.should.eql(opts.title);
    })

    it('adds created (now) to blog metadata', function () {
      meta.created.should.eql(jsonify(now));
    })

    it('adds updated (now) to blog metadata', function () {
      meta.updated.should.eql(jsonify(now));
    })

    it('adds tags to blog metadata', function () {
     meta.tags.should.eql(opts.tags);
    })

    it('adds blog to blogs index', function () {
      index.blogs.should.include(opts.name);
    })

    it('adds blog tags to blogs index tags', function () {
      index.tags.should.eql(opts.tags);  
    })

    describe('and I publish the same blog again in order to update it\'s title and add a tag', function () {
      var upmeta, upindex, upopts;

      beforeEach(function () {
        now = new Date(2012, 0, 2);
        upopts = { name: opts.name, title: 'new title', tags: ['javascript', 'testing', 'blog'] };

        blogJsonFileExists = true;
        blogindexJsonFileExists = true;

        fs.readFile= function (file, encoding, cb) {
          switch(file) {
            case blogJsonFile      :  cb(null, JSON.stringify(meta))  ; break ;
            case blogindexJsonFile :  cb(null, JSON.stringify(index)) ; break ;
          }
        }

        publish(blogdir, upopts, function () { });

        upmeta = written[blogJsonFile];
        upindex = written[blogindexJsonFile];
      })

      it('keeps name in blog metadata', function () {
        upmeta.name.should.eql(opts.name);
      })

      it('updates new title in blog metadata', function () {
        upmeta.title.should.eql(upopts.title);
      })

      it('keeps created (now at first publish) in blog metadata', function () {
        upmeta.created.should.eql(jsonify(firstNow));
      })

      it('updates updated (current now) to blog metadata', function () {
        upmeta.updated.should.eql(jsonify(now));
      })

      it('adds tags to blog metadata', function () {
        upmeta.tags.should.eql(upopts.tags);
      })

      it('updates blogs index tags', function () {
        upindex.tags.should.eql(upopts.tags);
      })
    })
  })
})


