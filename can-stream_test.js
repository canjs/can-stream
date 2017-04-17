var QUnit = require('steal-qunit');
var compute = require('can-compute');
var DefineMap = require('can-define/map/map');
var DefineList = require('can-define/list/list');
var canStream = require('can-stream');

QUnit.module('can-stream');

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

test('Compute streams do not bind to the compute unless activated', function () {
	var c = compute(0);
	var canStreamInterface = {
		toStream: function(observable, propOrEvent) {
			QUnit.equal(c, observable);
			var obj;
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
	var canStreaming = canStream(canStreamInterface);
	var stream = canStreaming.toStream(c);

	QUnit.equal(c.computeInstance.__bindEvents, undefined);

	stream.onValue(function () {});

	QUnit.equal(c.computeInstance.__bindEvents._lifecycleBindings, 1);
});


test('Stream on a property val - toStreamFromEvent', function(){
	var expected = "bar";
	var MyMap = DefineMap.extend({
		foo: {
			value: "bar"
		}
	});

	var canStreamInterface = {
		toStream: function(observable, event) {
			return {
				onValue: function(callback) {
					var ret = { target: {} };
					ret.target[event] = observable[event];
					observable.on(event, function(ev) {
						callback(ev);
					});
				}
			};
		},
		toCompute: function(makeStream, context) {}
	};
	var canStreaming = canStream(canStreamInterface);

	var map = new MyMap();
	var stream = canStreaming.toStream(map, 'foo');

	stream.onValue(function(ev){
		QUnit.equal(ev.target.foo, expected);
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
		toStream: function(observable, property) {
			return {
				onValue: function(callback) {
					var ret = { target: {} };
					ret.target[property] = observable[property];
					observable.on(property, function(ev, value) {
						callback(value);
					});
				}
			};
		},
		toCompute: function(makeStream, context) {}
	};
	var canStreaming = canStream(canStreamInterface);

	var map = new MyMap();
	var stream = canStreaming.toStream(map, 'foo');

	stream.onValue(function(ev){
		QUnit.equal(ev, expected);
	});


	expected = "foobar";
	map.foo = "foobar";

});

test('Multiple streams piped into single stream - toStreamFromProperty', function(){
	var expected = "bar";

	var map = new DefineMap({
		foo: {
			value: "bar"
		},
		foo2: {
			value: "bar"
		}
	});

	var canStreamInterface = {
		toStream: function(observable, property) {
			return {
				onValue: function(callback) {
					var ret = { target: {} };
					ret.target[property] = observable[property];
					observable.on(property, function(ev, value) {
						callback(value);
					});
				}
			};
		},
		toCompute: function(makeStream, context) {},
		mergeStreams: function(s1, s2) {
			var singleStream;
			singleStream = {
				onValue: function(callback) {
					var changeHandler = function(value) {
						callback(value);
					};
					s1.onValue(changeHandler);
					s2.onValue(changeHandler);
				}
			};
			return singleStream;
		}
	};
	var canStreaming = canStream(canStreamInterface);

	var stream1 = canStreaming.toStream(map, 'foo');
	var stream2 = canStreaming.toStream(map, 'foo2');

	var singleStream = canStreaming.mergeStreams(stream1, stream2);

	singleStream.onValue(function(ev){
		QUnit.equal(ev, expected);
	});

	expected = "foobar";
	map.foo = "foobar";

	expected = "foobar2";
	map.foo2 = "foobar2";

});


test('Event streams fire change events', function () {
	var expected = 0;
	var MyMap = DefineMap.extend({
		fooList: {
			Type: DefineList.List,
			value: []
		}
	});

	var canStreamInterface = {
		toStream: function(observable, event) {
			return {
				onValue: function(callback) {
					var ret = { target: {} };
					ret.target[event] = observable[event];
					observable.on(event, function(ev) {
						callback(ev);
					});
				}
			};
		},
		toCompute: function(makeStream, context) {},
		mergeStreams: function(s1, s2) {}
	};
	var canStreaming = canStream(canStreamInterface);

	var map = new MyMap();

	var stream = canStreaming.toStream(map.fooList, 'length');

	stream.onValue(function(ev){
		QUnit.equal(map.fooList.length, expected, 'Event stream was updated with length: ' + map.fooList.length);
	});

	expected = 1;
	map.fooList.push(1);

	expected = 0;
	map.fooList.pop();

});
