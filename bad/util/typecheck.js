goog.provide('bad.typeCheck');

goog.require('goog.string');

/**
 * Parses a value and converts it to a boolean. This considers all positive
 * numbers, as well as the strings 'true' and 'True' and 'TRUE' as true.
 * Everything else is considered false. NaN, Undefined, null, all false.
 *
 * @param {(string|number|boolean|Boolean)=} value The value to parse.
 * @return {boolean} A boolean value.
 */
bad.typeCheck.parseBool = function(value) {
  var bool = false;
  if (parseFloat(value) > 0 || (/^(true)/i).test(value)) {
      bool = true;
  }
  return bool;
};

bad.typeCheck.isArray = function(a) {
    return goog.typeOf(a) === 'array';
};

bad.typeCheck.isNotEmptyArr = function(a) {
    return !bad.typeCheck.isEmptyArr(a);
};

bad.typeCheck.isEmptyArr = function(a) {
    return !goog.isDef(a[0]);
};

bad.typeCheck.arrLengthBetween = function(a, min, max) {
  return a.length >= min && a.length <= max;
};

bad.typeCheck.isString = function(a) {
  return goog.typeOf(a) === 'string';
};

bad.typeCheck.isNumber = function(a) {
  return goog.typeOf(a) === 'number';
};

bad.typeCheck.isInt = function(a) {
    var aS = a.toString();
    return goog.typeOf(a) === 'number' &&
      a >= 0 &&
      !goog.string.contains(aS, '.');
};

bad.typeCheck.isSignedInt = function(a) {
    var aS = a.toString();
    return goog.typeOf(a) === 'number' &&
      !goog.string.contains(aS, '.');
};

bad.typeCheck.isObject = function(a) {
    return goog.typeOf(a) === 'object';
};

bad.typeCheck.isDate = function(a) {
    return Object.prototype.toString.call(a) === '[object Date]';
};