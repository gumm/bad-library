require('../../../closure-library/closure/goog/bootstrap/nodejs');
require('../deps.js');

goog.require('bad.MqttParse');
goog.require('goog.testing.asserts');
goog.require('goog.format.JsonPrettyPrinter');
goog.require('bad.typeCheck');
goog.require('goog.json');
goog.require('goog.string');

var tct = '>ticket_id_12345';

/*
 assertTrue([comment,] value)
 assertFalse([comment,] value)
 assertEquals([comment,] expectedValue, observedValue)
 assertNotEquals([comment,] expectedValue, observedValue)
 assertNull([comment,] value)
 assertNotNull([comment,] value)
 assertUndefined([comment,] value)
 assertNotUndefined([comment,] value)
 assertArrayEquals([comment,] expectedValue, observedValue)
 assertSameElements([comment,] expectedValue, observedValue)
 */


describe('testMqttParse', function() {
  var pCode = bad.MqttParse.replyCode;
  var parser = new bad.MqttParse();
  var pp = new goog.format.JsonPrettyPrinter(
    new goog.format.JsonPrettyPrinter.TextDelimiters()
  );

  var assertBiggerThan = function(comment, a, b) {
    assertTrue(comment, a > b);
  };

  var assertSmallerThan = function(comment, a, b) {
    assertTrue(comment, a < b);
  };

  var assertIsArray = function(comment, a) {
    assertEquals(comment, 'array', goog.typeOf(a));
  };

  var assertIsString = function(comment, a) {
    assertEquals(comment, 'string', goog.typeOf(a));
  };

  var assertIsNumber = function(comment, a) {
    assertEquals(comment, 'number', goog.typeOf(a));
  };

  var assertIsInt = function(comment, a) {
    assertFalse(
      'The number should not contain a "."',
      goog.string.contains(a.toString(), '.')
    );
    assertFalse(
      'The number should not contain a "-"',
      goog.string.contains(a.toString(), '-')
    );
    assertEquals(comment, 'number', goog.typeOf(a));
  };

  var assertIsSignedInt = function(comment, a) {
    assertFalse(
      'The number should not contain a "."',
      goog.string.contains(a.toString(), '.')
    );
    assertEquals(comment, 'number', goog.typeOf(a));
  };

  var assertIsObject = function(comment, a) {
    assertEquals(comment, 'object', goog.typeOf(a));
  };

  var assertIsDate = function(comment, a) {
    assertTrue(comment,
      Object.prototype.toString.call(a) === '[object Date]');
  };

  var assertHasBasics = function(reply) {
    assertContains('Type parsed out', reply.type, ['c', 'd', 'e', 'x', 'i']);
    assertNotUndefined('There should be a timestamp', reply.ts);
    assertIsInt('The timestamp should be an int', reply.ts);
  };

  describe('bad.typeCheck.isEmptyArr', function() {
    it('returns true when the given array is empty and false' +
      'when it is not empty',
      function() {
        assertTrue(bad.typeCheck.isEmptyArr([]));
        assertFalse(bad.typeCheck.isEmptyArr([1, 2]));
      });
  });

  describe('bad.typeCheck.isNotEmptyArr', function() {
    it('returns true when the given array is not empty and ' +
      'false when it is empty',
      function() {
        assertFalse(bad.typeCheck.isNotEmptyArr([]));
        assertTrue(bad.typeCheck.isNotEmptyArr([1, 2]));
      });
  });

  describe('Parsing MQTT data structures', function() {
    it('allows for timestamps to be in the future',
      function() {
        var ftc = 9999999999; // Some time it the future
        var ftsMilli = ftc * 1000;
        var pl = {'c': [ftc, ['func']]};
        var result = parser.parse(goog.json.serialize(pl));
        assertEquals('The reply.ts should be a date', ftsMilli, result.ts);
        assertHasBasics(result);
        assertSmallerThan('The timestamp is allowed to be in the future',
          Date.now(), result.ts
        );
      });

    it('parse relative timestamps in the past', function() {
      var msgTsRelativeSecs = -60 * 60 * 3;  // 3 hours ago in seconds.
      var msgTsRelativeMilli = msgTsRelativeSecs * 1000;
      var pl = {'c': [msgTsRelativeSecs, ['func']]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertRoughlyEquals(
        'The reply timestamp should be 3 hours in the past',
        Date.now() + msgTsRelativeMilli,
        reply.ts,
        2 // Within 2 milliseconds of each other.
      );
    });

    it('parse zero timestamp to now', function() {
      var pl = {'c': [0, ['zero']]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertRoughlyEquals(
        'The reply timestamp should be within 10ms from now',
        Date.now(),
        reply.ts,
        2 // Within 2 milliseconds of each other.
      );
    });

    it('gives feedback when the input is too short', function() {
      var pl = {'c': ['func']};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
      assertEquals('Payload too short',
        pCode.PAYLOAD_TOO_SHORT, reply.code);
    });

    it('gives feedback when the input is too long', function() {
      var pl = {'c': [1, 2, 3, 4]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
      assertEquals('Payload too long of non-X',
        pCode.PAYLOAD_TOO_LONG, reply.code);
    });

    it('gives feedback if an "x" message is malformed', function() {
      var pl = {'x': [1, 2, 3, 4, 5]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
      assertEquals('Payload too long for X',
        pCode.PAYLOAD_TOO_LONG, reply.code);
    });

    it('gives feedback when a message has the wrong type', function() {
      var pl = {'z': [1, 2, 3]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertNotUndefined('There should be a timestamp', reply.ts);
      assertIsInt('The timestamp should be an int', reply.ts);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
      assertEquals('Payload too short',
        pCode.TYPE_ERR, reply.code);
    });

    it('parses short command messages', function() {
      var pl = {'c': [0, ['func']]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertNotUndefined('Should have a command key', reply.command);
      assertIsObject('command value should be an object', reply.command);
      assertObjectEquals('Command object should be', {func: []}, reply.command);
      assertEquals('Result code should be ALL_OK', pCode.ALL_OK, reply.code);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
    });

    it('parses long command messages', function() {
      var pl = {'c': [0, tct, ['concat', true, false, null, 1, 'string']]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertNotUndefined('Should have a command key', reply.command);
      assertIsObject('command value should be an object', reply.command);
      assertEquals('Result code should be ALL_OK', pCode.ALL_OK, reply.code);
      assertEquals('The tct key is:', tct, reply.tct);
      assertUndefined('No events', reply.events);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
      assertObjectEquals(
        'Command object should be',
        {concat: [true, false, null, 1, 'string']}, reply.command);
    });

    it('gives feedback when a command is malformed', function() {
      var pl = {'c': [0, tct, 3]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertEquals('TCT parsed out', tct, reply.tct);
      assertNotUndefined('Gives feedback on what is broken', reply.broken);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
      assertEquals('Command component must be an array',
        pCode.COMMAND_NOT_ARRAY, reply.code);
    });

    it('gives feedback when a command is empty', function() {
      var pl = {'c': [0, tct, []]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertNotUndefined('Gives feedback on what is broken', reply.broken);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
      assertEquals('Command component may not be empty',
        pCode.COMMAND_ARR_EMPTY, reply.code);
    });

    it('gives feedback when a command is not a string', function() {
      var pl = {'c': [1, tct, [1]]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertEquals('TCT parsed out', tct, reply.tct);
      assertNotUndefined('Gives feedback on what is broken', reply.broken);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
      assertEquals('Command name must be a string',
        pCode.COMMAND_STRING, reply.code);
    });

    it('parses simple event messages', function() {
      var pl = {'e': [0, [[0, 100]]]};
      var reply = parser.parse(goog.json.serialize(pl));
      var messageTimestamp = reply.ts;
      assertHasBasics(reply);
      assertNotUndefined('Should have a events key', reply.events);
      assertIsObject('events value should be an object', reply.events);
      assertEquals('Result code should be ALL_OK', pCode.ALL_OK, reply.code);
      assertUndefined('No command', reply.command);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
      assertObjectEquals(
        'events object should be',
        {'100': [messageTimestamp]}, reply.events);
    });

    it('parses complex event messages', function() {

      // The timestamp given in the message.
      var msgTsSec = 1426145406;
      var msgTsMilli = msgTsSec * 1000;

      // The timestamp given in the events.
      var evt1DeltaSec = -60;
      var evt2DeltaSec = -100;
      var evt3DeltaSec = -123;
      var evt4DeltaSec = -456;

      // The eventual required timestamp given in the events in the
      // final normalized data.
      var evt1DeltaMilli = msgTsMilli + (evt1DeltaSec * 1000);
      var evt2DeltaMilli = msgTsMilli + (evt2DeltaSec * 1000);
      var evt3DeltaMilli = msgTsMilli + (evt3DeltaSec * 1000);
      var evt4DeltaMilli = msgTsMilli + (evt4DeltaSec * 1000);

      var pl = {
        'e': [
          msgTsSec, 'eventmax', [
            [evt1DeltaSec, 100, true],
            [evt2DeltaSec, 101, false],
            [evt3DeltaSec, 102, 'string'],
            [evt4DeltaSec, 103, 123.345]
          ]
        ]
      };
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertNotUndefined('Should have a events key', reply.events);
      assertIsObject('events value should be an object', reply.events);
      assertEquals('Result code should be ALL_OK', pCode.ALL_OK, reply.code);
      assertEquals('The tct key is:', 'eventmax', reply.tct);
      assertUndefined('No command', reply.command);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
      assertObjectEquals('events object should be', {
        '100': [evt1DeltaMilli, true],
        '101': [evt2DeltaMilli, false],
        '102': [evt3DeltaMilli, 'string'],
        '103': [evt4DeltaMilli, 123.345]
      }, reply.events);
    });

    it('gives feedback when the events are not in an array', function() {
      var pl = {'e': [0, 2]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
      assertEquals('Command name must be a string',
        pCode.EVENTS_NOT_ARRAY, reply.code);
    });

    it('gives feedback when the events array is empty', function() {
      var pl = {'e': [0, []]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
      assertEquals('Command name must be a string',
        pCode.EVENTS_ARR_EMPTY, reply.code);
    });

    it('gives feedback when an event itself is not an array', function() {
      var pl = {'e': [0, ['broken', [0, 100, true]]]};
      var reply = parser.parse(goog.json.serialize(pl));
      var messageTimestamp = reply.ts;
      assertHasBasics(reply);
      assertUndefined('No command', reply.command);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
      assertEquals('One event passed the other failed',
        pCode.SOME_EVENTS_BROKEN, reply.code);
      assertObjectEquals('One broken event', {
        '-11': ['broken']
      }, reply.broken);
      assertObjectEquals('Only one parsed event object', {
        '100': [messageTimestamp, true]
      }, reply.events);
    });

    it('gives feedback when an event array is empty', function() {
      var pl = {'e': [0, [[]]]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
      assertEquals('Command name must be a string',
        pCode.ALL_EVENTS_BROKEN, reply.code);
    });

    it('gives feedback when the event code is not an integer', function() {
      var pl = {'e': [0, [[0, 'hello']]]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
      assertEquals('All events failed', pCode.ALL_EVENTS_BROKEN, reply.code);
      assertObjectEquals('One broken event', {
        '-13': [[0, 'hello']]
      }, reply.broken);
    });

    it('parses simple data messages', function() {
      var pl = {'d': [0, []]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertNotUndefined('Should have a data key', reply.data);
      assertIsArray('data value should be an array', reply.data);
      assertArrayEquals('data array should be', [], reply.data);
      assertEquals('Result code should be ALL_OK', pCode.ALL_OK, reply.code);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No iah', reply.iah);
    });

    it('parses complex messages', function() {
      var dataPl = [100, true, false, {
        'a': 'string',
        'b': 123
      }, null, [1, 2, 3], 'some string'];
      var pl = {'d': [0, 'datamax', dataPl]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertNotUndefined('Should have a data key', reply.data);
      assertIsArray('data value should be an array', reply.data);
      assertArrayEquals('data array should be', dataPl, reply.data);
      assertEquals('tct should be:', 'datamax', reply.tct);
      assertEquals('Result code should be ALL_OK', pCode.ALL_OK, reply.code);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No iah', reply.iah);
    });

    it('parses complex reply ("x") messages', function() {
      var res = [100, true, false, null, 'some string'];
      var pl = {'x': [0, 0, res]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertArrayEquals('response res should be', res, reply.res);
      assertEquals('Result code should be ALL_OK', pCode.ALL_OK, reply.code);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
    });

    it('parses simple reply ("x") messages', function() {
      var pl = {'x': [0, 0]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertEquals('Result code should be ALL_OK', pCode.ALL_OK, reply.code);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
    });

    it('parses I-am-Here messages with zero timestamps', function() {
      var pl = {'i': 0};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertEquals('Result code should be ALL_OK', pCode.ALL_OK, reply.code);
      assertTrue('This is the iah message', reply.iah);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertRoughlyEquals('The reply timestamp be now ',
        Math.floor(new Date().valueOf()),
        Math.floor(reply.ts.valueOf()),
        2 // Within 2 milliseconds from each other
      );
    });

    it('parses I-am-Here messages with integer timestamps', function() {
      var msgTsSec = 1426145406;
      var msgTsMilli = msgTsSec * 1000;
      var pl = {'i': msgTsSec};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertEquals('Result code should be ALL_OK', pCode.ALL_OK, reply.code);
      assertTrue('This is the iah message', reply.iah);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertEquals('The reply timestamp be exactly the given time ',
        msgTsMilli,
        reply.ts
      );
    });

    it('gives feedback when a IAH message is malformed', function() {
      var pl = {'i': 'broken here'};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertTrue('This is the iah message', reply.iah);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertRoughlyEquals('The reply timestamp be exactly the given time ',
        Date.now(),
        reply.ts,
        2  // Within 2 milliseconds from each other.
      );
      assertEquals('Result code should be BAD_TIMESTAMP',
        pCode.BAD_TIMESTAMP, reply.code);
    });

    it('parses an "alarm on" example message', function() {
      var pl = {'d': [0, [true, 'alarm', 'on']]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
    });

    it('parses an "event 2000" sample message', function() {
      var event = [0, 2000, ['Disarm', 2, 0, 12]];
      var pl = {'e': [0, 'panel', [event]]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
    });

    it('parses when entering with a topic and simple packet', function() {
      var topic = 'MYROOT/IMEI/PERIPHERALID/>';
      var event = [0, 2000, ['Disarm', 2, 0, 12]];
      var pl = {'e': [0, 'panel', [event]]};
      var packet = {
        topic: topic,
        payload: goog.json.serialize(pl)
      };

      var cb = function(result) {
        var reply = result[1];
        assertHasBasics(reply);
      };
      parser.parseAll(packet, cb);
    });

    it('parses when entering with a topic and complex packet', function() {
      var topic = 'MYROOT/IMEI/PERIPHERALID/>/>sometct';
      var event = [0, 2000, ['Disarm', 2, 0, 12]];
      var pl = {'e': [0, 'panel', [event]]};
      var packet = {
        topic: topic,
        payload: goog.json.serialize(pl),
        qos: 0,
        dup: false,
        retain: false
      };

      var cb = function(result) {
        var reply = result[1];
        assertHasBasics(reply);
      };
      parser.parseAll(packet, cb);
    });

  });

});

