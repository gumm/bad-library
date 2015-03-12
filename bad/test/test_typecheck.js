
require('../../../closure-library/closure/goog/bootstrap/nodejs');
require('../../../../../../deps.js');
goog.require('bad.typeCheck');
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

describe('Library of type check utilities', function() {

  it('can parse truethy things', function() {
    var trueNess = [1, 2, 3, 'true', true, 'True'];
    trueNess.forEach(function(val) {
      assertTrue('This is true', bad.typeCheck.parseBool(val));
    });
  });

  it('can parse falsey things', function() {
    var falseNess = [0, -1, -2, -3, '', false, 'string', null, NaN, undefined];
    falseNess.forEach(function(val) {
      assertFalse('This is false', bad.typeCheck.parseBool(val));
    });
  });

  it('can check for arrays', function() {
    assertTrue(bad.typeCheck.isArray([1, 2]));
    assertTrue(bad.typeCheck.isArray([]));
    assertTrue(bad.typeCheck.isArray(new Array()));
    assertFalse(bad.typeCheck.isArray());
    assertFalse(bad.typeCheck.isArray(undefined));
    assertFalse(bad.typeCheck.isArray(null));
    assertFalse(bad.typeCheck.isArray('string'));
    assertFalse(bad.typeCheck.isArray(123));
    assertFalse(bad.typeCheck.isArray({k: 'v'}));
  });

  it('can check that arrays are not empty', function() {
    assertTrue(bad.typeCheck.isNotEmptyArr([1]));
    assertFalse(bad.typeCheck.isNotEmptyArr([]));
  });

  it('can check if arrays are empty', function() {
    assertTrue(bad.typeCheck.isEmptyArr([]));
    assertFalse(bad.typeCheck.isEmptyArr([1]));
  });

  it('can check that an array length is inside a range', function() {
    assertTrue(bad.typeCheck.arrLengthBetween([], 0, 1));
    assertTrue(bad.typeCheck.arrLengthBetween(['a'], 0, 1));
    assertFalse(bad.typeCheck.arrLengthBetween(['a', 'b'], 0, 1));
  });

  it('can check if something is a string', function() {
    var validStrings = ['', '1', 'string'];
    var notStrings = [1, -1, 1.2, -1.2, 0, +0, -0, Infinity, -Infinity, NaN,
      Number.MAX_VALUE, Number.MIN_VALUE, undefined, [], ['a'], {}, {k: 'v'}
    ];
    validStrings.forEach(function(val) {
      assertTrue('This is a string: ' + val, bad.typeCheck.isString(val));
    });
    notStrings.forEach(function(val) {
      assertFalse('This is not a string: ' + val, bad.typeCheck.isString(val));
    });
  });

  it('can check if something is a number', function() {
    var validNumbers = [1, -1, 1.2, -1.2, 0, +0, -0, Infinity, -Infinity, NaN,
                        Number.MAX_VALUE, Number.MIN_VALUE];
    var notNumbers = ['1', '0', [1], {}, undefined, null, true, false];
    validNumbers.forEach(function(val) {
      assertTrue('This is a number: ' + val, bad.typeCheck.isNumber(val));
    });
    notNumbers.forEach(function(val) {
      assertFalse('This is not a number: ' + val, bad.typeCheck.isNumber(val));
    });
  });

  it('can check if something is a int', function() {
    var validInts = [1, 234, 0, +0, -0];
    var notInts = [-1, -2, 1.3, 0.1, '1', '0', [1], {}, undefined, null, true,
      false, NaN, -Infinity, Infinity, Number.MIN_VALUE, Number.MAX_VALUE];
    validInts.forEach(function(val) {
      assertTrue('This is an int: ' + val, bad.typeCheck.isInt(val));
    });
    notInts.forEach(function(val) {
      assertFalse('This is not an int: ' + val, bad.typeCheck.isInt(val));
    });
  });

  it('can check if something is a signed int', function() {
    var validSignedInts = [1, 234, 0, +0, -0, -1, -234];
    var notSignedInts = [-1.3, -0.1, 1.3, 0.1, '1', '0', [1], {}, undefined,
      null, true, false, NaN, -Infinity, Infinity, Number.MIN_VALUE,
      Number.MAX_VALUE];
    validSignedInts.forEach(function(val) {
      assertTrue('This is a signed int: ' + val,
        bad.typeCheck.isSignedInt(val));
    });
    notSignedInts.forEach(function(val) {
      assertFalse('This is not a signed int: ' + val,
        bad.typeCheck.isSignedInt(val));
    });
  });

  it('can check if something is an object', function() {
    var validObjects = [{}, {k: 'v'}, new Object(), new Date()];
    var notObjects = ['', '1', 'string', 1, -1, 1.2, -1.2, 0, +0, -0,
      Infinity, -Infinity, NaN, Number.MAX_VALUE, Number.MIN_VALUE,
      undefined, [], ['a']];
    validObjects.forEach(function(val) {
      assertTrue(bad.typeCheck.isObject(val));
    });
    notObjects.forEach(function(val) {
      assertFalse(bad.typeCheck.isObject(val));
    });
  });

  it('can check if something is a date', function() {
    var validDates = [new Date()];
    var notDates = ['', '1', 'string', 1, -1, 1.2, -1.2, 0, +0, -0,
      Infinity, -Infinity, NaN, Number.MAX_VALUE, Number.MIN_VALUE,
      undefined, [], ['a'], {}, {k: 'v'}, new Object()];
    validDates.forEach(function(val) {
      assertTrue('This is a date: ' + val, bad.typeCheck.isDate(val));
    });
    notDates.forEach(function(val) {
      assertFalse('This is not a date: ' + val, bad.typeCheck.isDate(val));
    });
  });

  it('can check if something is NaN', function() {
    var validNaN = [NaN, 42 / 'General Zod', parseInt('Doomsday', 10)];
    var notNaN = ['', '1', 'string', 1, -1, 1.2, -1.2, 0, +0, -0,
      Infinity, -Infinity, Number.MAX_VALUE, Number.MIN_VALUE,
      undefined, [], ['a'], {}, {k: 'v'}, new Object(), new Date()];
    validNaN.forEach(function(val) {
      assertTrue('This is NaN: ' + val, bad.typeCheck.isNaN(val));
    });
    notNaN.forEach(function(val) {
      assertFalse('This is not NaN: ' + val, bad.typeCheck.isNaN(val));
    });
  });

});
