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


			internalCompute = compute(undefined, {
				on: function(updated) {
					obs.on(eventName, function(ev, val) {
						lastValue = val;
						updated(lastValue);
					});
				},
				off: function() {
					obs.off(eventName);
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

			internalCompute = compute(undefined,{
				on: function(updater){
					obs[propName].on(eventName, function(ev, newVal) {
						lastValue = newVal;
						updater(lastValue);
					});
				},
				off: function(){
					// obs[propName].off(eventName);
				},
				get: function(){
					return lastValue;
				},
				set: function(val){
					lastValue = val;
				}
			});
			return canStreamInterface.toStream(internalCompute);
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
