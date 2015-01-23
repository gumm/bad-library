/**
 * @fileoverview An implementation of a basic parser for Trinity MQTT type
 *  payloads
 */
goog.provide('bad.MqttParse');
goog.provide('bad.MqttParse.replyCode');

goog.require('bad.typeCheck');
goog.require('goog.array');
goog.require('goog.json');
goog.require('goog.object');
goog.require('goog.string');

/**
 * Constructor of a basic Trinity MQTT payload parser.
 * @constructor
 */
bad.MqttParse = function() {};

/**
 * Enum for reply codes.
 * Code 0 is for outright success.
 * All codes above 0 are for partial success conditions.
 * All codes below 0 are for outright failures.
 * @enum {number}
 */
bad.MqttParse.replyCode = {

  /**
   * Only some events could be parsed.
   */
  SOME_EVENTS_BROKEN: 2,

  /**
   * The given timestamp is untrustworthy.
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
   * Raised when the event array is not between 2 and 3 elements long.
   */
  EVENT_ARR_WRONG_LENGTH: -12,

  /**
   * Raised when the event code is not a number.
   */
  EVENT_CODE_NOT_INT: -13,

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
  RESULT_CODE_NOT_INT: -16,

  /**
   * Raised when no events could successfully be parsed from an event message.
   */
  ALL_EVENTS_BROKEN: -17

};

/**
 * This parser internally normalises the MQTT payload to a data structure
 * that is passed into its internal and proxy parsing functions.
 * @typedef {
 *    {
 *       hid: !string,
 *       pid: !(string|number),
 *       dir: !string,
 *       ts: !number,
 *       qos: number,
 *       dup: boolean,
 *       retain: boolean,
 *       type: !string,
 *       code: !number,
 *       tct: !string,
 *       rpc: !number,
 *       iah: !boolean,
 *       ts: !number,
 *       msg: !Array,
 *       data: *,
 *       events: !Array,
 *       res: *,
 *       broken: *
 *    }
 * }
 */
bad.MqttParse.NormData;

/**
 * @param {Object} packet Looks like this:
 *    {cmd: 'publish',
 *    retain: false,
 *    qos: 0,
 *    dup: false,
 *    length: 41,
 *    topic: 'iah_00010000/359568050218257/0/>',
 *    payload: <Buffer 7b 22 69 22 3a 30 7d> }
 * @param {Function} callback
 */
bad.MqttParse.prototype.parseAll = function(packet, callback) {
  callback(this.normalize_(packet));
};

/**
 * Normalise and parse the payload.
 * @param {Object} packet Looks like this:
 *    {cmd: 'publish',
 *    retain: false,
 *    qos: 0,
 *    dup: false,
 *    length: 41,
 *    topic: 'iah_00010000/359568050218257/0/>',
 *    payload: <Buffer 7b 22 69 22 3a 30 7d> }
 * @return {Array}
 * @private
 */
bad.MqttParse.prototype.normalize_ = function(packet) {

  var tArr = packet.topic.split('/');
  var root = tArr[0];
  var pl = packet.payload;
  var tct = tArr[4];

  /**
   * @type {bad.MqttParse.NormData}
   */
  var nlData = this.parse(pl);
  nlData.hid = tArr[1];
  nlData.pid = tArr[2];
  nlData.dir = tArr[3];
  nlData.ts = nlData.ts.valueOf();
  if (tct && goog.string.startsWith(tct, '>')) {
    nlData.tckt = tct.substr(1);
  }

  nlData.qos = goog.isDefAndNotNull(packet.qos) ? packet.qos : null;
  nlData.dup = goog.isDefAndNotNull(packet.dup) ? packet.dup : null;
  nlData.retain = goog.isDefAndNotNull(packet.retain) ? packet.retain : null;
  return [
    /** @type {string} */ (root),
    /** @type {bad.MqttParse.NormData} */ (nlData)
  ];
};

