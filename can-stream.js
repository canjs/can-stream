var compute = require('can-compute');
var makeArray = require("can-util/js/make-array/make-array");
var assign = require("can-util/js/assign/assign");
var canEvent = require('can-event');
var namespace = require('can-util/namespace');

var canStream = function() {

	if(arguments.length === 1) {
		//we expect it to be a compute:
		return canStream.toStreamFromCompute(arguments[0]); //toStream(compute)
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
canStream.toStream = canStream;



module.exports = namespace.stream = function(canStream) {
	return canStream;
};
