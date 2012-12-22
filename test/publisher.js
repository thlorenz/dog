/*jshint asi:true, laxbreak: true, esnext:true */

var proxyquire = require('proxyquire')
  , test = require('tap').test
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

  , now
  , utlStub = {
      now: function () { return now; }
    }
  , sut = proxyquire('../lib/publisher', { npmlog: require('./fakes/npmlog'), './utl': utlStub })

function readJsons() {
  function jsonIfExists(file) {
    if (!utl.existsSync(file)) return null;

    var json = fs.readFileSync(file, 'utf8')
      , metadata = JSON.parse(json)
     
    metadata.created = utl.stringToDate(metadata.created)
    metadata.updated = utl.stringToDate(metadata.updated)
    
    return metadata;
  }

  blogjson = jsonIfExists(blogjsonFile)
  postunojson = jsonIfExists(postunojsonFile)
  postdosjson = jsonIfExists(postdosjsonFile)

}

function setup () {
  cleanups.forEach(function (file) {
    if (utl.existsSync(file)) fs.unlink(file)
  })      
}

test('when I publish bloguno given title and tags uno, dos and tres', function (t) {
  t.plan(7)

  setup()

  var opts = {
      title: 'title for postuno'
    , tags: [ 'tag-uno', 'tag-dos', 'tag-tres' ]
    }

  now = new Date(2012, 0, 1);

  sut.publish(postunodir, opts, function (err) {
    if (err) { console.trace(); throw err; }
    readJsons()
  
    t.equal(postunojson.name     ,  'postuno'   ,  'publishes name for post uno')
    t.equal(postunojson.title    ,  opts.title  ,  'publishes title for post uno')
    t.equal(postunojson.created.toString(), now.toString(), 'publishes created date for post uno')
    t.equal(postunojson.updated.toString(), now.toString(), 'publishes updated date for post uno')
    t.deepEqual(postunojson.tags ,  opts.tags   ,  'publishes tags for post uno')
    t.deepEqual(blogjson.posts   ,  ['postuno'] ,  'blog has postuno')

    t.test('# and then publish blog dos given title and tags dos, tres, and cuatro', function (t) {
      t.plan(7)

      var opts = {
          title: 'title for postdos'
        , tags: [ 'tag-dos', 'tag-tres', 'tag-cuatro' ]
      };

      sut.publish(postdosdir, opts, function (err) {
        if (err) { console.trace(); throw err; }
        readJsons()

        t.equal(postdosjson.name        ,  'postdos'        ,  'publishes name for post dos')
        t.equal(postdosjson.title       ,  opts.title       ,  'publishes title for post dos')
        t.equal(postdosjson.tags.length ,  opts.tags.length ,  'publishes all tags for post dos')
        t.similar(postdosjson.tags      ,  opts.tags        ,  'publishes same tags for post dos')
        t.equal(blogjson.posts.length   ,  2                ,  'blog has 2 posts')
        t.similar(blogjson.posts        , ['postuno', 'postdos'] , 'blog has postuno and postdos')

        t.test('# # and I unpublish post uno ', function (t) {
          t.plan(4)

          sut.unpublish(postunodir, function (err) {
            if (err) { console.trace(); throw err; }
            readJsons();

            t.notOk(utl.existsSync(postunojsonFile), 'removes post uno\'s post json')
            t.deepEqual(blogjson.posts, ['postdos'], 'removes post uno from blog posts')
            t.deepEqual( blogjson.tags , ['tag-dos', 'tag-tres', 'tag-cuatro'] , 'removes tag-uno')

            t.test('and I unpublish post dos ', function (t) {
              t.plan(3)

              sut.unpublish(postdosdir, function (err) {
                if (err) { console.trace(); throw err; }
                readJsons();

                t.notOk(utl.existsSync(postdosjsonFile), 'removes post dos\'s post json')
                t.deepEqual(blogjson.posts, [], 'removes post dos from blog posts')
                t.deepEqual( blogjson.tags , [] , 'removes remaining tags')

                t.end()
              })
            })
            t.end()
          })
        })
        t.end()
      })
    })
    t.end()
  })
})

test('when I publish bloguno given title and tags uno, dos and tres', function (t) {
  t.plan(1)

  setup()

  var opts = {
      title: 'title for postuno'
    , tags: [ 'tag-uno', 'tag-dos', 'tag-tres' ]
    }

  sut.publish(postunodir, opts, function (err) {
    if (err) { console.trace(); throw err; }

    t.test('# and I try to unpublish non existent post tres', function (t) {
      var posttresdir = path.join(blogdir, 'posttres')

      sut.unpublish(posttresdir, function (err) {
        t.plan(2)

        t.ok(err, 'calls back with error')
        t.ok(err.message.match(/post\.json doesn't exist/), 'error indicates the mistake')
        t.end()
      })
    })
    t.end()
  })
})

test('when I publish bloguno given title and tags uno, dos and tres', function (t) {
  t.plan(1)

  setup()

  var opts = {
      title: 'title for postuno'
    , tags: [ 'tag-uno', 'tag-dos', 'tag-tres' ]
    }

  now = new Date(2012, 0, 1);

  sut.publish(postunodir, opts, function (err) {
    if (err) { console.trace(); throw err; }

    t.test('# and I publish the same post again in order to update it\'s title and add a tag', function (t) {
      var upopts;

      firstNow = now; 
      now = new Date(2012, 0, 2);
      upopts = { title: 'new title', tags: ['javascript', 'testing', 'post'] };

      sut.publish(postunodir, upopts, function () {
        if (err) { console.trace(); throw err; }
        readJsons()

        t.equal(postunojson.name     ,  'postuno'   ,  'keeps name for post uno')
        t.equal(postunojson.title    ,  upopts.title  ,  'updates post uno with new title')
        t.equal(postunojson.created.toString(), firstNow.toString(), 'keeps created date for post uno')
        t.equal(postunojson.updated.toString(), now.toString(), 'updates updated date for post uno')
        t.deepEqual(postunojson.tags , upopts.tags, 'publishes tags for post uno')
        t.deepEqual(blogjson.posts   , ['postuno'], 'blog has postuno')

        t.end()
      })
    })
    t.end()
  })
})

test('when I publish bloguno given title and tags uno, dos and tres', function (t) {
  t.plan(1)

  setup()

  var opts = {
      title: 'title for postuno'
    , tags: [ 'tag-uno', 'tag-dos', 'tag-tres' ]
    }

  now = new Date(2012, 0, 1);

  sut.publish(postunodir, opts, function (err) {
    if (err) { console.trace(); throw err; }

    t.test('# and I publish the same post again but omit title and tags', function (t) {
      var upopts;

      firstNow = now; 
      now = new Date(2012, 0, 2);
      upopts = { title: undefined, tags: undefined };

      sut.publish(postunodir, upopts, function () {
        if (err) { console.trace(); throw err; }
        readJsons()

        t.equal(postunojson.name     ,  'postuno'   ,  'keeps name for post uno')
        t.equal(postunojson.title    ,  opts.title  ,  'keeps original title')
        t.equal(postunojson.created.toString(), firstNow.toString(), 'keeps created date for post uno')
        t.equal(postunojson.updated.toString(), now.toString(), 'updates updated date for post uno')
        t.deepEqual(postunojson.tags , opts.tags, 'keeps original tags for post uno')
        t.deepEqual(blogjson.posts   , ['postuno'], 'blog has postuno')

        t.end()
      })
    })
    t.end()
  })
})
