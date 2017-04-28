@function can-stream/type/interface.toStream toStream
@parent can-stream.types.streamInterface

@description Provides a shorthand for creating a stream from observable objects, properties and
events.

@signature `canStream.toStream( observable, propAndOrEvent )`

  Creates a stream from a [can-compute] compute or an observable. This stream gets updated whenever the observable value changes.

  ```js
  var compute = require('can-compute');
  var canStreamKefir = require('can-stream-kefir');
  var canStream = require('can-stream');
  var canStreaming = canStream(canStreamKefir);

  var c1 = compute(0);

  var resultCompute = canStreaming.toStream(c1);

  resultCompute.onValue(function (val) {
    console.log(val);
  });

  c1(1);
  ```

  @param {can-compute} compute A compute whose value will be the stream values.

  @return {Stream} A stream object.

@signature  `canStream.toStream( observable, "eventName" )`

  Creates an event stream with the event objects dispatched on `obs` for `eventName`.
  This is a shorthand for [can-stream.toStreamFromEvent].

  ```js
  var DefineList = require('can-define/list/list');
  var canStream = require('can-stream-kefir');
  var canStream = require('can-stream');
  var canStreaming = canStream(canStreamKefir);

  var hobbies = new DefineList(["js","kayaking"]);

  var changeCount = canStreaming.toStream(hobbies, "length").scan(function(prev){
	  return prev + 1;
  }, 0);
  changeCount.onValue(function(event) {
      console.log(event);
  });

  hobbies.push("bball")
  //-> console.logs {type: "add", args: [2,["bball"]]}
  hobbies.shift()
  //-> console.logs {type: "remove", args: [0,["js"]]}
  ```

  @param {Observable} observable An observable object like a [can-define/map/map].
  Promises can work too.
  @param {String} eventName An observable event name.

  @return {String} A stream make up of the event objects dispatched on `obs`.


@signature `canStream.toStream( observable, ".propName" )`

  Creates a stream from an observable property value. This is a shorthand for [can-stream.toStreamFromProperty].

  ```js
  var canStreamKefir = require('can-stream-kefir');
  var canStream = require('can-stream');
  var canStreaming = canStream(canStreamKefir);

  var DefineMap = require("can-define/map/map");

  var person = new DefineMap({
      first: "Justin",
	  last: "Meyer"
  });

  var first = canStreaming.toStream(person, '.first'),
      last = canStreaming.toStream(person, '.last');

  var fullName = Kefir.combine(first, last, function(first, last){
	  return first + last;
  });

  fullName.onValue(function(newVal){
      console.log(newVal);
  });

  map.first = "Payal"
  //-> console.logs "Payal Meyer"
  ```

  Create a stream based on a event on an observable property.

  @param {Observable} obs An observable object like a [can-define/map/map].
    Promises can work too.
  @param {String} propName A property name.  Multiple property names can be provided like `".foo.bar.car"`

  @return {String} A stream of values at the specified `propName`.

@signature `canStream.toStream( obs, ".propName eventName" )`

  Creates a stream from an observable property value. This is a shorthand for the second signature of [can-stream.toStreamFromEvent].

  ```js
  var canStreamKefir = require('can-stream-kefir');
  var canStream = require('can-stream');
  var canStreaming = canStream(canStreamKefir);

  var DefineMap = require("can-define/map/map");
  var DefineList = require("can-define/list/list");

  var me = new DefineMap({
      todos: ["mow lawn"]
  });

  var addStream = canStreaming.toStream(me, ".todos add");

  addStream.onValue(function(event){
      console.log(event);
  });

  map.todos.push("do dishes");
  //-> console.logs {type: "add", args: [1,["do dishes"]]}
  ```

  Create a stream based on a event on an observable property.

  @param {Observable} obs An observable object like a [can-define/map/map].
    Promises can work too.

  @param {String} propName A property name.  Multiple property names can be provided like `".foo.bar.car"`
  @param {String} eventName An observable event name.
  @return {String} A stream of the `eventName` event objects dispatched on the objects specified by `propName`.
