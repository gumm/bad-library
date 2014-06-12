/**
 * @fileoverview An implementation of a basic parser for Trinity MQTT type
 *  payloads
 */
goog.provide('bad.MqttParse');
goog.provide('bad.MqttParse.replyCode');
goog.provide('bad.TCTEvent');
goog.provide('bad.TCTReceivedEvent');

goog.require('goog.array');
goog.require('goog.events.Event');
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

  /**
   * @type {Object.<string, Function>} A map of command names
   *    to their parsing functions. Use {@code addCommandParseFunc} to add to
   *    this map.
   * @private
   */
  this.commandParseFuncs_ = {};

  /**
   * @type {Object.<string, Function>} A map of event codes and their
   *    corresponding parsing functions. All event names are the string
   *    equivalents of event numbers. Use {@code addEventParseFunc} to add to
   *    this map.
   * @private
   */
  this.eventParseFuncs_ = {};

  /**
   * This is the default parsing function for parsing data messages.
   * It can be set with {@code setDataParseFunc}
   * @type {Function}
   * @private
   */
  this.dataParseFunc_ = goog.nullFunction;

  /**
   * The default parsing function to parse null payloads with.
   * It can be set with {@code setNullFunc}
   * @type {Function}
   * @private
   */
  this.nullFunc_ = goog.nullFunction;
};
goog.inherits(bad.MqttParse, goog.events.EventTarget);

/**
 * @typedef {{code: !number, tct: !string, tcr: !string,
 *    ts: !Date, msg: !Array, res: *}}
 */
bad.MqttParse.NormData;

/**
 * @typedef {{x: !Array}}
 */
bad.MqttParse.XMsg;

/**
 * Enum for reply codes.
 * Code 0 is for outright success.
 * All codes above 0 are for partial success conditions.
 * All codes below 0 are for outright failures.
 * @enum {number}
 */
bad.MqttParse.replyCode = {
  // Could only parse some of the given data.
  PARTIAL_DATA_SUCCESS: 2,

  // Could only parse some of the given events.
  PARTIAL_EVENT_SUCCESS: 1,

  // Command or event received and parsed.
  ALL_OK: 0,

  // Could not resolve the given command keyword to a known command.
  UNKNOWN_COMMAND: -1,

  // Could not resolve the given event code to a known event code.
  UNKNOWN_ERROR_CODE: -2,

  // No data parser available.
  DATA_NOT_PARSED: -3
};

/**
 * @param {!string} payload A JSON parsable string.
 */
bad.MqttParse.prototype.parse = function(payload) {
  var obj = goog.json.parse(payload);
  var map = {
    'c': this.parseCommand_,
    'd': this.parseData_,
    'e': this.parseEvent_,
    'n': this.nullFunc_,
    'x': this.parseXReply_
  };

  goog.object.forEach(map, function(func, type) {
    if (obj[type]) {
      /**
       * @type {!bad.MqttParse.NormData}
       */
      var normPayload = this.normalizePayload_(type, obj[type]);
      console.debug(type, 'Normalised Payload ----> ', normPayload);
      this.parseWith_(normPayload, func);
    }
  }, this);
};

/**
 * @param {!string} type
 * @param {!Array} val
 * @return {!bad.MqttParse.NormData}
 * @private
 */
