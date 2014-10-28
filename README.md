Reqwire
=======

Reqwire is an asynchronous module loader for Node.js.

Usage
=====

```javascript
// asyncModuleA.js
require('reqwire')(module, function (done) {
  someAsyncInitFunc(function () {

    done();

  });
});

// asyncModuleB.js
require('reqwire')(module, function (done) {
  someAsyncInitFunc(function () {

    done();

  });
});

// main.js
var asyncModuleA = require('./asyncModuleA');
var asyncModuleB = require('./asyncModuleB');

var asyncDependencies = [
  asyncModuleA,
  asyncModuleB
];
require('reqwire')(module, asyncDependencies, function (done) {
  // ...

  done();
});
```
