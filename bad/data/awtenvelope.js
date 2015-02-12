/**
 * @fileoverview An implementation of a basic parser for Trinity MQTT type
 *  payloads.
 */
goog.provide('bad.AWTEnvelope');

goog.require('bad.typeCheck');
goog.require('goog.json');
goog.require('goog.string');

/**
 * Constructor of a basic Trinity MQTT payload parser.
 * @constructor
 */
bad.AWTEnvelope = function() {};

/**
 * Entry point to package normalized data into a AWT compatible envelope.
 * @param {!bad.MqttParse.NormData} nlData Normalized data. nlData
 * @param {function} callback A callback function to call once the envelope
 *    is available. The function takes the envelope and an error object.
 */
bad.AWTEnvelope.prototype.getEnvelope = function(nlData, callback) {

  switch (nlData.type) {
    case 'c':
      // TODO: Implement outbound command messages.
      break;
    case 'd':
      this.makeDataEnvelope(nlData, callback);
      break;
    case 'e':
      this.makeEventEnvelope(nlData, callback);
      break;
    case 'x':
      // TODO: Implement reply messages.
      break;
    case 'i':
      this.makeIMHEnvelope(nlData, callback);
      break;
    default:
      var err = '[ERROR] ' + nlData.type + ' is not a recognised message type.';
      callback(null, err);
  }
};

// ------------------------------------------------------------------[ Paths ]--

/**
 * @param {!(bad.MqttParse.NormData.pid|string)} pid
 * @return {string}
 * @private
 */
bad.AWTEnvelope.prototype.getPath_ = function(pid) {
  return pid === '0' ? '@sys' : pid;
};

// ---------------------------------------------------------[ Basic Envelope ]--
/**
 * @param {!bad.MqttParse.NormData} data
 * @return {Object}
 * @private
 */
bad.AWTEnvelope.prototype.getEnvelopeHeader_ = function(data) {
  return {
    'env': {
      'unique_id': data.hid,
      'messages': []
    }
  };
};

// -----------------------------------------------------[ I am Here Envelope ]--

/**
 * @param {!bad.MqttParse.NormData} data
 * @param {!Function} callback
 */
bad.AWTEnvelope.prototype.makeIMHEnvelope = function(data, callback) {
  var envelope = this.getEnvelopeHeader_(data);
  var message = {
    'path': this.getPath_(data.pid),
    'type': 'data',
    'data': [{
      'name': 'IAH',
      'value': data.ts,
      'timestamp': data.ts
    }]
  };
  envelope.env.messages.push(message);
  callback(envelope);
};

// ----------------------------------------------------------[ Data Envelope ]--

/**
 * @param {!bad.MqttParse.NormData} data
 * @param {!Function} callback
 */
bad.AWTEnvelope.prototype.makeDataEnvelope = function(data, callback) {
  var envelope = this.getEnvelopeHeader_(data);
  var message = {
    'path': this.getPath_(data.pid),
    'type': 'data',
    'data': []
  };

  goog.array.forEach(data.data, function(el) {
    goog.object.forEach(el, function(v, k) {
      message.data.push({
        'name': k, 'value': v, 'timestamp': data.ts
      });
    }, this);
  }, this);

  envelope.env.messages.push(message);
  callback(envelope);
};


// ---------------------------------------------------------[ Event Envelope ]--

/**
 * @param {!bad.MqttParse.NormData} data
 * @param {!Function} callback
 */
bad.AWTEnvelope.prototype.makeEventEnvelope = function(data, callback) {
  var envelope;
  var err;

  if (data.events) {
    envelope = this.getEnvelopeHeader_(data);
    var message = {
      'path': this.getPath_(data.pid),
      'type': 'events',
      'events': []
    };

    // We can only attach tickets to the AV messages if the normalized data
    // ticket (tckt) can be coerced into an integer.
    // Our MQTT spec is broader than this, so here we simply need to pre-process
    // the ticket to make sure AV does not kill itself.
    if (data.tckt) {
      var avTicket = parseInt(data.tckt.substr(1), 10);
      if (!(avTicket != avTicket)) {
        // This is a hack to test against NaNs. isNaN has some unexpected
        // behavior, such like: isNaN(' ') evaluates to false.
        // But one reliable effect is the NaN != NaN always evaluates to
        // true. So if (x != x) is true, then x is reliably NaN. I know, this
        // is not nice. But until ECMAScript (ES6) delivers the Number.isNaN(),
        // this is the workaround. Sorry.
        message.ticket = avTicket;
      }
    }

    // Parse each of the events into a AV event message.
    goog.object.forEach(data.events, function(event, key) {
      message.events.push(this.makeEventPayload(key, event, data.ts));
    }, this);
    envelope.env.messages.push(message);
  } else if (data.broken) {
    err = '[OUTBOUND_SMART_ERROR] Broken events in normalized data ' +
    data.broken;
  }

  callback(envelope, err);
};

bad.AWTEnvelope.prototype.makeEventPayload = function(key, event, mTs) {
  var eventTimestamp = event[0];
  var data = event[1];
  var eventCode = parseInt(key, 10);

  // The event timestamp is either a full POSIX timestamp, 0 or a negative
  // number of seconds. Here we need to provide the actual timestamp so we
  // use the event timestamp if it is POSIX, else we use the message timestamp,
  // and sum it with the event timestamp.
  var ts = eventTimestamp > 0 ? eventTimestamp : mTs + eventTimestamp;
  var eventPl = {
    'code': eventCode,
    'type': 1,
    'timestamp': ts
  };
  if (goog.isDefAndNotNull(data)) {
    eventPl['data'] = data;
  }
  return eventPl;
};
