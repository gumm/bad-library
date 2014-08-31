/**
 * @fileoverview An implementation of a basic parser for Trinity MQTT type
 *  payloads
 */
goog.provide('bad.MqttParse');
goog.provide('bad.MqttParse.replyCode');

goog.require('bad.typeCheck');
goog.require('goog.array');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.object');
goog.require('goog.string');

/**
 * Constructor of a basic Trinity MQTT payload parser.
 * @extends {goog.events.EventTarget}
 * @constructor
 */
bad.MqttParse = function() {
  goog.events.EventTarget.call(this);
};
goog.inherits(bad.MqttParse, goog.events.EventTarget);

/**
 * Enum for reply codes.
 * Code 0 is for outright success.
 * All codes above 0 are for partial success conditions.
 * All codes below 0 are for outright failures.
 * @enum {number}
 */
bad.MqttParse.replyCode = {

  /**
   * Could only parse some of the given data.
   */
  BAD_TIMESTAMP: 1,

  /**
   * Command or event received and parsed.
   */
  ALL_OK: 0,

  /**
   * Raised when the given payload is the empty array
   */
  PAYLOAD_EMPTY: -1,

  /**
   *  The given payload is not an array.
   */
  PAYLOAD_NOT_ARRAY: -2,

  /**
   *  The given payload does not contain at least 2 elements.
   */
  PAYLOAD_TOO_SHORT: -3,

  /**
   *  The given payload does contains more than 3 or 4(for x types) elements.
   */
  PAYLOAD_TOO_LONG: -4,

  /**
   * The message is not of the type c, d, e, x or i.
   */
  TYPE_ERR: -5,

  /**
   * The command type not an array.
   */
  COMMAND_NOT_ARRAY: -6,

  /**
   * Raised when the command array is empty.
   */
  COMMAND_ARR_EMPTY: -7,

  /**
   * Raised when the first element of the command array is not a string.
   */
  COMMAND_STRING: -8,

  /**
   * The event type not an array.
   */
  EVENTS_NOT_ARRAY: -9,

  /**
   * Raised when the event array is empty.
   */
  EVENTS_ARR_EMPTY: -10,

  /**
   * The event type not an array.
   */
  EVENT_NOT_ARRAY: -11,

  /**
   * Raised when the event array is empty.
   */
  EVENT_ARR_EMPTY: -12,

  /**
   * Raised when the event code is not a number.
   */
  EVENT_CODE_NOT_NUMBER: -13,

  /**
   * Raised when the master payload is not parsable as a JSON
   * object.
   */
  PAYLOAD_NOT_JSON: -14,

  /**
   * Raised when the given tct is not a string
   */
  TCT_NOT_STRING: -15,

  /**
   * Raised when the reply code on an reply message is not an number
   */
  RESULT_CODE_NOT_INT: -16

};

/**
 * This parser internally normalises the MQTT payload to a data structure
 * that is passed into its internal and proxy parsing functions.
 * @typedef {
 *    {
 *       type: !string,
 *       code: !number,
 *       tct: !string,
 *       rpc: !number,
 *       iah: !boolean,
 *       ts: !Date,
 *       msg: !Array,
 *       data: *,
 *       events: !Array,
 *       res: *
 *    }
 * }
 */
bad.MqttParse.NormData;

/**
 * Parse a payload and topic in one go.
 * @param {string} topic A string.
 * @param {*} payload Could be anything
 * @param {Object=} packet The raw packet.
 * @return {Object}
 */
bad.MqttParse.prototype.parseAll = function(topic, payload, packet) {
  var tArr = topic.split('/');
  var parseResult = this.normalize_(payload, tArr, packet);
  return parseResult;
};

/**
 * Normalise and parse the payload.
 * @param {*} pl
 * @param {Array} tArr
 * @param {Object=} opt_packet
 * @return {!Array}
 */
bad.MqttParse.prototype.normalize_ = function(pl, tArr, opt_packet) {
  var root = tArr[0];
  // TODO: Look in root for further parsing symbols.

  var hid = tArr[1];
  var pid = tArr[2];
  var dir = tArr[3];
  var tct = tArr[4];

  var nlData = this.parse(pl);
  nlData.hid = hid;
  nlData.pid = pid;
  nlData.dir = dir;
  nlData.ts = nlData.ts.valueOf();
  if (tct && goog.string.startsWith(tct, '>')) {
    nlData.tckt = tct.substr(1);
  }

  if (opt_packet) {
    nlData.qos = opt_packet.qos;
    nlData.dup = opt_packet.dup;
    nlData.retain = opt_packet.retain;
  }
  return [root, nlData];
};