bad.MqttParse.prototype.normalizePayload_ = function(type, val) {
  var reply = {};
  if (
      goog.isArray(val) &&                        // Is array, with
      val.length >= 2 &&                          // min 2 el, and
      (type !== 'x' ? val.length <= 3 : true) &&  // 3 el max if type != "x", or
      (type === 'x' ? val.length <= 4 : true) &&  // 4 el max if type == "x",
      goog.isNumber(val[0])                       // and 1st element is a number
      ) {
    reply.ts = this.parseTimeStamp_(val[0]);

    var second = val[1];
    var typeOfSecond = goog.typeOf(second);
    var third = val[2];

    switch (type) {
      case 'c':
      case 'd':
      case 'e':
        if (typeOfSecond === 'array') {
          reply.msg = /** @type {!Array} */ (second);
        } else if (typeOfSecond === 'string') {
          reply.tct = /** @type {!string} */ (second);
          reply.msg = /** @type {!Array} */ (third);
        }
        break;
      case 'n':
        break;
      case 'x':
        if (typeOfSecond === 'string') {
          reply.tcr = /** @type {string} */ (second);
        }
        if (goog.isDef(third) && goog.isNumber(third)) {
          reply.code = /** @type {number} */ (third);
        }
        if (val.length === 4) {
          reply.res = val[3];
        }
        break;
      default:
        console.debug('Unknown type:', type);
    }
  }
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
bad.MqttParse.prototype.parseTimeStamp_ = function(ts) {
  var reply = new Date();
  if (ts < 0) {
    reply.setSeconds(reply.getSeconds() + ts);
  } else if (ts > 0) {
    var milli = ts * 1000;
    var now = reply.valueOf();
    reply = now > milli ? reply.setTime(milli) : reply;
  }
  return reply;
};

/**
 * @param {!bad.MqttParse.NormData} norm The normalised payload data.
 * @param {!Function} func The function that will be used to parse the data.
 * @private
 */
bad.MqttParse.prototype.parseWith_ = function(norm, func) {
  if (norm.tct) {
    var now = new Date();

    /**
     * @type {bad.MqttParse.XMsg}
     */
    var xReply = {'x': []};
    var xArr = [now.valueOf(), norm.tct];

    goog.array.extend(xArr, func.call(this, norm));
    xReply.x = xArr;
    this.dispatchEvent(new bad.TCTEvent(this, norm.tct, xReply));
  } else {
    if (func) {
      func.call(this, norm);
    }
  }
};

/**
 * @param {(Function|null|undefined)} fn The proxy parsing function.
 * @param {Array} data The normalised data.
 * @param {!number} failCode The failure code. Used when the given fn is
 *    not a function.
 * @return {!Array}
 * @private
 */
bad.MqttParse.prototype.doIt_ = function(fn, data, failCode) {
  var arr = [];
  if (goog.isFunction(fn)) {
    arr.push(bad.MqttParse.replyCode.ALL_OK);
    var result = fn.apply(this, data);
    if (goog.isDef(result)) {
      arr.push(result);
    }
  } else {
    arr.push(failCode);
  }
  return arr;
};

//-----------------------------------------------------------------[ Command ]--

/**
 * Parses the normalised data according to the function name contained in the
 * msg component of the data. A lookup is done into the available command parse
 * functions mapped in commandParseFuncs_ map.
 * @param {!bad.MqttParse.NormData} norm The normalised data structure
 * @return {!Array} The reply object;
 * @private
 */
bad.MqttParse.prototype.parseCommand_ = function(norm) {
  var funcName = norm.msg.shift();
  var fn = this.commandParseFuncs_[funcName] || null;
  return this.doIt_(fn, norm.msg, bad.MqttParse.replyCode.UNKNOWN_COMMAND);
};

/**
 * Adds a proxy parsing function for the given command name.
 * This can be called multiple times, and each unique command name will is
 * mapped to its corresponding parsing function.
 * @param {!string} cmdName The name of the command.
 * @param {Function} func The proxy parsing function for the given command.
 */
bad.MqttParse.prototype.addCommandParseFunc = function(cmdName, func) {
  this.commandParseFuncs_[cmdName] = func;
};

//-------------------------------------------------------------------[ Event ]--

/**
 * Event parsing function that steps through each of the events as contained in
 * the msg component of the normalised data, and parses each event according to
 * its code. If all events fail, its return code is an outright event fail.
 * If some pass, its code is a partial success code.
 * If all pass, its code is an ALL_OK
 * @param {!bad.MqttParse.NormData} norm The normalised data structure
 * @return {!Array} The reply array;
 * @private
 */
bad.MqttParse.prototype.parseEvent_ = function(norm) {
  var arr = [];
  var failedCodes = [];
  goog.array.forEach(norm.msg, function(event) {
    var code = event.shift();
    var fn = this.eventParseFuncs_[code.toString()];
    var reply = this.doIt_(fn, event,
        bad.MqttParse.replyCode.UNKNOWN_ERROR_CODE);
    if (reply[0] !== 0) {
      failedCodes.push([code, reply[0], reply[1]]);
    }
  }, this);

  if (failedCodes.length) {
    // Some failed.
    if (norm.msg.length === failedCodes.length) {
      // All failed.
      arr.push(bad.MqttParse.replyCode.UNKNOWN_ERROR_CODE);
    } else {
      arr.push(bad.MqttParse.replyCode.PARTIAL_EVENT_SUCCESS);
      arr.push(failedCodes);
    }
  } else {
    // All passed
    arr.push(bad.MqttParse.replyCode.ALL_OK);
  }
  return arr;
};

/**
 * Add a proxy function to parse a specific event code with.
 * This can be called multiple times, and each given code and function is mapped
 * into an map.
 * @param {!number} eventCode The event number.
 * @param {Function} func The parsing function for the given event code.
 */
bad.MqttParse.prototype.addEventParseFunc = function(eventCode, func) {
  this.eventParseFuncs_[eventCode.toString()] = func;
};

//--------------------------------------------------------------------[ Data ]--

/**
 * @param {!bad.MqttParse.NormData} norm The normalised data structure
 * @return {!Array} The reply array;
 * @private
 */
bad.MqttParse.prototype.parseData_ = function(norm) {
  var fn = this.dataParseFunc_;
  return this.doIt_(fn, norm.msg, bad.MqttParse.replyCode.DATA_NOT_PARSED);
};

/**
 * Add an proxy function to parse data with.
 * @param {Function} func The function itself.
 */
bad.MqttParse.prototype.setDataParseFunc = function(func) {
  this.dataParseFunc_ = func;
};

//-------------------------------------------------------[ Transaction Reply ]--

/**
 * @param {!bad.MqttParse.NormData} norm The normalised data structure
 * @private
 */
bad.MqttParse.prototype.parseXReply_ = function(norm) {
  this.dispatchEvent(new bad.TCTReceivedEvent(this, norm));
};

//------------------------------------------------------------[ Null Message ]--

/**
 * Add an proxy function to a null message with.
 * @param {Function} func The parsing function itself.
 */
bad.MqttParse.prototype.setNullFunc = function(func) {
  this.nullFunc_ = func;
};

//------------------------------------------------------------[ Parser Events]--

/**
 * @param {bad.MqttParse} target The parser.
 * @param {!string} tct The MQTT topic on which a reply must be published.
 * @param {!bad.MqttParse.XMsg} payload The payload of the given topic.
 * @constructor
 * @extends {goog.events.Event}
 */
bad.TCTEvent = function(target, tct, payload) {
  goog.events.Event.call(this, 'tct', target);

  /**
   * @type {!string}
   */
  this.tct = tct;

  /**
   * @type {!bad.MqttParse.XMsg}
   */
  this.payload = payload;
};
goog.inherits(bad.TCTEvent, goog.events.Event);

/**
 * @param {bad.MqttParse} target The parser.
 * @param {!bad.MqttParse.NormData} norm The normalised data.
 * @constructor
 * @extends {goog.events.Event}
 */
bad.TCTReceivedEvent = function(target, norm) {
  goog.events.Event.call(this, 'tctreply', target);

  /**
   * @type {!bad.MqttParse.NormData}
   */
  this.tctReply = norm;
};
goog.inherits(bad.TCTEvent, goog.events.Event);
