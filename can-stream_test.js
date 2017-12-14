var QUnit = require('steal-qunit');
var compute = require('can-compute');
var DefineMap = require('can-define/map/map');
var DefineList = require('can-define/list/list');
var canStream = require('can-stream');

QUnit.module('can-stream');

test('Resolves to "toStream" function', function() {
	var c = compute(0);
	var obj;
	var streamInterface;

	var streamImplementation = {
		toStream: function(observable, propOrEvent) {
			QUnit.equal(c, observable);
			return obj = {
				onValue: function(callback) {
					c.on('change', function(evnt, newVal, oldVal) {
						callback(newVal);
					});
					callback(c()); //initial value;
				}
			};
		},
		toCompute: function(makeStream, context) {}
	};
	streamInterface = canStream(streamImplementation);

	var stream = streamInterface(c);
	QUnit.equal(obj, stream);

});

test('Compute changes can be streamed', function () {
	var c = compute(0);
	var obj;
	var canStreaming;

	var canStreamInterface = {
		toStream: function(observable, propOrEvent) {
			QUnit.equal(c, observable);
			return obj = {
				onValue: function(callback) {
					c.on('change', function(evnt, newVal, oldVal) {
						callback(newVal);
					});
					callback(c()); //initial value;
				}
			};
		},
		toCompute: function(makeStream, context) {}
	};
	canStreaming = canStream(canStreamInterface);

	var stream = canStreaming.toStream(c);
	QUnit.equal(obj, stream);

	var computeVal;

	stream.onValue(function (newVal) {
		computeVal = newVal;
	});

	QUnit.equal(computeVal, 0);
	c(1);

	QUnit.equal(computeVal, 1);
	c(2);

	QUnit.equal(computeVal, 2);
	c(3);

	QUnit.equal(computeVal, 3);
});

QUnit.test('Compute streams do not bind to the compute unless activated', function(assert) {
	var c = compute(0);

	var canStreamInterface = {
		toStream: function(observable, propOrEvent) {
			assert.equal(c, observable);
			return {
				onValue: function(callback) {
					c.on('change', function(evnt, newVal, oldVal) {
						callback(newVal);
					});
					callback(c()); //initial value;
				}
			};
		},
		toCompute: function(makeStream, context) {}
	};

	var canStreaming = canStream(canStreamInterface);
	var stream = canStreaming.toStream(c);

	assert.notOk(c.computeInstance.bound, "should not be bound");

	stream.onValue(function() {});
	assert.ok(c.computeInstance.bound, "should be bound");
});

test('Stream on a property val - toStreamFromEvent', function(){
	var expected = "bar";
	var MyMap = DefineMap.extend({
		foo: {
			value: "bar"
		}
	});

	var canStreamInterface = {
		toStream: function(c) {
			return {
				onValue: function(callback) {
					c.on('change', function() {
						callback.apply(null, arguments);
					});
				}
			};
		},
		toCompute: function(makeStream, context) {}
	};
	var canStreaming = canStream(canStreamInterface);

	var map = new MyMap();
	var stream = canStreaming.toStream(map, '.foo');

	stream.onValue(function(ev, newVal, oldVal){
		QUnit.equal(newVal, expected);
	});

	expected = "foobar";
	map.foo = "foobar";
});

test('Stream on a property val - toStreamFromProperty', function(){
	var expected = "bar";
	var MyMap = DefineMap.extend({
		foo: {
			value: "bar"
		}
	});

	var canStreamInterface = {
		toStream: function(c) {
			return {
				onValue: function(callback) {
					c.on('change', function() {
						callback.apply(null, arguments);
					});
				}
			};
		},
		toCompute: function(makeStream, context) {}
	};
	var canStreaming = canStream(canStreamInterface);

	var map = new MyMap();
	var stream = canStreaming.toStream(map, '.foo');

	stream.onValue(function(ev, val){
		QUnit.equal(val, expected);
	});

	expected = "foobar";
	map.foo = "foobar";

});

