/**
 * @fileoverview An implementation of a basic parser for Trinity MQTT type
 *  payloads
 */
goog.provide('bad.MqttParse');
goog.provide('bad.MqttParse.replyCode');

goog.require('goog.array');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.object');

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
   * The message is not of the type c, d, e, x or n.
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
  EVENT_CODE_NOT_NUMBER: -13


};

/**
 * This parser internally normalises the MQTT payload to a data structure
 * that is passed into its internal and proxy parsing functions.
 * @typedef {{code: !number, tct: !string, tcr: !string,
 *    ts: !Date, msg: !Array, res: *}}
 */
bad.MqttParse.NormData;

/**
 * @param {!string} payload A JSON parsable string.
 */
bad.MqttParse.prototype.parse = function(payload) {
  var obj = goog.json.parse(payload);
  var type = goog.object.getAnyKey(obj);
  var normPayload = null;
  if (type) {
    /**
     * @type {!bad.MqttParse.NormData}
     */
    normPayload = this.normalizePayload_(type, obj[type]);
  }
  return normPayload;
};

//----------------------------------------------------------[ Normalise Data ]--

bad.MqttParse.prototype.testPayloadType_ = function(type, val, reply) {
  var passIsArray = this.isArray(val);
  var passNotEmpty = !this.isEmptyArr(val);
  var passIsKnownType = goog.string.contains('cdex', type);

  reply.code =
    !passIsArray ? bad.MqttParse.replyCode.PAYLOAD_NOT_ARRAY :
    !passNotEmpty ? bad.MqttParse.replyCode.PAYLOAD_EMPTY :
    !passIsKnownType ? bad.MqttParse.replyCode.TYPE_ERR :
    bad.MqttParse.replyCode.ALL_OK;
  return reply;
};

bad.MqttParse.prototype.testPayloadLength_ = function(type, val, reply) {
  var len = val.length;
  var passMin = type === 'n' ? len === 1 : len >= 2;
  var passMax = type === 'n' ? len === 1 :
                type === 'x' ? len <= 4:
                len <= 3;

  reply.code =
    !passMin ? bad.MqttParse.replyCode.PAYLOAD_TOO_SHORT :
    !passMax ? bad.MqttParse.replyCode.PAYLOAD_TOO_LONG :
    reply.code;
  return reply;
};

/**
 * @param {number} ts A signed integer. If the number is negative, it is treated
 * as seconds in the past, and the reply is now - ts(seconds).
 * If the number is 0 it is treated as now.
 * If the number is positive, it is treated as the number of seconds since
 * 1970, and parsed as such. A final check is done to make sure the result is
 * not in the future. If it is, then now is returned.
 * @return {!Date}
 * @private
 */
bad.MqttParse.prototype.parseTimeStamp_ = function(ts, reply) {
  reply.code = bad.MqttParse.replyCode.BAD_TIMESTAMP;
  var date = new Date();
  if (this.isNumber(ts)) {
    reply.code = bad.MqttParse.replyCode.ALL_OK;
    if (ts < 0) {
      date.setSeconds(date.getSeconds() + ts);
    } else if (ts > 0) {
      var milli = ts * 1000;
      date.setTime(milli);
    }
    reply.ts = date;
  }
  return reply;
};

bad.MqttParse.prototype.parseHeader_ = function(type, val, reply) {
  reply = this.parseTimeStamp_(val[0], reply);
  if (!reply.code) {
    var first = val[1];
    var second = val[2];
    var third = val[3];
    switch(type + val.length) {
      case 'x3':
        reply.tcr = first;
        reply.code = second;
        break;
      case 'x4':
        reply.tcr = first;
        reply.code = second;
        reply.res = third;
        break;
      case 'c2':
        reply = this.parseCommandMsg_(first, reply);
        break;
      case 'c3':
        reply.tct = first;
        reply = this.parseCommandMsg_(second, reply);
        break;
      case 'd2':
        reply.data = first;
        break;
      case 'd3':
        reply.tct = first;
        reply.data = second;
        break;
      case 'e2':
        reply = this.parseEventMsg_(first, reply);
        break;
      case 'e3':
        reply.tct = first;
        reply = this.parseEventMsg_(second, reply);
        break;
      default:
          console.debug('We really should not have come here', type, val.length);
      }
  }
  return reply;

};

bad.MqttParse.prototype.parseEventMsg_ = function(msg, reply) {

  reply.code =
    !this.isArray(msg) ? bad.MqttParse.replyCode.EVENTS_NOT_ARRAY :
    this.isEmptyArr(msg) ? bad.MqttParse.replyCode.EVENTS_ARR_EMPTY :
    reply.code;
  var broken = {};
  if (!reply.code) {

    var events = {};
    var isArrCode = 0;
    var isNumberCode = 0;
    goog.array.forEach(msg, function (event) {
      isArrCode =
        !this.isArray(event) ? bad.MqttParse.replyCode.EVENT_NOT_ARRAY :
        this.isEmptyArr(event) ? bad.MqttParse.replyCode.EVENT_ARR_EMPTY :
        isArrCode;

      if (!isArrCode) {
        var code = event.shift();
        isNumberCode =
          !this.isInt(code) ? bad.MqttParse.replyCode.EVENT_CODE_NOT_NUMBER :
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
    !this.isArray(msg) ? bad.MqttParse.replyCode.COMMAND_NOT_ARRAY :
    this.isEmptyArr(msg) ? bad.MqttParse.replyCode.COMMAND_ARR_EMPTY :
    !this.isString(msg[0]) ? bad.MqttParse.replyCode.COMMAND_STRING :
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

/**
 * @param {!string} type
 * @param {!Array} val
 * @return {!bad.MqttParse.NormData}
 * @private
 */
bad.MqttParse.prototype.normalizePayload_ = function(type, val) {
  var reply = {};
  if (type === 'n') {
    reply.code = bad.MqttParse.replyCode.ALL_OK;
    reply.nullMsg = true;
    reply.ts = new Date();
  } else {
    reply = this.testPayloadType_(type, val, reply);
    if (!reply.code) {
      reply = this.testPayloadLength_(type, val, reply);
      if (!reply.code) {
        reply = this.parseHeader_(type, val, reply);
      }
    }
  }
  return reply;
};

bad.MqttParse.prototype.isArray = function(a) {
    return goog.typeOf(a) === 'array';
};

bad.MqttParse.prototype.isNotEmptyArr = function(a) {
    return !this.isEmptyArr(a);
};

bad.MqttParse.prototype.isEmptyArr = function(a) {
    return goog.isDef(a[0]) ? false : true;
};

bad.MqttParse.prototype.isString = function(a) {
  return goog.typeOf(a) === 'string';
};

bad.MqttParse.prototype.isNumber = function(a) {
  return goog.typeOf(a) === 'number';
};

bad.MqttParse.prototype.isInt = function(a) {
    var aS = a.toString();
    return goog.typeOf(a) === 'number' &&
      a > 0 &&
      !goog.string.contains(aS, '.');
};

bad.MqttParse.prototype.isSignedInt = function(a) {
    var aS = a.toString();
    return goog.typeOf(a) === 'number' &&
      !goog.string.contains(aS, '.');
};

bad.MqttParse.prototype.isObject = function(a) {
    return goog.typeOf(a) === 'object';
};

bad.MqttParse.prototype.isDate = function(a) {
    return Object.prototype.toString.call(a) === '[object Date]';
};
