/*can-stream@1.1.0#can-stream*/
define([
    'require',
    'exports',
    'module',
    'can-assign',
    'can-compute',
    'can-reflect',
    'can-namespace'
], function (require, exports, module) {
    'use strict';
    var assign = require('can-assign');
    var compute = require('can-compute');
    var canReflect = require('can-reflect');
    var namespace = require('can-namespace');
    var toComputeFromEvent = function (observable, eventName) {
        var handler, lastSet;
        return compute(undefined, {
            on: function (updated) {
                handler = function (ev, val) {
                    lastSet = assign({ args: [].slice.call(arguments, 1) }, ev);
                    updated();
                };
                observable.on(eventName, handler);
            },
            off: function (updated) {
                observable.off(eventName, handler);
                lastSet = undefined;
            },
            get: function () {
                return lastSet;
            }
        });
    };
    var STREAM = function (canStreamInterface) {
        var canStream;
        var toStreamFromProperty = function (obs, propName) {
            return canStreamInterface.toStream(compute(obs, propName));
        };
        var toStreamFromEvent = function () {
            var obs = arguments[0];
            var eventName, propName, lastValue, internalCompute;
            if (arguments.length === 2) {
                internalCompute = toComputeFromEvent(obs, arguments[1]);
                return canStreamInterface.toStream(internalCompute);
            } else {
                propName = arguments[1];
                eventName = arguments[2];
                lastValue = obs[propName];
                var valuePropCompute = compute(obs, propName);
                var eventHandler;
                var propChangeHandler;
                internalCompute = compute(undefined, {
                    on: function (updater) {
                        eventHandler = function (ev, newVal, oldVal) {
                            lastValue = newVal;
                            updater(lastValue);
                        };
                        propChangeHandler = function (ev, newVal, oldVal) {
                            oldVal.off(eventName, eventHandler);
                            newVal.on(eventName, eventHandler);
                        };
                        valuePropCompute.on('change', propChangeHandler);
                        valuePropCompute().on(eventName, eventHandler);
                    },
                    off: function () {
                        valuePropCompute().off(eventName, eventHandler);
                        valuePropCompute.off('change', propChangeHandler);
                    },
                    get: function () {
                        return lastValue;
                    },
                    set: function (val) {
                        throw new Error('can-stream: you can\'t set this type of compute');
                    }
                });
                var stream = canStreamInterface.toStream(internalCompute);
                return stream;
            }
        };
        var toStream = function () {
            if (arguments.length === 1) {
                return canStreamInterface.toStream(arguments[0]);
            } else if (arguments.length > 1) {
                var obs = arguments[0];
                var eventNameOrPropName = arguments[1].trim();
                if (eventNameOrPropName.indexOf(' ') === -1) {
                    if (eventNameOrPropName.indexOf('.') === 0) {
                        return canStream.toStreamFromProperty(obs, eventNameOrPropName.slice(1));
                    } else {
                        return canStream.toStreamFromEvent(obs, eventNameOrPropName);
                    }
                } else {
                    var splitEventNameAndProperty = eventNameOrPropName.split(' ');
                    return canStream.toStreamFromEvent(obs, splitEventNameAndProperty[0].slice(1), splitEventNameAndProperty[1]);
                }
            }
            return undefined;
        };
        var toCompute = function (makeStream, context) {
            var args = canReflect.toArray(arguments);
            return canStreamInterface.toCompute.apply(this, args);
        };
        canStream = toStream;
        canStream.toStream = canStream;
        canStream.toStreamFromProperty = toStreamFromProperty;
        canStream.toStreamFromEvent = toStreamFromEvent;
        canStream.toCompute = toCompute;
        return canStream;
    };
    STREAM.toComputeFromEvent = toComputeFromEvent;
    module.exports = namespace.stream = STREAM;
});