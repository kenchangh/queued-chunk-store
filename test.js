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
  var store = new Queued(MemoryChunkStore(10))

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

test('multiple put', function (t) {
  var store = new Queued(new MemoryChunkStore(10))

  store.get(0, function(err, buf) {
    t.error(err)
    t.deepEqual(buf, new Buffer('0123456789'))
    didGet0 = true
    maybeDone()
  })

  store.get(1, function(err, buf) {
    t.error(err)
    t.deepEqual(buf, new Buffer('1234567890'))
    didGet1 = true
    maybeDone()
  })

  store.put(0, new Buffer('0123456789'), function() {
    t.equal(store.queuedGets[0].length, 0)
  })

  store.put(1, new Buffer('1234567890'), function() {
    t.equal(store.queuedGets[1].length, 0)
  })

  var didGet0 = false
  var didGet1 = false
  function maybeDone() {
    if (didGet0 && didGet1) {
      store.destroy(function (err) {
        t.error(err)
        t.end()
      })
    }
  }
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
