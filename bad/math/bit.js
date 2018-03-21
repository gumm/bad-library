/**
 * http://graphics.stanford.edu/~seander/bithacks.html
 */
goog.module('bad.math.bit');

const bit = {};

/**
 * Convert a decimal number to a binary string.
 * @param {!number} n
 * @return {string} A string representing a binary ie. "1011".
 */
bit.convertNumberToBinaryString = function(n) {
  return n.toString(2);
};

/**
 * Convert a binary string to a decimal number.
 * @param {!string} s A string representing a binary ie. "1011".
 * @return {number}
 */
bit.convertBinaryStringToNumber = function(s) {
  return parseInt(s, 2);
};

/**
 * Get the bit at the position n of the number b.
 * Bit count starts at 0.
 *
 * Example:
 * var b = 8;  // 1000
 * alert(getBit(b,2));  // 0
 * alert(getBit(b,6));  // 0
 * alert(getBit(b,3));  // 1
 *
 * To print the result: result.toString(2)
 *
 * @param {!number} b
 * @param {!number} n
 * @return {number}
 */
bit.getBitAt = function(b, n) {
  return ((b >> n) & 1);
};

/**
 * Set the bit at the position n of the number b. The bit is set to 1.
 * Bit count starts at 0.
 *
 * Example:
 * var b = 10;  // 1010
 * c = setBit(b,2));  // 14 // 1110
 * d = setBit(b,0));  // 11 // 1011
 *
 * @param {!number} b
 * @param {!number} n
 * @return {number}
 */
bit.setBitAt = function(b, n) {
  return b | (1 << n);
};

/**
 * Remove the bit at the position n of the number b. The bit is set to 0.
 * Bit count starts at 0.
 * @param {!number} b
 * @param {!number} n
 * @return {number}
 */
bit.clearBitAt = function(b, n) {
  return b & ~(1 << n);
};

/**
 * Invert the bit at the position n of the number b.
 * Bit count starts at 0.
 * @param {!number} b
 * @param {!number} n
 * @return {number}
 */
bit.invBitAt = function(b, n) {
  return b ^ (1 << n);
};

/**
 * Return true if the bit at the given position is 1.
 * Bit count starts at 0.
 * @param {!number} b
 * @param {!number} n
 * @return {boolean}
 */
bit.hasBitAt = function(b, n) {
  return bit.getBitAt(b, n) === 1;
};

exports = bit;