/*jshint asi:true, esnext:true */

var utl = require('../lib/utl.js')
  , test = require('tap').test
  ;

test('innermostDir returns the inner most sub directory of absolute and relative paths', function (t) {

  function check(inp, res) {
    var msg = 'innermostDir("' + inp + '") === "' + res + '"';
    t.equal(res, utl.innermostDir(inp), msg)
  }

  t.plan(5)

  check(''         ,  '')
  check('abc'      ,  'abc')
  check('abc/'     ,  'abc')
  check('/1/2/3'   ,  '3')
  check('1/2/3.33' ,  '3.33')

  t.end()
})

