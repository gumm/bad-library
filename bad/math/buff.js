goog.module('bad.math.buff');

const buff = {};

/**
 * Given an Uint8Array view into a buffer, flip the bit at the given bit number.
 * @param {Uint8Array} buff
 * @param {number} bitNum
 */
buff.invBitAt8 = function(buff, bitNum) {
  buff[Math.floor(bitNum / 8)] ^= 1 << (bitNum % 8);
};

exports = buff;
