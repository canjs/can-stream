@module {Object} can-stream can-stream
@parent can-ecosystem
@group can-stream.fns 1 Methods
@package ../package.json

@description Exports a function that takes a can-stream interface (like [can-stream-kefir(https://github.com/canjs/can-stream-kefir)) and uses it internally to provide the stream functionality.

@type {Object}

  The `can-stream` module exports methods Exports a function that takes a can-stream interface and returns an object with the following methods:

  - `.toStream(observable, propAndOrEvent)`
  - `.toStreamFromProperty(property)`
  - `.toStreamFromEvent(property)`
  - `.toCompute(makeStream(setStream), context):compute`

@body

## Usage

The [can-stream] method has shorthands for all of the other methods:

```
var canStream = require("can-stream");

var canStreaming = canStream(canStreamingInterface);

canStreaming.toStream(compute)                    //-> stream
canStreaming.toStream(map, "eventName")           //-> stream
canStreaming.toStream(map, ".propName")           //-> stream
canStreaming.toStream(map, ".propName eventName") //-> stream
```

For example:

__Converting a compute to a stream__

```js
var canCompute = require("can-compute");
var canStreamKefir = require("can-stream-kefir");
var canStream = require("can-stream");

var canStreaming = canStream(canStreamKefir);

var compute = canCompute(0);
var stream = canStreaming.toStream(compute);

stream.onValue(function(newVal){
	console.log(newVal);
});

compute(1);
//-> console.logs 1
```

__Converting an event to a stream__

```js
var DefineList = require('can-define/list/list');
var canStreamKefir = require("can-stream-kefir");
var canStream = require("can-stream");

var canStreaming = canStream(canStreamKefir);

var hobbies = new DefineList(["js","kayaking"]);

var changeCount = canStreaming.toStream(obs, "length").scan(function(prev){
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

__Converting a property value to a stream__

```js
var canStreamKefir = require("can-stream-kefir");
var canStream = require("can-stream");

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

__Converting an event on a nested object into a stream__

```js
var canStreamKefir = require("can-stream-kefir");
var canStream = require("can-stream");

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
