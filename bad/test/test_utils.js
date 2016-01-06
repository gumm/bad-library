require('../../node_modules/google-closure-library/closure/goog/bootstrap/nodejs');
require('../deps.js');

goog.require('bad.utils');
goog.require('goog.testing.asserts');

/*
 assertTrue([comment,] value)
 assertFalse([comment,] value)
 assertEquals([comment,] expectedValue, observedValue)
 assertNotEquals([comment,] expectedValue, observedValue)
 assertNull([comment,] value)
 assertNotNull([comment,] value)
 assertUndefined([comment,] value)
 assertNotUndefined([comment,] value)
 assertArrayEquals([comment,] expectedValue, observedValue)
 assertSameElements([comment,] expectedValue, observedValue)
 */

describe('Library Utils', function() {

  it('has a private counter that returns an incremented value on each call',
    function() {
      var counter = bad.utils.privateCounter();
      assertEquals('Counter inits to 1', 1, counter());
      var numTimesToCall = 9999999;
      for (var i = 0; i < numTimesToCall; i++) {
        counter();
      }
      assertEquals('Counter should stands at:',
        1 + numTimesToCall + 1,
        counter()
      );
    });

  it('has a private random ID generator', function() {
    var numTimesToCall = 9999;
    for (var i = 0; i < numTimesToCall; i++) {
      assertNotEquals('Private randoms should never be the same:',
        bad.utils.privateRandom(), bad.utils.privateRandom());
    }
  });

  it('can convert strings to a byte array', function() {
    var deadbeef = [100, 101, 97, 100, 98, 101, 101, 102];
    assertArrayEquals(bad.utils.stringToBytes('deadbeef'), deadbeef);
  });

  it('can has a method to get now in seconds', function() {
    assertEquals(bad.utils.getNowSeconds(), Math.floor(Date.now() / 1000));
  });

  it('can make random IDs', function() {
    var numTimesToCall = 99999;
    var testMap = {};
    for (var i = 0; i < numTimesToCall; i++) {
      var id = bad.utils.makeId();
      assertUndefined(testMap[id]);
      testMap[id] = true;
    }
  });

  it('can limit the random ID length', function() {
    var lengths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    lengths.forEach(function(e) {
      var id = bad.utils.makeId(e);
      assertEquals(e, id.length);
    });
  });

  it('random ID lengths are limited to 11 or 12 digits', function() {
    var id = bad.utils.makeId(20);
    assertTrue(11 <= id.length <= 12);
  });

});
