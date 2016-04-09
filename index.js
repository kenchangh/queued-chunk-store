module.exports = QueuedChunkStore

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

function QueuedChunkStore (store) {
  if (!(this instanceof QueuedChunkStore)) return new QueuedChunkStore(store)

  this.store = store
  this.chunkLength = store.chunkLength
  this.queuedGets = {}

  if (!this.store || !this.store.get || !this.store.put) {
    throw new Error('First argument must be abstract-chunk-store compliant')
  }
}

QueuedChunkStore.prototype.put = function (index, buf, cb) {
  var self = this
  self.mem[index] = buf
  self.store.put(index, buf, function (err) {
    if (err) cb(err)

    for (var i = 0; i < )
  })
}

QueuedChunkStore.prototype.get = function (index, opts, cb) {
  if (typeof opts === 'function') return this.get(index, null, opts)

  var start = (opts && opts.offset) || 0
  var end = opts && opts.length && (start + opts.length)

  this.store.get(index, opts, function(err, buf) {
    if (err) return cb(err);

    if (!buf) {
      if (!isArray(this.queuedGets[index])) {
        this.queuedGets[index] = []
      }
      this.queuedGets[index].push({
        opts: opts,
        cb: cb,
      })
    } else {
      cb(null, buf)
    }
  });
}

QueuedChunkStore.prototype.close = function (cb) {
  this.store.close(cb)
}

QueuedChunkStore.prototype.destroy = function (cb) {
  this.store.destroy(cb)
}

function nextTick (cb, err, val) {
  process.nextTick(function () {
    if (cb) cb(err, val)
  })
}
