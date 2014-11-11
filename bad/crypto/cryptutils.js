/**
 * @fileoverview Cryptograph helpers
 */
goog.provide('bad.CryptUtils');


bad.CryptUtils.aes128 = function(key, message) {
  var aes = new goog.crypt.Aes(key);
  var result = aes.encrypt(message);
  return new Buffer(result, 'hex');
};

bad.CryptUtils.bitShiftLeft = function (buffer) {
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

bad.CryptUtils.xor = function (bufferA, bufferB) {
  var length = Math.min(bufferA.length, bufferB.length);
  var output = new Buffer(length);
  for (var index = 0; index < length; index++) {
    output[index] = bufferA[index] ^ bufferB[index];
  }
  return output;
};

bad.CryptUtils.toBinaryString = function (buffer) {
  var bitmasks = [0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01];
  var binary = '';
  for (var bufferIndex = 0; bufferIndex < buffer.length; bufferIndex++) {
    for (var bitmaskIndex = 0; bitmaskIndex < bitmasks.length; bitmaskIndex++) {
      binary += (buffer[bufferIndex] & bitmasks[bitmaskIndex]) ? '1' : '0';
    }
  }
  return binary;
};

bad.CryptUtils.toLittleEndianHex = function (num) {
  console.log('Number:', num);
  var result = (num & 255).toString(16);
  console.log('R1:', result);
  result = result + (((num >> 8)) % 255).toString(16);
  console.log('R2:', result);
  result = result + (((num >> 16)) % 255).toString(16);
  console.log('R3:', result);
  result = result + (((num >> 24)) % 255).toString(16);
  console.log('Final:', result);
  return result;
};