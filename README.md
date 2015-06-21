# ractive-isomorphic (ri)
Isomorphic abstract classes, `Site` and `Page`, derived from `Ractive`

[![dependencies](https://david-dm.org/zenflow/ractive-isomorphic.svg)](https://david-dm.org/zenflow/ractive-isomorphic)
[![dev-dependencies](https://david-dm.org/zenflow/ractive-isomorphic/dev-status.svg)](https://david-dm.org/zenflow/ractive-isomorphic#info=devDependencies)
[![gitter](https://img.shields.io/badge/gitter-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/zenflow/ractive-isomorphic)

## Why?

I wanted a full-stack reusable codebase for web-apps that are 

1. isomorphic
2. fast, easy and fun to build and work on

[Read the full explanation](https://github.com/zenflow/ractive-isomorphic/blob/master/WHY.md)

## What is it?

ri is a couple of [isomorphic](http://nerds.airbnb.com/isomorphic-javascript-future-web-apps),
[abstract](https://en.wikipedia.org/wiki/Class_\(computer_programming\)#Abstract_and_concrete) 
classes, `Site` and `Page`, which can be extended to quickly and easily create awesome web-apps.

The common ancestor of both classes is [Ractive](https://github.com/ractivejs/ractive), the simplest, most powerful, 
most pleasurable-to-work-with UI library for the web that I have ever loved. <3

## Example

For now, you can check out the [sandbox app](https://github.com/zenflow/ractive-isomorphic/tree/master/sandbox).

See the [Developing ri](#developing-ri) section for instructions on how to get it running.

(Various advanced examples will be added to an examples folder, soonish.)

## Installing

#### 1. `npm install --save https://github.com/zenflow/ractive-isomorphic/tarball/master`

#### 2. Extend `ri.Site` into `MySite`: the isomorphic blue-prints for your app

A minimal example might look like this:

```js
var ri = require('ractive-isomorphic');
var fs = require('fs');
var path = require('path');
var documentTemplate = process.browser ? null : fs.readFileSync(path.join(__dirname, 'document.html'), 'utf8');
var bodyTemplate = fs.readFileSync(path.join(__dirname, 'body.html'), 'utf8');
var pages = require('./pages');

var MySite = ri.Site.extend({
	documentTemplate: documentTemplate,
	bodyTemplate: bodyTemplate,
	pages: pages
});

module.exports = MySite;

```

#### 3. Use middleware returned by `MySite.connect(options)` with [connect](https://github.com/senchalabs/connect) or [express](https://github.com/strongloop/express) HTTP server frameworks

An entry-point for your server-side code may look something like this:

```js
var connect = require('connect');
var http = require('http');
var path = require('path');
var MySite = require('../shared/MySite');
var api = require('../shared/api');

var app = connect();
app.use(MySite.connect({api: api}));
app.use(serveStatic(path.join(__dirname, '../client/build')));
http.createServer(app).listen(3000);
```

#### 4. [browserify](https://github.com/substack/browserify) and serve the isomorphic and client-side-only portions of your codebase. 

ri itself currently uses [gulp](https://github.com/gulpjs/gulp) (task-runner) for building the "sandbox" app, but 
any build system that supports or includes browserification will work just fine.

An entry-point for your client-side code may look something like this:

```js
var MySite = require('../shared/MySite');
var api = require('../shared/api');

window.site = new MySite({api: api});
```

## Getting help

* ractive-isomorphic Documentation
* [Ractive Documentation](http://docs.ractivejs.org/)
* [zenflow/ractive-isomorphic on Gitter](https://gitter.im/zenflow/ractive-isomorphic)
* [@zenflow87 on Twitter](http://twitter.com/zenflow87)

## Developing ri

First, fork [zenflow/ractive-isomorphic](https://github.com/zenflow/ractive-isomorphic) on github, then

```
git clone https://github.com/your_username_here/ractive-isomorphic
cd ractive-isomorphic
git checkout develop
npm install
npm start
```

This will get the development server up and running, which for now only serves the "sandbox". 

The sandbox is currently being used as both *the* example and *the* test. 

## Contributing

Pull requests and issues are always welcome! Please refer to [CONTRIBUTING.md](https://github.com/zenflow/ractive-isomorphic/blob/master/CONTRIBUTING.md)

## License

Copyright (c) 2015 Matthew Francis Brunetti and contributors. Released under an [MIT license](https://github.com/zenflow/ractive-isomorphic/blob/master/LICENSE).

![ri logo](https://raw.githubusercontent.com/zenflow/ractive-isomorphic/master/logo.png)