/*jshint asi:true, esnext:true */

var utl = require('../lib/utl.js')
  , should = require('should')
  ;

describe('merge', function () {
  var def = { name: 'def name', age: 'def age', defined: 'in def', notnull: 'in def' }
    , cus = { age: 'cus age', nationality: 'cus nationality', defined: undefined, notnull: null }
    , merged
    ;

  describe('when merging default with custom', function () {

    before(function () {
      merged = utl.merge(def, cus); 
    })

    it('maintains property only present in default', function () {
      merged.name.should.eql(def.name);  
    })

    it('overrides property present in default with the one also present in custom', function () { merged.age.should.eql(cus.age);
    })

    it('doesn\'t override property present in default with the same also present in custom but undefined', function () {
      merged.defined.should.equal(def.defined);  
    })

    it('doesn\'t override property present in default with the same also present in custom but null', function () {
      merged.notnull.should.equal(def.notnull);  
    })

    it('adds property only present in custom', function () {
      merged.nationality.should.eql(cus.nationality);
    })
    
    it('leaves default unchanged', function () {
      Object.keys(def).length.should.eql(4);
      def.name.should.eql('def name');
      def.age.should.eql('def age');
    })

    it('leaves custom unchanged', function () {
      Object.keys(cus).length.should.eql(4);
      cus.age.should.eql('cus age');
      cus.nationality.should.eql('cus nationality');
    })

  })

  describe('when merging default with custom and accepting undefined', function () {
    before(function () {
      merged = utl.merge(def, cus, true); 
    })

    it('doesn\'t override property present in default with the same also present in custom but undefined', function () {
      should.not.exist(merged.defined);
    })

    it('doesn\'t override property present in default with the same also present in custom but null', function () {
      should.not.exist(merged.notnull);
    })
  })
})

describe('innermostDir', function () {
  it('of "" is ""', function () {
    utl.innermostDir('').should.eql('');  
  })

  it('of "/1/2/3" is 3', function () {
    utl.innermostDir('/1/2/3').should.eql('3');  
  })
  
  it('of "1/2/3.33" is 3', function () {
    utl.innermostDir('1/2/3.33').should.eql('3.33');  
  })
})
