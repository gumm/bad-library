goog.provide('bad.AesCmac');
goog.require('bad.Crypto');

/**
 * A constant block size.
 * @type {number}
 */
bad.AesCmac.BLOCK_SIZE = 16;

bad.AesCmac.generateSubkeys = function (key) {
  var const_Zero = new Buffer('00000000000000000000000000000000', 'hex');
  var const_Rb = new Buffer('00000000000000000000000000000087', 'hex');

  var l = bad.Crypto.aes128(key, const_Zero);

  var subkey1 = bad.Crypto.bitShiftLeft(l);
  if (l[0] & 0x80) {
    subkey1 = bad.Crypto.xor(subkey1, const_Rb);
  }

  var subkey2 = bad.Crypto.bitShiftLeft(subkey1);
  if (subkey1[0] & 0x80) {
    subkey2 = bad.Crypto.xor(subkey2, const_Rb);
  }

  return {
    subkey1: subkey1,
    subkey2: subkey2
  };
};

bad.AesCmac.aesCmac = function (key, message) {
  var subkeys = bad.AesCmac.generateSubkeys(key);
  var blockCount = Math.ceil(message.length / bad.AesCmac.BLOCK_SIZE);
  var lastBlockCompleteFlag, lastBlock, lastBlockIndex;

  if (blockCount === 0) {
    blockCount = 1;
    lastBlockCompleteFlag = false
  } else {
    lastBlockCompleteFlag = (message.length % bad.AesCmac.BLOCK_SIZE === 0);
  }
  lastBlockIndex = blockCount -1;

  if (lastBlockCompleteFlag) {
    lastBlock = bad.Crypto.xor(bad.AesCmac.getMessageBlock(message, lastBlockIndex), subkeys.subkey1);
  } else {
    lastBlock = bad.Crypto.xor(bad.AesCmac.getPaddedMessageBlock(message, lastBlockIndex), subkeys.subkey2);
  }

  var x = new Buffer('00000000000000000000000000000000', 'hex');
  var y;

  for (var index = 0; index < lastBlockIndex; index++) {
    y = bad.Crypto.xor(x, bad.AesCmac.getMessageBlock(message, index));
    x = bad.Crypto.aes128(key, y);
  }
  y = bad.Crypto.xor(lastBlock, x);
  return bad.Crypto.aes128(key, y);
};

bad.AesCmac.getMessageBlock = function(message, blockIndex) {
  var block = new Buffer(bad.AesCmac.BLOCK_SIZE);
  var start = blockIndex * bad.AesCmac.BLOCK_SIZE;
  var end = start + bad.AesCmac.BLOCK_SIZE;

  message.copy(block, 0, start, end);

  return block;
};

bad.AesCmac.getPaddedMessageBlock = function(message, blockIndex) {
  var block = new Buffer(bad.AesCmac.BLOCK_SIZE);
  var start = blockIndex * bad.AesCmac.BLOCK_SIZE;
  var end = message.length;

  block.fill(0);
  message.copy(block, 0, start, end);
  block[end - start] = 0x80;

  return block;
};