/**
 * Parse a string into a JSON object.
 * @param {*} payload A JSON parsable string.
 * @return {Object}
 */
bad.MqttParse.prototype.parse = function(payload) {
  var normPayload = null;
  try {
    var obj = goog.json.parse(payload);

    // A valid payload only has one key. Either c, d, e, x or i
    var type = goog.object.getAnyKey(obj);
    if (type) {
      normPayload = this.normalizePayload_(type, obj[type]);
    }
  } catch (e) {
    normPayload = {
      code: bad.MqttParse.replyCode.PAYLOAD_NOT_JSON,
      ts: new Date(),
      org: payload
    };
  }
  return /** @type {!bad.MqttParse.NormData} */ (normPayload);
};

//----------------------------------------------------------[ Normalise Data ]--

/**
 * This is the entry point to the parser.
 * @param {!string} type Will be either c, d, e, x, or i
 * @param {*} msg The message component of the payload.
 * @return {!bad.MqttParse.NormData}
 * @private
 */
bad.MqttParse.prototype.normalizePayload_ = function(type, msg) {

  var reply = /** @type {!bad.MqttParse.NormData} */ ({});
  reply.type = type;
  reply.ts = new Date();

  if (type === 'i') {
    reply.iah = true;
    this.parseTimeStamp_(msg, reply);
  } else {
    msg = /** @type {!Array} */ (msg);
    reply = this.testPayloadType_(msg, reply);

    // Code 0 = all OK will pass this test.
    if (!reply.code) {
      reply = this.testPayloadLength_(type, msg, reply);

      // All still OK.
      if (!reply.code) {
        reply = this.parseMessage_(type, msg, reply);
      }
    }
  }
  return reply;
};

/**
 * @param {*} ts Could be anything, but a signed integer is the only thing
 *   that will parse to a timestamp. If the number is negative, it is treated
 *   as seconds in the past, and the reply is now - ts(seconds).
 *   If the number is 0 it is treated as now.
 *   If the number is positive, it is treated as the number of seconds since
 *   1970, and parsed as such. Future timestamps are allowed.
 *   If the date can not be parsed from the given timestamp, the parsers own now
 *   is inserted, and the reply code is set to BAD_TIMESTAMP.
 * @param {!bad.MqttParse.NormData} reply
 * @return {!bad.MqttParse.NormData}
 * @private
 */
bad.MqttParse.prototype.parseTimeStamp_ = function(ts, reply) {
  reply.code = bad.MqttParse.replyCode.BAD_TIMESTAMP;
  var date = new Date();
  if (bad.typeCheck.isNumber(ts)) {
    ts = /** @type {!number} */ (ts);
    reply.code = bad.MqttParse.replyCode.ALL_OK;
    if (ts < 0) {
      date.setSeconds(date.getSeconds() + ts);
    } else if (ts > 0) {
      var milli = ts * 1000;
      date.setTime(milli);
    }
  }
  reply.ts = date;
  return reply;
};

/**
 * @param {Array} msg The message component of the payload.
 * @param {!bad.MqttParse.NormData} reply
 * @return {!bad.MqttParse.NormData}
 * @private
 */
bad.MqttParse.prototype.testPayloadType_ = function(msg, reply) {
  var passIsArray = bad.typeCheck.isArray(msg);
  var passNotEmpty = !bad.typeCheck.isEmptyArr(msg);
  var passIsKnownType = goog.string.contains('cdex', reply.type);

  reply.code =
    !passIsArray ? bad.MqttParse.replyCode.PAYLOAD_NOT_ARRAY :
    !passNotEmpty ? bad.MqttParse.replyCode.PAYLOAD_EMPTY :
    !passIsKnownType ? bad.MqttParse.replyCode.TYPE_ERR :
    bad.MqttParse.replyCode.ALL_OK;

  return reply;
};

/**
 * Test the payload length against the know allowed lengths for payloads of
 * a particular type.
 * @param {!string} type The payload type. Only c,d,e and x messages come here.
 * @param {!Array} msg The message component of the payload.
 * @param {!bad.MqttParse.NormData} reply
 * @return {!bad.MqttParse.NormData}
 * @private
 */
bad.MqttParse.prototype.testPayloadLength_ = function(type, msg, reply) {
  var len = msg.length;

  /**
   * A map of known payload lengths. The array value represents
   *   arr[0] == min allowed length
   *   arr[1] == max allowed length.
   * @type {Object.<string, Array.<number>>}
   */
  var allowedMessageLengths = {
    'c': [2, 3],
    'd': [2, 3],
    'e': [2, 3],
    'x': [2, 3]
  };

  var passMin = len >= allowedMessageLengths[type][0];
  var passMax = len <= allowedMessageLengths[type][1];

  reply.code =
    !passMin ? bad.MqttParse.replyCode.PAYLOAD_TOO_SHORT :
    !passMax ? bad.MqttParse.replyCode.PAYLOAD_TOO_LONG :
    reply.code;
  return reply;
};



