goog.provide('bad.typeCheck');

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

/**
 * True if the given value is an array regardless if it is populated.
 * The rest false.
 * @param {*} a The value to check
 * @return {boolean}
 */
bad.typeCheck.isArray = function(a) {
  return goog.typeOf(a) === 'array';
};

/**
 * True if the given value is an array with at least one element.
 * The rest false.
 * @param {*} a The value to check
 * @return {boolean}
 */
bad.typeCheck.isEmptyArr = function(a) {
  return !goog.isDef(a[0]);
};
bad.typeCheck.isNotEmptyArr = function(a) {
  return !bad.typeCheck.isEmptyArr(a);
};

/**
 * True if the given value is an empty array.
 * The rest false.
 * @param {*} a The value to check
 * @return {boolean}
 */
bad.typeCheck.isEmptyArr = function(a) {
  return !goog.isDef(a[0]);
};

/**
 * True if the given value is an array and its length is between the given
 * values (inclusive)
 * The rest false.
 * @param {*} a The value to check
 * @return {boolean}
 */
bad.typeCheck.isString = function(a) {
  return goog.typeOf(a) === 'string';
};
bad.typeCheck.arrLengthBetween = function(a, min, max) {
  return a.length >= min && a.length <= max;
};

/**
 * Only valid strings return true;
 * The rest false.
 * @param {*} a The value to check
 * @return {boolean}
 */
bad.typeCheck.isString = function(a) {
  return goog.typeOf(a) === 'string';
};

/**
 * Anything that is a valid JS number returns true. This includes stuff like
 * NaN (which is a number) and Infinity, Number.MAX_VALUE and Number.MIN_VALUE.
 * The rest false.
 * @param {*} a The value to check
 * @return {boolean}
 */
bad.typeCheck.isNumber = function(a) {
  return goog.typeOf(a) === 'number';
};

/**
 * Only numbers that can reliably be passed to JSON as a number, and that
 * are not floats will and that does not carry a sign returns true.
 * The rest false.
 * @param {*} a The value to check
 * @return {boolean}
 */
bad.typeCheck.isInt = function(a) {
  var aS = goog.isDefAndNotNull(a) ? a.toString() : '.';
  var valid = '0123456789'.split('');
  var eachCheck = 0;
  aS.split('').forEach(function(n) {
    eachCheck += valid.indexOf(n) >= 0 ? 0 : 1;
  });
  return goog.typeOf(a) === 'number' && a >= 0 && !eachCheck;
};

/**
 * Only numbers that can reliably be passed to JSON as a number, and that
 * are not floats will return true. The rest false.
 * @param {*} a The value to check
 * @return {boolean}
 */
bad.typeCheck.isSignedInt = function(a) {
  var aS = goog.isDefAndNotNull(a) ? a.toString() : '.';
  var valid = '+-0123456789'.split('');
  var eachCheck = 0;
  aS.split('').forEach(function(n) {
    eachCheck += valid.indexOf(n) >= 0 ? 0 : 1;
  });
  return goog.typeOf(a) === 'number' && !eachCheck;
};

/**
 * Given an object structure this returns true. Arrays, even though technically
 * an object, return false.
 * @param {*} a The value to check
 * @return {boolean}
 */
bad.typeCheck.isObject = function(a) {
  return goog.typeOf(a) === 'object';
};

/**
 * Given a date this returns true.
 * @param {*} a The value to check
 * @return {boolean}
 */
bad.typeCheck.isDate = function(a) {
  return Object.prototype.toString.call(a) === '[object Date]';
};

/**
 * This is a hack to test against NaNs. isNaN has some unexpected
 * behavior, such like: isNaN(' ') evaluates to false.
 * But one reliable effect is that NaN != NaN always evaluates to
 * true. So if (x != x) is true, then x is reliably NaN. I know, this
 * is not nice. But until ECMAScript (ES6) delivers the Number.isNaN(),
 * this is the workaround. Sorry.
 * @param {*} a The value to evaluate
 * @return {boolean}
 */
bad.typeCheck.isNaN = function(a) {
  return a != a;
};
