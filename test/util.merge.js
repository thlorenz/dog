/*jshint asi:true, esnext:true */

var utl = require('../lib/utl.js')
  , test = require('tap').test
  ;

var def = { name: 'def name', age: 'def age', defined: 'in def', _null: 'in def' }
  , cus = { age: 'cus age', nationality: 'cus nationality', defined: undefined, _null: null }
  , merged
  ;

test('merge custom into default overwrites default properties with non-null properties in custom', function (t) {
  t.plan(4)

  merged = utl.merge(def, cus)

  t.equal(merged.name    ,  def.name)
  t.equal(merged.age     ,  cus.age)
  t.equal(merged.defined ,  def.defined)
  t.equal(merged._null   ,  def._null)

  t.end()
})

test('merge custom into default leaves default and custom unchanged', function (t) {
  t.plan(2)

  var origdef = { name: 'def name', age: 'def age', defined: 'in def', _null: 'in def' }
    , origcus = { age: 'cus age', nationality: 'cus nationality', defined: undefined, _null: null }
    ;

  t.deepEqual(def, origdef)
  t.deepEqual(cus, origcus)

  t.end()
})

test('merge custom into default and accepting undefined overrides null and undefined properties', function (t) {
  t.plan(2)  

  merged = utl.merge(def, cus, true)

  t.equal(merged.defined, undefined)
  t.equal(merged._null, null)
  
  t.end()
})
