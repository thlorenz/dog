/*jshint asi:true, esnext:true */

var utl = require('../lib/utl.js');

describe('when merging default with custom', function () {
  var def = { name: 'def name', age: 'def age' }
    , cus = { age: 'cus age', nationality: 'cus nationality' }
    , merged
    ;

  before(function () {
    merged = utl.merge(def, cus); 
  })

  it('maintains property only present in default', function () {
    merged.name.should.eql(def.name);  
  })

  it('overrides property present in default with the one also present in custom', function () {
    merged.age.should.eql(cus.age);
  })

  it('adds property only present in custom', function () {
    merged.nationality.should.eql(cus.nationality);
  })
  
  it('leaves default unchanged', function () {
    Object.keys(def).length.should.eql(2);
    def.name.should.eql('def name');
    def.age.should.eql('def age');
  })

  it('leaves custom unchanged', function () {
    Object.keys(cus).length.should.eql(2);
    cus.age.should.eql('cus age');
    cus.nationality.should.eql('cus nationality');
  })
})
