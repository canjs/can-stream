@typedef {function} can-stream.types.makeStream makeStream
@parent can-stream.types

@description This function takes a stream whose values are bound to the returned [can-compute.computed].

@signature `makeStream(setStream)`

```js
var Kefir = require('kefir');
var count = Kefir.sequentially(1000, [1, 2]);

var myCompute = canStream.toCompute(function(setStream) {
	return setStream.merge(count);
});
```

@param {Stream} setStream A stream to bind to the returned [can-compute.computed].
