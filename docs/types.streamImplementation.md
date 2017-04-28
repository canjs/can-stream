@typedef {Object} can-stream.types.streamImplementation StreamImplementation
@parent can-stream.types

@description Export an object with a minimal implementation of `toStream` and `toCompute` methods specific to a streaming library like [Kefir](https://rpominov.github.io/kefir/)

@type {Object}
  An object with `toStream` and `toCompute` methods.

```js
var streamImplementation = {
	toStream: function(compute){
		return MAKE_THE_STREAM_FROM_A_COMPUTE(compute);
	},
	toCompute: function(makeStream, context){
		var setStream = MAKE_A_SETTABLE_STREAM_THAT_IS_SET_WHEN_COMPUTE_IS_SET();
		var stream = makeStream.call(context, setStream);

		var compute = MAKE_COMPUTE_TO_HAVE_VALUE_FROM_stream_AND_SET_TO_setStream;

		return compute;
	}
};

var canStream = require("can-stream");

var streamInterface = canStream(streamImplementation);

var map = new DefineMap({name: "John"});
streamInterface(map, ".name") //-> an instance of the stream library.

module.exports = streamInterface;
```

	@option {can-stream/type/implementation.toStream} toStream

  @option {can-stream/type/implementation.toCompute} toCompute

@body

## Use

See [can-stream-kefir] for example implementation.
