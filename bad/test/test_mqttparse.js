/**
 * Created by gumm on 2015/03/11.
 */

require('../../../closure-library/closure/goog/bootstrap/nodejs');
require('../../../../../../deps.js');
goog.require('bad.MqttParse');
goog.require('goog.testing.asserts');
goog.require('goog.format.JsonPrettyPrinter');
goog.require('bad.typeCheck');
goog.require('goog.json');
goog.require('goog.string');

var ftc = 1502476730236; // Some time it the future
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

  describe('parser.parse', function() {
    it('parses future timestamps to a date',
      function() {
        var pl = {'c': [ftc, ['func']]};
        var result = parser.parse(goog.json.serialize(pl));
        assertIsInt('The reply.ts should be a date', result.ts);
        assertHasBasics(result);
        assertSmallerThan(
          'The is allowed to be in the future', ftc, result.ts.valueOf()
        );
      });
  });

  describe('test_parsePastTimeStamp', function() {
    it('should properly parse a timestamp', function() {
      var ptc = -60 * 60 * 3;  // 3 hours ago in seconds.
      var pl = {'c': [ptc, ['func']]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertRoughlyEquals(
        'The reply timestamp should be 3 hours in the past',
        Date.now() + (ptc * 1000),
        reply.ts,
        2 // Within 2 milliseconds of each other.
      );
    });
  });

  describe('test_parseZeroTimeStamp', function() {
    it('A zero timestamp should resolve to now', function() {
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
  });

  describe('test_brokenTooShort', function() {
    it('should return proper broken messages', function() {
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
        bad.MqttParse.replyCode.PAYLOAD_TOO_SHORT, reply.code);
    });
  });

  describe('test_brokenTooLong', function() {
    it('should give proper feedback if the input is too long', function() {
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
        bad.MqttParse.replyCode.PAYLOAD_TOO_LONG, reply.code);
    });
  });

  describe('test_brokenTooLongX', function() {
    it('should give proper feedback if an x message is malformed', function() {
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
        bad.MqttParse.replyCode.PAYLOAD_TOO_LONG, reply.code);
    });
  });

  describe('test_brokenWrongType', function() {
    it('', function() {
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
        bad.MqttParse.replyCode.TYPE_ERR, reply.code);
    });
  });

  describe('test_parseCommandMin', function() {
    it('', function() {
      var pl = {'c': [0, ['func']]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertNotUndefined('Should have a command key', reply.command);
      assertIsObject('command value should be an object', reply.command);
      assertObjectEquals('Command object should be', {func: []}, reply.command);
      assertEquals('Code key should be 0', 0, reply.code);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
    });
  });

  describe('test_parseCommandMax', function() {
    it('', function() {
      var pl = {'c': [0, tct, ['concat', true, false, null, 1, 'string']]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertNotUndefined('Should have a command key', reply.command);
      assertIsObject('command value should be an object', reply.command);
      assertEquals('Code key should be 0', 0, reply.code);
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
  });

  describe('test_brokenCommandNotArray', function() {
    it('', function() {
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
        bad.MqttParse.replyCode.COMMAND_NOT_ARRAY, reply.code);
    });
  });

  describe('test_brokenCommandArrEmpty', function() {
    it('', function() {
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
        bad.MqttParse.replyCode.COMMAND_ARR_EMPTY, reply.code);
    });
  });

  describe('test_brokenCommandNotString', function() {
    it('', function() {
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
        bad.MqttParse.replyCode.COMMAND_STRING, reply.code);
    });
  });

  describe('test_parseEventMin', function() {
    it('', function() {
      var pl = {'e': [0, [[0, 100]]]};
      var reply = parser.parse(goog.json.serialize(pl));
      var messageTimestamp = reply.ts;
      assertHasBasics(reply);
      assertNotUndefined('Should have a events key', reply.events);
      assertIsObject('events value should be an object', reply.events);
      assertEquals('Code key should be 0', 0, reply.code);
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
  });

  describe('test_parseEventMax', function() {
    it('correctly parses a maximal event payload', function() {

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
      assertEquals('Code key should be 0', 0, reply.code);
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
  });

  describe('test_brokenEventNotArray', function() {
    it('', function() {
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
        bad.MqttParse.replyCode.EVENTS_NOT_ARRAY, reply.code);
    });
  });

  describe('test_brokenEventArrayEmpty', function() {
    it('', function() {
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
        bad.MqttParse.replyCode.EVENTS_ARR_EMPTY, reply.code);
    });
  });

  describe('test_brokenEventInnerNotArray', function() {
    it('', function() {
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
        bad.MqttParse.replyCode.SOME_EVENTS_BROKEN, reply.code);
      assertObjectEquals('One broken event', {
        '-11': ['broken']
      }, reply.broken);
      assertObjectEquals('Only one parsed event object', {
        '100': [messageTimestamp, true]
      }, reply.events);
    });
  });

  describe('test_brokenEventInnerArrayEmpty', function() {
    it('', function() {
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
        bad.MqttParse.replyCode.ALL_EVENTS_BROKEN, reply.code);
    });
  });

  describe('test_brokenEventInnerCodeNotNumber', function() {
    it('', function() {
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
      assertEquals('All events failed',
        bad.MqttParse.replyCode.ALL_EVENTS_BROKEN, reply.code);
      assertObjectEquals('One broken event', {
        '-13': [[0, 'hello']]
      }, reply.broken);
    });
  });

  describe('test_parseDataMin', function() {
    it('', function() {
      var pl = {'d': [0, []]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertNotUndefined('Should have a data key', reply.data);
      assertIsArray('data value should be an array', reply.data);
      assertArrayEquals('data array should be', [], reply.data);
      assertEquals('Code key should be 0', 0, reply.code);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No iah', reply.iah);
    });
  });

  describe('test_parseDataMax', function() {
    it('', function() {
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
      assertEquals('Code key should be 0', 0, reply.code);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No iah', reply.iah);
    });
  });

  describe('test_parseTransReplyMax', function() {
    it('', function() {
      var res = [100, true, false, null, 'some string'];
      var pl = {'x': [0, 0, res]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertArrayEquals('response res should be', res, reply.res);
      assertEquals('Code key should be 0', 0, reply.code);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
    });
  });

  describe('test_parseTransReplyMin', function() {
    it('', function() {
      var pl = {'x': [0, 0]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertEquals('Code key should be 0', 0, reply.code);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertUndefined('No iah', reply.iah);
    });
  });

  describe('test_parseIamHereMessageZeroTimestamp', function() {
    it('', function() {
      var pl = {'i': 0};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertEquals('Code key should be 0', 0, reply.code);
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
  });

  describe('test_parseIamHereMessageNormTimestamp', function() {
    it('', function() {
      var msgTsSec = 1426145406;
      var msgTsMilli = msgTsSec * 1000;
      var pl = {'i': msgTsSec};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertEquals('Code key should be 0', 0, reply.code);
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
  });

  describe('test_brokenIamHereMessage', function() {
    it('', function() {
      var pl = {'i': 'broken here'};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
      assertEquals('Code key should be 0', 1, reply.code);
      assertTrue('This is the iah message', reply.iah);
      assertUndefined('No command', reply.command);
      assertUndefined('No events', reply.events);
      assertUndefined('No tct:', reply.tct);
      assertUndefined('No msg:', reply.msg);
      assertUndefined('No res', reply.res);
      assertUndefined('No data:', reply.data);
      assertEquals('The reply timestamp be exactly the given time ',
        Date.now(),
        reply.ts
      );
    });
  });

  describe('test_parseAlarmOnConfirmation', function() {
    it('', function() {
      var pl = {'d': [0, [true, 'alarm', 'on']]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
    });
  });

  describe('test_parseAlarmEvent', function() {
    it('', function() {
      var event = [0, 2000, ['Disarm', 2, 0, 12]];
      var pl = {'e': [0, 'panel', [event]]};
      var reply = parser.parse(goog.json.serialize(pl));
      assertHasBasics(reply);
    });
  });

  describe('test_parseWithTopicEvent', function() {
    it('', function() {
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
  });

  describe('test_parseWithTopicEventAndPacket', function() {
    it('', function() {
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

