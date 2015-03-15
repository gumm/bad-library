require('../../../closure-library/closure/goog/bootstrap/nodejs');
require('../deps.js');

goog.require('bad.math.bit');
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

describe('Bit hacking utils', function() {

  it('can convert a number to a string of zeros and ones', function() {
    assertEquals(bad.math.bit.convertNumberToBinaryString(0), '0');
    assertEquals(bad.math.bit.convertNumberToBinaryString(1), '1');
    assertEquals(bad.math.bit.convertNumberToBinaryString(2), '10');
    assertEquals(bad.math.bit.convertNumberToBinaryString(5), '101');
    assertEquals(bad.math.bit.convertNumberToBinaryString(101), '1100101');
  });

  it('can convert a string of zeros and ones to an int', function() {
    assertEquals(bad.math.bit.convertBinaryStringToNumber('0'), 0);
    assertEquals(bad.math.bit.convertBinaryStringToNumber('1'), 1);
    assertEquals(bad.math.bit.convertBinaryStringToNumber('10'), 2);
    assertEquals(bad.math.bit.convertBinaryStringToNumber('101'), 5);
    assertEquals(bad.math.bit.convertBinaryStringToNumber('1100101'), 101);
  });

  it('can get the bit at the position n of the number b', function() {
    var b = 8;  // 1000
    assertEquals(bad.math.bit.getBitAt(b, 2), 0);
    assertEquals(bad.math.bit.getBitAt(b, 6), 0);
    assertEquals(bad.math.bit.getBitAt(b, 3), 1);
  });

  it('can set the bit at the position n of the number b', function() {
    var b = 10;  // 1010
    assertEquals(bad.math.bit.setBitAt(b, 2), 14);  // 1110
    assertEquals(bad.math.bit.setBitAt(b, 0), 11);  // 1011
  });

  it('can unset the bit at the position n of the number b', function() {
    var b = 10;  // 1010
    assertEquals(bad.math.bit.clearBitAt(b, 1), 8);  // 1000
    assertEquals(bad.math.bit.clearBitAt(b, 3), 2);  // 10
  });

  it('can flip the bit at the position n of the number b.', function() {
    var b = 10;  // 1010
    assertEquals(bad.math.bit.invBitAt(b, 0), 11);  // 1011
    assertEquals(bad.math.bit.invBitAt(b, 1), 8);   // 1000
    assertEquals(bad.math.bit.invBitAt(b, 2), 14);  // 1110
    assertEquals(bad.math.bit.invBitAt(b, 3), 2);   // 0010
  });

  it('can tell if the bit at a given position is a 1', function() {
    var b = 10;  // 1010
    assertFalse(bad.math.bit.hasBitAt(b, 0));
    assertTrue(bad.math.bit.hasBitAt(b, 1));
    assertFalse(bad.math.bit.hasBitAt(b, 2));
    assertTrue(bad.math.bit.hasBitAt(b, 3));
  });

  it('can do some shit with array buffers', function() {});

});
