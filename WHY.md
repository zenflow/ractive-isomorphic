# Why did I make this?

I wanted a full-stack reusable codebase for web-apps that are two things:

## 1. isomorphic

"isomorphic" (in the context of javascript) means capable of running on both the browser and the server, and 
sometimes also implies adjusting it's behavior according to which environment it's being run in.

Check out [nerds.airbnb.com/isomorphic-javascript-future-web-apps](http://nerds.airbnb.com/isomorphic-javascript-future-web-apps)

Note that if javascript isn't your thing, [your thing will probably compile to javascript](https://github.com/jashkenas/coffeescript/wiki/List-of-languages-that-compile-to-JS).

Isomorphic web apps are becoming more and more popular, and I predict they will represent a new standard of quality 
in the future (despite whether or not the term "isomorphic" is largely adopted), similar to how I imagine front-end 
development represented a new standard of quality when web apps only ran on servers.

The key benefits of isomorphic rendering of entire websites:
	
#### (a) better User eXperience. 

The first page appears in traditional server-rendered time. CSS and [initial] HTML are loaded first, allowing 
the user to begin using (i.e. looking, reading, navigating) while the client app, including javascript and other 
resources for client-side rendering, is downloaded and executed. After that happens, the website becomes interactive, 
and further navigation within the site is handled speedily (and optionally aesthetically) by the client app, which 
often eliminates the need for even a single network request. (For example, showing the same data in a different 
view would require no new data, and thus no request, whereas an app relying on server-side rendering would still 
require a round-trip.)

Thus applications of this nature offer the user the best of both server- and client- rendering -focused apps: the 
first page-load experience of server-side rendering and the subsequent page-load experience of client-side rendering.

#### (b) googleability 

Content rendered client-side-only is not indexed by search engines, and is therefore incapable of Search Engine 
Optimisation based on that content.	

## 2. fast, easy and fun to build and work on

Ideally, as much so as Ractive.

What can I say? I like my UI libraries like I like, everything, ...