/**
 * Parse the message component.
 * @param {!string} type The payload type. Only c,d,e and x messages come here.
 * @param {!Array} msg The message component of the payload.
 * @param {!bad.MqttParse.NormData} reply
 * @return {!bad.MqttParse.NormData}
 * @private
 */
bad.MqttParse.prototype.parseMessage_ = function(type, msg, reply) {
  var ts = msg.shift();
  reply = this.parseTimeStamp_(ts, reply);

  var parseMap_ = {
    'c': goog.bind(this.parseCommandMsg_, this),
    'd': goog.bind(this.parseDataMsg_, this),
    'e': goog.bind(this.parseEventMsg_, this),
    'x': goog.bind(this.parseReplyMsg_, this)
  };

  if (reply.code >= 0) {
    // First get the anomaly out the way.
    // For type x message, the rules are:
    // message[0] must be int.
    // message[1] is optional. Can be anything
    if (type === 'x') {
      reply.rpc = bad.typeCheck.isInt(msg[0]) ? msg[0] :
        bad.MqttParse.replyCode.RESULT_CODE_NOT_INT;
      reply = parseMap_[type](msg[1], reply);
    } else {
      // All other message rules are:
      // If message.length === 1, message[0] must be array.
      // If message.length === 2, message[0] must be string and
      //    message[1] array.
      var len = msg.length;
      if (len === 1) {
        reply = parseMap_[type](msg.shift(), reply);
      } else if (len === 2) {
        if (bad.typeCheck.isString(msg[0])) {
          reply.tct = msg.shift();
          reply = parseMap_[type](msg.shift(), reply);
        } else {
          reply.code = bad.MqttParse.replyCode.TCT_NOT_STRING;
        }
      }
    }
  }
  return reply;
};

bad.MqttParse.prototype.parseEventMsg_ = function(msg, reply) {

  reply.code =
    !bad.typeCheck.isArray(msg) ? bad.MqttParse.replyCode.EVENTS_NOT_ARRAY :
    bad.typeCheck.isEmptyArr(msg) ? bad.MqttParse.replyCode.EVENTS_ARR_EMPTY :
    reply.code;
  var broken = {};
  if (!reply.code) {

    var events = {};
    var isArrCode = 0;
    var isNumberCode = 0;
    goog.array.forEach(msg, function(event) {
      isArrCode =
        !bad.typeCheck.isArray(event) ?
          bad.MqttParse.replyCode.EVENT_NOT_ARRAY :
        bad.typeCheck.isEmptyArr(event) ?
          bad.MqttParse.replyCode.EVENT_ARR_EMPTY :
        isArrCode;

      if (!isArrCode) {
        var code = event.shift();
        isNumberCode =
          !bad.typeCheck.isInt(code) ?
            bad.MqttParse.replyCode.EVENT_CODE_NOT_NUMBER :
          isNumberCode;

        if (!isNumberCode) {
          if (goog.isDef(event[0])) {
            events[code] = event[0];
          } else {
            events[code] = null;
          }
        }
      }
    }, this);

    if (isArrCode) {
      broken.code = isArrCode;
      reply = broken;
    } else if (isNumberCode) {
      broken.code = isNumberCode;
      reply = broken;
    } else {
      reply.events = events;
    }
  } else {
    broken.code = reply.code;
    reply = broken;
  }
  return reply;
};

bad.MqttParse.prototype.parseCommandMsg_ = function(msg, reply) {
  reply.code =
    !bad.typeCheck.isArray(msg) ? bad.MqttParse.replyCode.COMMAND_NOT_ARRAY :
    bad.typeCheck.isEmptyArr(msg) ? bad.MqttParse.replyCode.COMMAND_ARR_EMPTY :
    !bad.typeCheck.isString(msg[0]) ? bad.MqttParse.replyCode.COMMAND_STRING :
    reply.code;

  if (!reply.code) {
    var funcName = msg.shift();
    reply.command = {};
    reply.command[funcName] = msg;
  } else {
    var broken = {};
    broken.code = reply.code;
    reply = broken;
  }

  return reply;
};

bad.MqttParse.prototype.parseDataMsg_ = function(msg, reply) {
  reply.data = msg;
  return reply;
};

bad.MqttParse.prototype.parseReplyMsg_ = function(msg, reply) {
  reply.res = msg;
  return reply;
};
