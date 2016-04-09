var async = require('async')
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
  self.store.put(index, buf, function (err) {
    if (err) {
      if (cb) cb(err)
      return;
    }
    var queuedGetsAtIndex = self.queuedGets[index];
    if (isArray(queuedGetsAtIndex)) {
      var callbacks = [];
      for (var i = 0; i < queuedGetsAtIndex.length; i++) {
        var queuedGet = queuedGetsAtIndex[i];

        (function(queuedGet) {
          callbacks.push(function (callback) {
            self.store.get(index, queuedGet.opts, function(err, buf) {
              queuedGet.cb(err, buf)
              callback(err, buf)
            })
          })
        })(queuedGet)
      }
      async.parallel(callbacks, function() {
        self.queuedGets[index] = []
        if (cb) cb(null);
      });
      return;
    }
    if (cb) cb(null);
  })
}

QueuedChunkStore.prototype.get = function (index, opts, cb) {
  if (typeof opts === 'function') return this.get(index, null, opts)

  var self = this
  var start = (opts && opts.offset) || 0
  var end = opts && opts.length && (start + opts.length)

  this.store.get(index, opts, function(err, buf) {
    if (!buf) {
      if (!isArray(self.queuedGets[index])) {
        self.queuedGets[index] = []
      }
      self.queuedGets[index].push({
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
