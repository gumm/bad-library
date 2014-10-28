/**
 * @fileoverview Cryptograph helpers
 */
goog.provide('bad.Crypto');

goog.require('bad.utils');
goog.require('goog.crypt');
goog.require('goog.crypt.Aes');
goog.require('goog.crypt.Cbc');

/**
 * @param profile_id
 * @returns {*}
 */
bad.Crypto.getProfileKey = function(profile_id) {
  var MK = 'C0DEC0DEC0DEC0DEC0DEC0DEC0DEC0DE'; //Master Key. Given. **secret**SUPER SECRET**secret**: Potentially collect this from remote host
  var masterKey = goog.crypt.hexToByteArray(MK);
  var aes = new goog.crypt.Aes(masterKey);
  var pidByteArray = goog.crypt.stringToUtf8ByteArray(profile_id);
  return aes.encrypt(pidByteArray);
};

bad.Crypto.getPassword = function(aesCmac, profile, user) {
  // We will use this shortly
  var sha1 = new goog.crypt.Sha1();

  // Get the profile key.
  var username = profile + user;
  var profileKeyByteArray = bad.Crypto.getProfileKey(profile);

  // Compute the password.
  var unameByteArray = goog.crypt.stringToUtf8ByteArray(username);
  var pw = aesCmac.aesCmac(
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