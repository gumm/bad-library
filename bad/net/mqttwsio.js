/**
 * @fileoverview Base scripts for initialising the bad site.
 */
goog.provide('bad.MqttEvent');
goog.provide('bad.MqttEventType');
goog.provide('bad.MqttWsIo');

goog.require('bad.utils');
goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.net.WebSocket');
goog.require('goog.object');

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

  this.sysTopics = {
    ACTIVE_CLIENTS: {
      topic: '$SYS/broker/clients/active',
      element: null},
    BYTES_SENT: {
      topic: '$SYS/broker/bytes/sent',
      element: null},
    BYTES_RECEIVED: {
      topic: '$SYS/broker/bytes/received',
      element: null},
    MESSAGES_SENT: {
      topic: '$SYS/broker/messages/sent',
      element: null},
    MESSAGES_RECEIVED: {
      topic: '$SYS/broker/messages/received',
      element: null}
  };
};
goog.inherits(bad.MqttWsIo, goog.events.EventTarget);

bad.MqttWsIo.prototype.getHandler = function() {
  return this.googUiComponentHandler_ ||
    (this.googUiComponentHandler_ = new goog.events.EventHandler(this));
};

/**
 * Home page and landing page after login.
 */
bad.MqttWsIo.prototype.init_ = function(mqttEl, sysEl) {

  // Park ref to these elements.
  this.MQTTElement_ = mqttEl;
  this.sysElement_ = sysEl;

//    this.getHandler().listen(
//        goog.dom.getElement('subscrGo'),
//        goog.events.EventType.CLICK,
//        function(e) {
//            var topic = document.getElementById('subscrIn').value;
//            this.mqttSubscribe(topic);
//            this.mqttSubscribe('blah');
//        }, undefined, this);
//
//    this.getHandler().listen(
//        goog.dom.getElement('clickme'),
//        goog.events.EventType.CLICK,
//        function(e) {
//            var topic = document.getElementById('topic').value;
//            var payload = document.getElementById('payload').value;
//            this.mqttPublish(topic, payload);
//        }, undefined, this);
};

/**
 * This can be called right after instantiation.
 */
bad.MqttWsIo.prototype.openWebsocket = function() {
  this.getHandler().listen(
    this.webSocket,
    [
      goog.net.WebSocket.EventType.OPENED,
      goog.net.WebSocket.EventType.MESSAGE,
      goog.net.WebSocket.EventType.CLOSED
    ],
    function(e) {
      switch (e.type) {
        case goog.net.WebSocket.EventType.OPENED:
          this.mqttPublish('Hello', 'Website came on-line');
          break;
        case goog.net.WebSocket.EventType.MESSAGE:
          this.routeWs(goog.json.parse(e.message));
          break;
        case goog.net.WebSocket.EventType.CLOSED:
          this.routeWs({
            'target': '@sys',
            'topic': 'Warning',
            'message': 'Lost connection to server'
          });
          break;
        default:
          console.debug('Did not understand this message type');
      }
    }
  );
  this.webSocket.open('ws://' + this.wsServer + ':' + this.wsPort);
};

bad.MqttWsIo.prototype.routeWs = function(data) {
  var target = data['target'];
  var topic = data['topic'];
  var payload = data['message'];

  switch (target) {
    case '@received':
      this.receivedMQTT(topic, payload);
      break;
    case '@published':
      this.publishedMQTT(topic, payload);
      break;
    case '@sys':
      this.displaySys(topic, payload);
      break;
    default:
      console.debug('Unknown target: ', target);
  }
};

bad.MqttWsIo.prototype.trackActiveClients = function(el) {
  this.sysTopics.ACTIVE_CLIENTS.element = el;
  this.mqttSubscribe(this.sysTopics.ACTIVE_CLIENTS.topic);
};

bad.MqttWsIo.prototype.trackTotalMessagesReceived = function(el) {
  this.sysTopics.MESSAGES_RECEIVED.element = el;
  this.mqttSubscribe(this.sysTopics.MESSAGES_RECEIVED.topic);
};

bad.MqttWsIo.prototype.trackTotalMessagesSent = function(el) {
  this.sysTopics.MESSAGES_SENT.element = el;
  this.mqttSubscribe(this.sysTopics.MESSAGES_SENT.topic);
};

bad.MqttWsIo.prototype.trackBytesReceived = function(el) {
  this.sysTopics.BYTES_RECEIVED.element = el;
  this.mqttSubscribe(this.sysTopics.BYTES_RECEIVED.topic);
};

bad.MqttWsIo.prototype.trackBytesSent = function(el) {
  this.sysTopics.BYTES_SENT.element = el;
  this.mqttSubscribe(this.sysTopics.BYTES_SENT.topic);
};

bad.MqttWsIo.prototype.receivedMQTT = function(topic, payload) {

  var event = new bad.MqttEvent(
    this,
    topic, payload);
  this.dispatchEvent(event);

  var wasSysMessage = goog.object.some(this.sysTopics, function(registred) {
    if (registred.element && registred.topic === topic) {
      goog.dom.setTextContent(registred.element, payload);
      return true;
    }
    return false;
  }, this);

  if (this.MQTTElement_ && !wasSysMessage) {
    this.MQTTElement_.appendChild(
      this.displayMQTT(topic, payload, '', 'text-warning')
    );
  }
};

bad.MqttWsIo.prototype.publishedMQTT = function(topic, payload) {
  if (this.MQTTElement_) {
    this.MQTTElement_.appendChild(
      this.displayMQTT(topic, payload, 'pull-right', 'text-success')
    );
  }
};

bad.MqttWsIo.prototype.displayMQTT = function(topic, payload, pull, col) {
  return goog.dom.createDom('li', {},
    goog.dom.createDom('span', pull,
      goog.dom.createDom('code', 'muted', topic),
      goog.dom.createDom('code', col,
        goog.dom.createDom('strong', {}, payload))
    )
  );
};

bad.MqttWsIo.prototype.displaySys = function(topic, payload) {
  if (this.sysElement_) {
    this.sysElement_.appendChild(
      goog.dom.createDom('li', {},
        goog.dom.createDom('code', 'muted', topic),
        goog.dom.createDom('code', 'text-info',
          goog.dom.createDom('strong', {}, payload))
      )
    );
  }
};

bad.MqttWsIo.prototype.mqttPublish = function(topic, payload) {
  this.webSocket.send(goog.json.serialize({
    'action': 'publish',
    'topic': topic,
    'payload': payload
  }));
};

bad.MqttWsIo.prototype.mqttSubscribe = function(topic) {
  this.webSocket.send(goog.json.serialize({
    'action': 'subscribe',
    'topic': topic
  }));
};

bad.MqttEventType = {
  RECEIVED: bad.utils.privateRandom()
};

/**
 * @param {bad.MqttWsIo} target
 * @param {!string} topic
 * @param {(string|number|Object)} payload
 * @constructor
 * @extends {goog.events.Event}
 */
bad.MqttEvent = function(target, topic, payload) {
  goog.events.Event.call(this, topic, target);

  /**
   * @type {!string}
   */
  this.topic = topic;

  /**
   * @type {(string|number|Object)}
   */
  this.payload = payload;
};
goog.inherits(bad.MqttEvent, goog.events.Event);
