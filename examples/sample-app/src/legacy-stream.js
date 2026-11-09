const Transform = require("_stream_transform");

module.exports = function upper() {
  return new Transform({
    transform(chunk, _enc, done) {
      done(null, chunk.toString().toUpperCase());
    },
  });
};
