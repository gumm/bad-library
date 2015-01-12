/**
 * @fileoverview Cryptograph helpers
 */
goog.provide('bad.CryptUtils');

goog.require('goog.crypt.Aes');


bad.CryptUtils.aes128 = function(key, message) {
  var aes = new goog.crypt.Aes(key);
  var result = aes.encrypt(message);
  return new Buffer(result, 'hex');
};

bad.CryptUtils.bitShiftLeft = function(buffer) {
  var shifted = new Buffer(buffer.length);
  var last = buffer.length - 1;
  for (var index = 0; index < last; index++) {
    shifted[index] = buffer[index] << 1;
    if (buffer[index + 1] & 0x80) {
      shifted[index] += 0x01;
    }
  }
  shifted[last] = buffer[last] << 1;
  return shifted;
};

bad.CryptUtils.xor = function(bufferA, bufferB) {
  var length = Math.min(bufferA.length, bufferB.length);
  var output = new Buffer(length);
  for (var index = 0; index < length; index++) {
    output[index] = bufferA[index] ^ bufferB[index];
  }
  return output;
};

bad.CryptUtils.toBinaryString = function(buffer) {
  var bitmasks = [0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01];
  var binary = '';
  for (var bufferIndex = 0; bufferIndex < buffer.length; bufferIndex++) {
    for (var bitmaskIndex = 0; bitmaskIndex < bitmasks.length; bitmaskIndex++) {
      binary += (buffer[bufferIndex] & bitmasks[bitmaskIndex]) ? '1' : '0';
    }
  }
  return binary;
};

/**
 * Take a 4bit number and convert it to the little endian hex string.
 * This looks ugly but it works and it is fast.
 * @param {number} num
 * @return {string}
 */
bad.CryptUtils.toLittleEndianHex = function(num) {
  var result = ('0' + (num & 255).toString(16)).substr(-2);
  result = result + ('0' + (((num >> 8)) & 255).toString(16)).substr(-2);
  result = result + ('0' + (((num >> 16)) & 255).toString(16)).substr(-2);
  result = result + ('0' + (((num >> 24)) & 255).toString(16)).substr(-2);
  return result;
};
