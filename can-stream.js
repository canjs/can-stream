var namespace = require('can-util/namespace');
var compute = require('can-compute');
var makeArray = require('can-util/js/make-array/make-array');

module.exports = namespace.stream = function(canStreamInterface) {
	var canStream = {};

	canStream.toStreamFromProperty = function(obs, propName) {
		return canStreamInterface.toStream(compute(obs, propName));
	};

	canStream.toStreamFromEvent = function() {
		var obs = arguments[0];
		var eventName, propName, lastValue, internalCompute;


		if(arguments.length === 2) {
			//.toStreamFromEvent(obs, event);

			eventName = arguments[1];
			lastValue = obs[eventName];
			var handler;
			internalCompute = compute(undefined, {
				on: function(updated) {
					handler = function(ev, val) {
						lastValue = val;
						updated(lastValue);
					};
					obs.on(eventName, handler);
				},
				off: function(updated) {
					obs.off(eventName, handler);
				},
				set: function(val) {
					lastValue = val;
				},
				get: function() {
					return lastValue;
				}
			});

			return canStreamInterface.toStream(internalCompute);
		} else {
			//.toStreamFromEvent(obs, propName, event);
			propName = arguments[1];
			eventName = arguments[2];
			lastValue = obs[propName];

			var valuePropCompute = compute(obs, propName);

			var eventHandler;
			var propChangeHandler;

			internalCompute = compute(undefined,{
				on: function(updater){
					eventHandler = function(ev, newVal, oldVal) {
						lastValue = newVal;
						updater(lastValue);
					};

					propChangeHandler = function(ev, newVal, oldVal) {
						oldVal.off('change', eventHandler);
						valuePropCompute.off('change', propChangeHandler);
						valuePropCompute = compute(obs, propName);
						valuePropCompute.on('change', propChangeHandler);
						newVal.on(eventName, eventHandler);
						lastValue = newVal[eventName];
						updater(lastValue);
					};

					valuePropCompute.on('change', propChangeHandler);
					obs[propName].on(eventName, eventHandler);
				},
				off: function(){
					valuePropCompute.off('change', propChangeHandler);
					obs[propName].off(eventName, eventHandler);
				},
				get: function(){
					return lastValue;
				},
				set: function(val){
					lastValue = val;
				}
			});

			var stream = canStreamInterface.toStream(internalCompute);

			return stream;
		}
	};

	//.toStream(observable, propAndOrEvent[,event])
	canStream.toStream = function() {

		if(arguments.length === 1) {
			//we expect it to be a compute:
			return canStreamInterface.toStream(arguments[0]); //toStream(compute)
		}
		else if(arguments.length > 1) {
			var obs = arguments[0];
			var eventNameOrPropName = arguments[1].trim();

			if(eventNameOrPropName.indexOf(" ") === -1) {
				//no space found (so addressing the first three)
				if(eventNameOrPropName.indexOf(".") === 0) {
					//starts with a dot
					return canStream.toStreamFromProperty(obs, eventNameOrPropName.slice(1)); //toStream(obj, "tasks")
				}
				else {
					return canStream.toStreamFromEvent(obs, eventNameOrPropName); //toStream( obj, "close")
				}
			}
			else {
				var splitEventNameAndProperty = eventNameOrPropName.split(" ");
				return canStream.toStreamFromEvent(obs, splitEventNameAndProperty[0].slice(1), splitEventNameAndProperty[1]);  //toStream(obj, "tasks add")
			}
		}
		return undefined;
	};

	canStream.toCompute = function(makeStream, context) {
		var args = makeArray(arguments);
		return canStreamInterface.toCompute.apply(this, args);
	};

	return canStream;
};