QUnit.test('Event streams fire change events', function(assert) {
	var expected = 0;
	var MyMap = DefineMap.extend({
		fooList: {
			Type: DefineList.List,
			value: []
		}
	});

	var canStreamInterface = {
		toStream: function(c) {
			return {
				onValue: function(callback) {
					c.on('change', function(ev, newValue) {
						callback.call(null, newValue);
					});
				}
			};
		},
		toCompute: function(makeStream, context) {},
	};
	var canStreaming = canStream(canStreamInterface);

	var map = new MyMap();
	var stream = canStreaming.toStream(map.fooList, 'length');

	stream.onValue(function(lengthEvent) {
		assert.equal(lengthEvent.type, "length");
		assert.deepEqual(
			lengthEvent.args,
			expected,
			'Event stream was updated with length: ' + map.fooList.length
		);
	});

	expected = [1, 0];  // [newValue, oldValue]
	map.fooList.push(1);

	expected = [0, 1]; // [newValue, oldValue]
	map.fooList.pop();
});

test('Event streams fire change event on a property', function () {


	var expected = 0;
	var MyMap = DefineMap.extend({
		fooList: {
			Type: DefineList.List,
			value: []
		}
	});

	var canStreamInterface = {
		toStream: function(c) {
			return {
				onValue: function(callback) {
					c.on('change', function() {
						callback.apply(null, arguments);
					});
				}
			};
		},
		toCompute: function(makeStream, context) {},
	};
	var canStreaming = canStream(canStreamInterface);

	var map = new MyMap();

	var stream = canStreaming.toStream(map, '.fooList add');


	stream.onValue(function(ev, length, oldLength){
		QUnit.equal(length, expected, 'Event stream was updated with length: ' + map.fooList.length);
	});

	expected = 1;
	map.fooList.push(1);


	expected = 0;
	map.fooList.pop();

});


//old
test('Stream on a property val - toStreamFromEvent', function(){
	var MyMap = DefineMap.extend({
		foo: {value: "bar"}
	});
	var map = new MyMap();

	var canStreamInterface = {
		toStream: function(c) {
			return {
				onValue: function(callback) {
					c.on('change', function(ev, newVal) {
						callback.call(null, newVal);
					});
				}
			};
		},
		toCompute: function(makeStream, context) {},
	};
	var canStreaming = canStream(canStreamInterface);

	var stream = canStreaming.toStream(map, 'foo');

	stream.onValue(function(fooEvent){
		QUnit.equal(fooEvent.type, "foo");

		QUnit.deepEqual(fooEvent.args, ["foobar","bar"]);
	});

	map.foo = "foobar";
});


test('Convert an observable nested property into an event stream #2b', 2, function() {

	var MyMap = DefineMap.extend({
		foo: {
			value: function(){
				return {
					bar: 1
				};
			}
		}
	});
	var obs = new MyMap();

	var canStreamInterface = {
		toStream: function(c) {
			return {
				onValue: function(callback) {
					c.on('change', function(ev, newVal) {
						callback.call(null, newVal);
					});
					callback(c());
				}
			};
		},
		toCompute: function(makeStream, context) {},
	};
	var canStreaming = canStream(canStreamInterface);

	var stream = canStreaming.toStream(obs, ".foo.bar");

	var expected = 1;
	stream.onValue(function(barValue) {
		QUnit.equal(barValue, expected, "value was "+barValue);
	});

	expected = 2;
	obs.foo.bar = 2;

});

test('observable nested property event', 1, function() {

	var MyMap = DefineMap.extend({
		foo: {
			value: function(){
				return {
					bar: 1
				};
			}
		}
	});
	var obs = new MyMap();

	var canStreamInterface = {
		toStream: function(c) {
			var handler;
			return {
				onValue: function(callback) {
					handler = function() {
						callback.apply(null, arguments);
					};
					c.on('change', handler);
				},
				offValue: function(callback) {
					c.off('change', handler);
				}
			};
		},
		toCompute: function(makeStream, context) {},
	};
	var canStreaming = canStream(canStreamInterface);

	var stream = canStreaming.toStream(obs, ".foo bar");

	var expected = 1;
	stream.onValue(function(barEvent, barValue) {
		QUnit.equal(barValue, expected, "value was " + barValue);
	});

	expected = 2;
	obs.foo.bar = 2;

});

test('Event streams fire change events on a property', function () {
	var expected = 0;
	var MyMap = DefineMap.extend({
		fooList: {
			Type: DefineList.List,
			value: []
		}
	});
	var map = new MyMap();

	var canStreamInterface = {
		toStream: function(c) {
			var handler;
			return {
				onValue: function(callback) {
					handler = function() {
						callback.apply(null, arguments);
					};
					c.on('change', handler);
				},
				offValue: function(callback) {
					c.off('change', handler);
				}
			};
		},
		toCompute: function(makeStream, context) {},
	};
	var canStreaming = canStream(canStreamInterface);

	var stream = canStreaming.toStream(map, '.fooList length');

	var handler = function(ev, length, lastLength){
		QUnit.equal(length, expected, 'Event stream was updated with length: ' + map.fooList.length);
	};
	stream.onValue(handler);

	expected = 1;
	map.fooList.push(1);
	expected = 2;
	map.fooList.push(2);
	expected = 1;
	map.fooList.pop();

	expected = 0;
	map.fooList = new DefineList([]);

	stream.offValue(handler);

});

