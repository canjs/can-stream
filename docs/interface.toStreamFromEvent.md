@function can-stream/type/interface.toStreamFromEvent toStreamFromEvent
@parent can-stream.types.streamInterface

@description Creates a stream on a {Observable} object that gets updated whenever the event occurs on the observable object.

@signature `canStream.toStreamFromEvent( obs, eventName )`

  Creates a stream based on event on observable

  ```js
  var canStreamKefir = require('can-stream-kefir');
  var canStream = require('can-stream');
  var canStreaming = canStream(canStreamKefir);

  var compute = require('can-compute');
  var DefineMap = require('can-define/map/map');
  var DefineList = require('can-define/list/list');

  var MyMap = DefineMap.extend({
      tasks: {
          Type: DefineList.List,
          value: []
      }
  });
  var map = new MyMap();

  var stream = canStreaming.toStreamFromEvent(map, 'tasks');

  stream.onValue(function(ev){
      console.log('map.tasks has been updated');
  });

  map.fooList.push('New task');
  ```

  @param {Observable} An observable object
  @param {String} property name

  @return {Stream} A stream.


@signature `canStream.toStreamFromEvent( obs, propName, eventName )`

  Creates a stream based on event trigger on observable property

  ```js
  var canStreamKefir = require('can-stream-kefir');
  var canStream = require('can-stream');
  var canStreaming = canStream(canStreamKefir);
  var compute = require('can-compute');
  var DefineMap = require('can-define/map/map');
  var DefineList = require('can-define/list/list');

  var MyMap = DefineMap.extend({
      tasks: {
          Type: DefineList.List,
          value: []
      }
  });
  var map = new MyMap();

  var stream = canStreaming.toStreamFromEvent(map, 'tasks', 'length');

  stream.onValue(function(ev){
      console.log('map.tasks has been updated');
  });

  map.fooList.push('New task');
  ```

  @param {Observable} An observable object
  @param {String} observable property name
  @param {String} observable event name

  @return {Stream} A stream.
