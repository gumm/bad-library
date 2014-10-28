/**
 * @fileoverview Cryptograph helpers
 */
goog.provide('bad.Crypto');

goog.require('bad.utils');
goog.require('bad.AesCmac');
goog.require('goog.crypt');
goog.require('goog.crypt.Aes');
goog.require('goog.crypt.Cbc');


/**
 * @param profile_id
 * @returns {*}
 */
bad.Crypto.getProfileKey = function(profile_id) {
  var MK = 'C0DEC0DEC0DEC0DEC0DEC0DEC0DEC0DE';
  var masterKey = goog.crypt.hexToByteArray(MK);
  var aes = new goog.crypt.Aes(masterKey);
  var pidByteArray = goog.crypt.stringToUtf8ByteArray(profile_id);
  return aes.encrypt(pidByteArray);
};

bad.Crypto.getPassword = function(profile, user) {
  // We will use this shortly
  var sha1 = new goog.crypt.Sha1();

  // Get the profile key.
  var username = profile + user;
  var profileKeyByteArray = bad.Crypto.getProfileKey(profile);

  // Compute the password.
  var unameByteArray = goog.crypt.stringToUtf8ByteArray(username);
  var pw = bad.AesCmac.aesCmac(
    new Buffer(profileKeyByteArray, 'hex'),
    new Buffer(unameByteArray, 'hex')
  );

  // Salt the password.
  var salt = bad.utils.getTimeNow().toString(16);
  var pwBlock = new Buffer(salt + pw.toString('hex'), 'hex');

  // SHA1 the salted password and the salt
  sha1.update(pwBlock);
  var s1 = salt + goog.crypt.byteArrayToHex(sha1.digest());

  // Return the base64 encoded SHA1 digest.
  return goog.crypt.base64.encodeByteArray(goog.crypt.hexToByteArray(s1));
};


bad.Crypto.aes128 = function(key, message) {
  var aes = new goog.crypt.Aes(key);
  var result = aes.encrypt(message);
  return new Buffer(result, 'hex');
};

bad.Crypto.bitShiftLeft = function (buffer) {
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

bad.Crypto.xor = function (bufferA, bufferB) {
  var length = Math.min(bufferA.length, bufferB.length);
  var output = new Buffer(length);
  for (var index = 0; index < length; index++) {
    output[index] = bufferA[index] ^ bufferB[index];
  }
  return output;
};

bad.Crypto.toBinaryString = function (buffer) {
  var bitmasks = [0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01];
  var binary = '';
  for (var bufferIndex = 0; bufferIndex < buffer.length; bufferIndex++) {
    for (var bitmaskIndex = 0; bitmaskIndex < bitmasks.length; bitmaskIndex++) {
      binary += (buffer[bufferIndex] & bitmasks[bitmaskIndex]) ? '1' : '0';
    }
  }
  return binary;
};