// test('Create a stream from a observable and nested property with shorthand method: toStream', function() {

// 	var expected = 1;
// 	var MyMap = DefineMap.extend({
// 		foo: {
// 			type: '*',
// 			value: {
// 				bar: 1
// 			}
// 		}
// 	});
// 	var obs = new MyMap();
// 	var canStreamInterface = {
// 		toStream: function(c) {
// 			return {
// 				onValue: function(callback) {
// 					c.on('change', function() {
// 						callback.apply(null, arguments);
// 					});
// 				}
// 			};
// 		},
// 		toCompute: function(makeStream, context) {},
// 	};
// 	var canStreaming = canStream(canStreamInterface);

// 	var stream = canStreaming.toStream(obs, ".foo.bar");

// 	stream.onValue(function(newVal) {
// 		QUnit.equal(expected, newVal);
// 	});

// 	expected = 2;
// 	obs.foo.bar = 2;

// });

test('Create a stream from a observable and event with shorthand method: toStream', function() {
	var expected = 0;
	var MyMap = DefineMap.extend({
		fooList: {
			Type: DefineList.List,
			value: []
		}
	});
	var map = new MyMap();

	var canStreamInterface = {
		toStream: function(c) {
			return {
				onValue: function(callback) {
					c.on('change', function() {
						callback.apply(null, arguments);
					});
				}
			};
		},
		toCompute: function(makeStream, context) {},
	};
	var canStreaming = canStream(canStreamInterface);


	var stream = canStreaming.toStream(map.fooList, 'length');

	stream.onValue(function(ev){
		QUnit.equal(map.fooList.length, expected, 'Event stream was updated with length: ' + map.fooList.length);
	});

	expected = 1;
	map.fooList.push(1);

	expected = 0;
	map.fooList.pop();
});


test('Create a stream from a observable and event on property with shorthand method: toStream', function() {
	var expected = 0;
	var MyMap = DefineMap.extend({
		fooList: {
			Type: DefineList.List,
			value: []
		}
	});
	var map = new MyMap();

	var canStreamInterface = {
		toStream: function(c) {
			return {
				onValue: function(callback) {
					c.on('change', function() {
						callback.apply(null, arguments);
					});
				}
			};
		},
		toCompute: function(makeStream, context) {},
	};
	var canStreaming = canStream(canStreamInterface);

	var stream = canStreaming.toStream(map, '.fooList length');

	stream.onValue(function(ev){
		QUnit.equal(map.fooList.length, expected, 'Event stream was updated with length: ' + map.fooList.length);
	});

	expected = 1;
	map.fooList.push(1);

	expected = 0;
	map.fooList.pop();
});


test('Update the list to undefined', function() {
	var expected = 0;
	var MyMap = DefineMap.extend({
		fooList: {
			Type: DefineList.List,
			value: []
		}
	});
	var map = new MyMap();

	var canStreamInterface = {
		toStream: function(c) {
			return {
				onValue: function(callback) {
					c.on('change', function() {
						callback.apply(null, arguments);
					});
				}
			};
		},
		toCompute: function(makeStream, context) {},
	};
	var canStreaming = canStream(canStreamInterface);

	var stream = canStreaming.toStream(map, '.fooList.length');

	stream.onValue(function(ev, newVal){
		QUnit.equal(newVal, expected, 'Setting fooList to null');
	});

	expected = undefined;
	map.fooList = null;
});

test("toStreamFromEvent passes event and other arguments", 3, function(){
	// test by testing toComputeFromEvent first
	var myMap = new DefineMap({prop: "value"});

	var c = canStream.toComputeFromEvent(myMap, "prop");


	c.on("change", function(ev, newVal){
		QUnit.equal(newVal.type, "prop");
		QUnit.deepEqual(newVal.args, ["VALUE","value"]);
	});

	QUnit.equal(c(), undefined, "no value");


	myMap.prop = "VALUE";
});
