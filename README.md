queued-chunk-store
===

###Queued .get for abstract-chunk-store compliant stores

Makes sure `store.get` always return a result finally. The callback for `store.get` is queued until a corresponding `store.put` is done.

Install
---
```
npm install queued-chunk-store
```

Usage
---
```javascript
var Queued = require('queued-chunk-store')
var MemoryChunkStore = require('memory-chunk-store') // any chunk store will work

var store = new Queued(new MemoryChunkStore(10))

// callback will execute when a .put with index 0 is done
store.get(0, function(err, buf) {
  buf.equals(new Buffer('0123456789')) // true
})

// .put will execute the queued callback for .get
store.put(0, new Buffer('0123456789'))
```

License
---
MIT. Copyright (c) [Chan Guan Hao](http://mavenave.me).
