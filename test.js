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
    t.end()
  })

  store.put(0, new Buffer('0123456789'))
})

test('put then get', function (t) {
  var store = new Queued(Immediate(MemoryChunkStore(10)))

  store.put(0, new Buffer('0123456789'), function() {
    store.get(0, function(err, buf) {
      t.error(err)
      t.deepEqual(buf, new Buffer('0123456789'))
      t.end()
    })
  })
})

test('gets should be removed after put', function (t) {
  var store = new Queued(new MemoryChunkStore(10))

  store.get(0, function(err, buf) {
    t.error(err)
    t.deepEqual(buf, new Buffer('0123456789'))
  })

  store.get(0, function(err, buf) {
    t.error(err)
    t.deepEqual(buf, new Buffer('0123456789'))
  })

  store.put(0, new Buffer('0123456789'), function() {
    t.equal(store.queuedGets[0].length, 0)

    store.destroy(function (err) {
      t.error(err)
      t.end()
    })
  })
})

test('get should work after put', function (t) {
  var store = new Queued(new MemoryChunkStore(10))

  store.put(0, new Buffer('0123456789'))

  store.get(0, function(err, buf) {
    t.error(err)
    t.deepEqual(buf, new Buffer('0123456789'))
    t.end()
  })
})
