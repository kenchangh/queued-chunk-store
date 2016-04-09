var abstractTests = require('abstract-chunk-store/tests')
var Queued = require('./')
var Immediate = require('immediate-chunk-store')
var MemoryChunkStore = require('memory-chunk-store')
var FSChunkStore = require('fs-chunk-store')
var test = require('tape')

abstractTests(test, function (chunkLength) {
  return new Queued(new MemoryChunkStore(chunkLength))
})

abstractTests(test, function (chunkLength) {
  return new Queued(new FSChunkStore(chunkLength))
})

abstractTests(test, function (chunkLength) {
  return new Queued(Immediate(MemoryChunkStore(chunkLength)));
})

test('get before put', function (t) {
  var store = new Queued(new MemoryChunkStore(10))

  store.get(0, function(err, buf) {
    t.error(err)
    t.deepEqual(buf, new Buffer('0123456789'))
  })

  store.get(1, function(err, buf) {
    t.error(err)
    t.deepEqual(buf, new Buffer('0123456789'))
  })

  store.put(0, new Buffer('0123456789'))

  store.put(1, new Buffer('0123456789'))

  t.end()
})
