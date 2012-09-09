/*jshint asi:true, esnext:true */

var utl = require('../lib/utl.js')
  , test = require('tap').test
  ;

test('matching array of items against a string returns all items that start with that string', function (t) {
  function check(arr, str, res) {
    var msg = 'findMatches([' + arr + '], "' + str +'") === [' + res + ']';
    t.deepEqual(res, utl.findMatches(arr, str), msg)
  }

  t.throws(function () { utl.findMatches(['sub'], '') }, 'throws on empty string')
  t.throws(function () { utl.findMatches(['sub'], null) }, 'throws on null string')
  check([], 'sub', [])
  check([ 'sub' ], 'sub', [ 'sub' ])
  check([ ' sub' ], 'sub', [ 'sub' ])
  check([ 'substitute' ], 'sub', [ 'substitute' ])
  check([ 'substitute', '_substitute' ], 'sub', [ 'substitute' ])
  check([ 'substitute', 'subfolder', 'other' ], 'sub', [ 'substitute', 'subfolder' ])

  t.end()
})
