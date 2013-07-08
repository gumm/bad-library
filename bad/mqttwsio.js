/**
 * @fileoverview Base scripts for initialising the bad site.
 */
goog.provide('bad.MqttWsIo');

goog.require('goog.events.EventHandler');
goog.require('goog.json');
goog.require('goog.net.WebSocket');
goog.require('goog.net.WebSocket.EventType');
goog.require('goog.ui.Css3ButtonRenderer');
goog.require('goog.ui.CustomButton');

/**
 * Constructor of the main site object.
 * @extends {goog.events.EventHandler}
 * @constructor
 */
bad.MqttWsIo = function(wsServer, wsPort) {
    goog.events.EventHandler.call(this, this);

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
goog.inherits(bad.MqttWsIo, goog.events.EventHandler);

/**
 * Home page and landing page after login.
 */
bad.MqttWsIo.prototype.init_ = function(mqttEl, sysEl) {

    // Park ref to these elements.
    this.MQTTElement_ = mqttEl;
    this.sysElement_ = sysEl;

//    this.listen(
//        goog.dom.getElement('subscrGo'),
//        goog.events.EventType.CLICK,
//        function(e) {
//            var topic = document.getElementById('subscrIn').value;
//            this.mqttSubscribe(topic);
//            this.mqttSubscribe('blah');
//        }, undefined, this);
//
//    this.listen(
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
    this.listen(
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
    var wasSysMessage = goog.object.some(this.sysTopics, function(registred) {
        if (registred.element && registred.topic === topic) {
            goog.dom.setTextContent(registred.element, payload);
            return true;
        }
        return false;
    }, this);

    if(this.MQTTElement_ && !wasSysMessage) {
        this.MQTTElement_.appendChild(
            this.displayMQTT(topic, payload, '', 'text-warning')
        );
    }
};

bad.MqttWsIo.prototype.publishedMQTT = function(topic, payload) {
    if(this.MQTTElement_) {
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
    if(this.sysElement_) {
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