/**
 * Parse a string into a JSON object.
 * @param {*} payload A JSON parsable string.
 * @return {bad.MqttParse.NormData}
 */
bad.MqttParse.prototype.parse = function(payload) {

  // There is an assumption here that the payload is a JSON string, but coming
  // in form C, this string may have a null terminator. The google JSON parser
  // croaks on this at the moment. So lets have a look at the last char of
  // the string...
  //payload.replace(/\0/g, '');


  //console.log('\nHERE THE PAYLOAD -- >', payload, '\n');

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
      ts: new Date().getTime(),
      broken: payload
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
  reply.ts = new Date().getTime();

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
  reply.ts = date.getTime();
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

  if (!passIsKnownType) {
    delete reply.type;
  }

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

  if (reply.code) {
    reply.broken = msg;
  }

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
    // message[0] must be signed int.
    // message[1] is optional. Can be anything
    if (type === 'x') {
      reply.rpc = bad.typeCheck.isSignedInt(msg[0]) ? msg[0] :
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

  var broken = {};
  var events = {};
  var errCode = 0;

  // Check if the given message is an array.
  errCode = !bad.typeCheck.isArray(msg) ?
    bad.MqttParse.replyCode.EVENTS_NOT_ARRAY :
      bad.typeCheck.isEmptyArr(msg) ?
        bad.MqttParse.replyCode.EVENTS_ARR_EMPTY :
         errCode;

  if (errCode) {
    reply.code = errCode;
    reply.broken = msg;
  } else {
    // Check each of the events. Must be an array between 2 and 3 elements.
    goog.array.forEach(msg, function(event) {
      errCode = 0;
      errCode =
        !bad.typeCheck.isArray(event) ?
          bad.MqttParse.replyCode.EVENT_NOT_ARRAY :
          !bad.typeCheck.arrLengthBetween(event, 2, 3) ?
            bad.MqttParse.replyCode.EVENT_ARR_WRONG_LENGTH :
            errCode;

      if (errCode) {
        broken[errCode.toString()] = broken[errCode.toString()] ?
          broken[errCode.toString()].push(event) : [event];
      } else {
        // So the event is an array with between 2 and 3 elements.
        // Good. Lets check the element types.
        var timestamp = event[0];
        var eventCode = event[1];
        var extra = event[2];

        // Check timestamp.
        errCode = bad.typeCheck.isInt(timestamp) ? errCode :
          bad.MqttParse.replyCode.BAD_TIMESTAMP;
        if (errCode) {
          broken[errCode.toString()] = broken[errCode.toString()] ?
            broken[errCode.toString()].push(event) : [event];
        } else {
          // So the timestamp is OK.
          // Lets check the event code.
          errCode = bad.typeCheck.isInt(eventCode) ? errCode :
            bad.MqttParse.replyCode.EVENT_CODE_NOT_INT;
          if (errCode) {
            broken[errCode.toString()] = broken[errCode.toString()] ?
              broken[errCode.toString()].push(event) : [event];
          } else {
            // So the event code is an int.
            // Good. We can parse this.
            events[eventCode.toString()] = [timestamp];
            if (goog.isDef(extra)) {
              events[eventCode.toString()].push(extra);
            }
          }
        }
      }

      if (goog.object.getAnyKey(broken)) {
        reply.broken = broken;
        reply.code = bad.MqttParse.replyCode.SOME_EVENTS_BROKEN;
      }

      if (goog.object.getAnyKey(events)) {
        reply.events = events;
      } else {
        reply.code = bad.MqttParse.replyCode.ALL_EVENTS_BROKEN;
      }

    }, this);
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
    reply.broken = msg;
  }

  return reply;
};

bad.MqttParse.prototype.parseDataMsg_ = function(msg, reply) {
  reply.data = msg;
  return reply;
};

bad.MqttParse.prototype.parseReplyMsg_ = function(msg, reply) {
  if (goog.isDef(msg)) {
    reply.res = msg;
  }
  return reply;
};
