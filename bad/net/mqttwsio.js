/**
 * @fileoverview A web socket client that can interact with a server side
 *    MQTT client.
 */
goog.provide('bad.MqttEvent');
goog.provide('bad.MqttEventType');
goog.provide('bad.MqttWsIo');

goog.require('bad.MqttParse');
goog.require('bad.utils');
goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.format.JsonPrettyPrinter');
goog.require('goog.json');
goog.require('goog.net.WebSocket');

/**
 * Constructor of the main site object.
 * @extends {goog.events.EventTarget}
 * @constructor
 */
bad.MqttWsIo = function(wsServer, wsPort) {
  goog.events.EventTarget.call(this);

  this.wsServer = wsServer;
  this.wsPort = wsPort;
  this.webSocket = new goog.net.WebSocket(false);
  this.parser_ = new bad.MqttParse();

  this.jsonFormat_ = new goog.format.JsonPrettyPrinter(
    new goog.format.JsonPrettyPrinter.HtmlDelimiters()
  );
};
goog.inherits(bad.MqttWsIo, goog.events.EventTarget);

/**
 * @typedef {Object|null|number|string}
 */
bad.MqttWsIo.PAYLOAD;

/**
 * @return {goog.events.EventHandler|*}
 */
bad.MqttWsIo.prototype.getHandler = function() {
  return this.googUiComponentHandler_ ||
    (this.googUiComponentHandler_ = new goog.events.EventHandler(this));
};

/**
 * Home page and landing page after login.
 */
bad.MqttWsIo.prototype.init = function(mqttEl) {
  this.outputEl_ = mqttEl;
};

/**
 * @param {!string} topic
 * @param {bad.MqttWsIo.PAYLOAD} payload
 */
bad.MqttWsIo.prototype.mqttPublish = function(topic, payload) {
  this.webSocket.send(goog.json.serialize({
    'action': 'publish',
    'topic': topic,
    'payload': goog.json.serialize(payload)
  }));
};

/**
 * @param {!string} topic
 */
bad.MqttWsIo.prototype.mqttSubscribe = function(topic) {
  this.webSocket.send(goog.json.serialize({
    'action': 'subscribe',
    'topic': topic
  }));
};

/**
 * @param {!string} topic
 */
bad.MqttWsIo.prototype.mqttUnSubscribe = function(topic) {
  this.webSocket.send(goog.json.serialize({
    'action': 'unsubscribe',
    'topic': topic
  }));
};

/**
 * This can be called right after instantiation.
 * @param {Function=} opt_callback
 */
bad.MqttWsIo.prototype.openWebsocket = function(opt_callback) {
  this.getHandler().listen(
    this.webSocket,
    [
      goog.net.WebSocket.EventType.OPENED,
      goog.net.WebSocket.EventType.MESSAGE
    ],
    function(e) {
      switch (e.type) {
        case goog.net.WebSocket.EventType.OPENED:
          this.mqttPublish('Hello', 'Website came on-line');
          if (opt_callback) {opt_callback();}
          break;
        case goog.net.WebSocket.EventType.MESSAGE:
          this.routeWs(goog.json.parse(e.message));
          break;
        default:
          console.debug('Did not understand this message type');
      }
    }
  );
  this.webSocket.open('ws://' + this.wsServer + ':' + this.wsPort);
};

/**
 * @param {Object} data
 */
bad.MqttWsIo.prototype.routeWs = function(data) {
  var target = data['target'];
  var topic = data['topic'];
  var payload = data['message'];
  var packet = data['packet'];

  switch (target) {
    case '@received':
      this.onMessage(target, topic, payload, packet);
      break;
    case '@puback':
    case '@suback':
    case '@unsuback':
    case '@sys':
      this.onSys(target, topic, payload);
      break;
    default:
      console.debug('Unknown target: ', target, topic, payload, packet);
  }
};

/**
 * @param {!string} target
 * @param {!string} topic
 * @param {bad.MqttWsIo.PAYLOAD} payload
 */
bad.MqttWsIo.prototype.onSys = function(target, topic, payload) {
  if (this.outputEl_) {
    goog.dom.insertChildAt(
      this.outputEl_,
      this.displayMQTT(target, topic, payload),
      0);
  }
};

/**
 * Called when the MQTT client for this websocket recived a message.
 * @param {!string} topic
 * @param {bad.MqttWsIo.PAYLOAD} payload
 * @param {!Object} packet
 */
bad.MqttWsIo.prototype.onMessage = function(target, topic, payload, packet) {

  var parseResult = this.parser_.parseAll(topic, payload, packet);
  var root = parseResult[0];
  var nlData = parseResult[1];
  this.dispatchEvent(new bad.MqttEvent(this, bad.MqttEventType.RECEIVED,
    topic, payload, packet, root, nlData));

  if (this.outputEl_) {
    goog.dom.insertChildAt(
      this.outputEl_,
      this.displayMQTT(target, topic, payload),
      0);
  }
};

/**
 * @param {!string} target
 * @param {!string} topic
 * @param {bad.MqttWsIo.PAYLOAD} payload
 * @return {!Element}
 */
bad.MqttWsIo.prototype.displayMQTT = function(target, topic, payload) {

  var dirMap = {
    '@received': 'MESSAGE',
    '@puback': 'PUBACK',
    '@suback': 'SUBACK',
    '@unsuback': 'UNSUBACK',
    '@sys': 'SYSTEM'
  };

  var dirTxt = dirMap[target];
  var pullRight = target === '@puback' ? 'pull-right' : '';

  var theDate = new Date();
  var plDom = goog.dom.createDom('pre', 'payload', '');
  var dirDom = goog.dom.createDom('kbd', 'dirIndicator ' + dirTxt, dirTxt);
  var dom = goog.dom.createDom('div', pullRight + ' blah',
    goog.dom.createDom('kbd', 'event-time', theDate.toLocaleTimeString()),
    dirDom,
    goog.dom.createDom('kbd', '', topic)
  );

  if (payload) {
    goog.dom.append(dom, goog.dom.createDom('div', '', plDom));
    try {
      plDom.innerHTML = this.jsonFormat_.format(payload);
    } catch (e) {
      plDom.innerHTML = payload;
    }
  }
  return dom;
};

/**
 * @enum {string}
 */
bad.MqttEventType = {
  RECEIVED: bad.utils.privateRandom()
};

/**
 * @param {bad.MqttWsIo} target
 * @param {!string} topic
 * @param {bad.MqttWsIo.PAYLOAD} payload
 * @param {Object} packet
 * @param {!string} root
 * @param {!Object} nlData
 * @constructor
 * @extends {goog.events.Event}
 */
bad.MqttEvent = function(target, type, topic, payload, packet, root, nlData) {
  goog.events.Event.call(this, type, target);

  /**
   * @type {!string}
   */
  this.topic = topic;

  /**
   * @type {bad.MqttWsIo.PAYLOAD}
   */
  this.payload = payload;

  /**
   * @type {Object}
   */
  this.packet = packet;

  /**
   * @type {!string}
   */
  this.root = root;

  /**
   * @type {!Object}
   */
  this.normalData = nlData;
};
goog.inherits(bad.MqttEvent, goog.events.Event);
