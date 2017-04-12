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
		toStreamFromProperty: function(observable, property) {},
		toStreamFromEvent: function(observable, event) {},
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
		toStreamFromProperty: function(observable, property) {},
		toStreamFromEvent: function(observable, event) {},
		toCompute: function(makeStream, context) {}
	};
	var canStreaming = canStream(canStreamInterface);
	var stream = canStreaming.toStream(c);

	QUnit.equal(c.computeInstance._bindings, undefined);

	stream.onValue(function () {});

	QUnit.equal(c.computeInstance._bindings, 1);
});


test('Stream on a property val - toStreamFromEvent', function(){
	var expected = "bar";
	var MyMap = DefineMap.extend({
		foo: {
			value: "bar"
		}
	});

	var canStreamInterface = {
		toStream: function(observable, propOrEvent) {},
		toStreamFromProperty: function(observable, property) {},
		toStreamFromEvent: function(observable, event) {
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
	var stream = canStreaming.toStreamFromEvent(map, 'foo');

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
		toStream: function(observable, propOrEvent) {},
		toStreamFromProperty: function(observable, property) {
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
		toStreamFromEvent: function(observable, event) {},
		toCompute: function(makeStream, context) {}
	};
	var canStreaming = canStream(canStreamInterface);

	var map = new MyMap();
	var stream = canStreaming.toStreamFromProperty(map, 'foo');

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
		toStream: function(observable, propOrEvent) {},
		toStreamFromProperty: function(observable, property) {
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
		toStreamFromEvent: function(observable, event) {},
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

	var stream1 = canStreaming.toStreamFromProperty(map, 'foo');
	var stream2 = canStreaming.toStreamFromProperty(map, 'foo2');

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
		toStream: function(observable, propOrEvent) {},
		toStreamFromProperty: function(observable, property) {},
		toStreamFromEvent: function(observable, event) {
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

	var stream = canStreaming.toStreamFromEvent(map.fooList, 'length');

	stream.onValue(function(ev){
		QUnit.equal(map.fooList.length, expected, 'Event stream was updated with length: ' + map.fooList.length);
	});

	expected = 1;
	map.fooList.push(1);

	expected = 0;
	map.fooList.pop();

});

/*
test('Convert an observable nested property into an event stream #2b', function() {
	var expected = 1;
	var MyMap = DefineMap.extend({
		foo: {
			value: {
				bar: {
					value: 1
				}
			}
		}
	});
	var obs = new MyMap();

	var stream = canStream.toStreamFromEvent(obs.foo, "bar");

	stream.onValue(function(ev) {
		QUnit.equal(expected, ev.target.bar);
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

	var stream = canStream.toStreamFromEvent(map, 'fooList', 'length');

	stream.onValue(function(ev){
		QUnit.equal(map.fooList.length, expected, 'Event stream was updated with length: ' + map.fooList.length);
	});

	expected = 1;
	map.fooList.push(1);

	expected = 0;
	map.fooList.pop();

});


test('Create a stream from a compute with shorthand method: toStream', function() {
	var expected = 0;
	var c1 = compute(0);

	var resultCompute = canStream.toStream(c1);

	resultCompute.onValue(function (val) {
		QUnit.equal(val, expected);
	});

	expected = 1;
	c1(1);

});

test('Create a stream from an observable and property with shorthand method: toStream', function() {

	var expected = "bar";
	var map = {
		foo: "bar"
	};
	var stream = canStream.toStream(map, '.foo');

	stream.onValue(function(ev){
		QUnit.equal(ev, expected);
	});


	expected = "foobar";
	map.foo = "foobar";

});

test('Create a stream from an observable and property with shorthand method: canStream', function() {

	var expected = "bar";
	var map = {
		foo: "bar"
	};
	var stream = canStream(map, '.foo');

	stream.onValue(function(ev){
		QUnit.equal(ev, expected);
	});


	expected = "foobar";
	map.foo = "foobar";

});


test('Create a stream from a observable and nested property with shorthand method: toStream', function() {

	var expected = 1;
	var MyMap = DefineMap.extend({
		foo: {
			type: '*',
			value: {
				bar: 1
			}
		}
	});
	var obs = new MyMap();

	var stream = canStream.toStream(obs, ".foo.bar");

	stream.onValue(function(newVal) {
		QUnit.equal(expected, newVal);
	});

	expected = 2;
	obs.foo.bar = 2;

});




test('Create a stream from a observable and event with shorthand method: toStream', function() {
	var expected = 0;
	var MyMap = DefineMap.extend({
		fooList: {
			Type: DefineList.List,
			value: []
		}
	});
	var map = new MyMap();

	var stream = canStream.toStream(map.fooList, 'length');

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

	var stream = canStream.toStream(map, '.fooList length');

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

	var stream = canStream.toStream(map, '.fooList.length');

	stream.onValue(function(newVal){
		QUnit.equal(newVal, expected, 'Setting fooList to null');
	});

	expected = undefined;
	map.fooList = null;
});

test('Update the list to a new DefineList instance', function() {
	var expected = 0;
	var MyMap = DefineMap.extend({
		fooList: {
			Type: DefineList.List,
			value: []
		}
	});
	var map = new MyMap();

	var stream = canStream.toStream(map, '.fooList.length');

	stream.onValue(function(newVal){
		QUnit.equal(newVal, expected, 'Setting fooList to null');
	});

	expected = 0;
	map.fooList = new DefineList([]);

});

test('Pass args back to event object when dispatch is called', function() {

	var MyMap = DefineMap.extend({
		foo: {
			type: 'string',
			value: 'bar'
		}
	});

	var obs = new MyMap();
	var stream1 = canStream.toStream(obs, 'foo');

	stream1.onValue(function(ev){
		QUnit.equal(ev.args.length, 2);
	});

	obs.dispatch('foo', ['myarg', 'myargs']);

});

test("toCompute(streamMaker) can-define-stream#17", function(){
	var c = compute("a");
	var letterStream = canStream.toStreamFromCompute(c);

	var streamedCompute = canStream.toCompute(function(setStream){
		return setStream.merge(letterStream);
	});

	streamedCompute.on("change", function(ev, newVal){

	});

	QUnit.deepEqual( streamedCompute(), "a" );

	c(1);

	QUnit.deepEqual( streamedCompute(), 1 );

	c("b");

	QUnit.deepEqual( streamedCompute(), "b" );
});

test("setting test", function(){

	var c = canStream.toCompute(function(setStream){
		return setStream;
	});

	c(5);
	// listen to the compute for it to have a value
	c.on("change", function(){});

	// immediate value
	QUnit.equal( c(), 5);
});
*/
