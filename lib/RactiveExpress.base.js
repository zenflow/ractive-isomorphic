var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var Ractive = require('ractive');
var on_client = require('on-client');
var ObsRouter = require('obs-router');
var Waitr = require('waitr');

require('./plugins/events');
require('./plugins/transitions');

// back-up & disable transitions
var transitions = {};
_.assign(transitions, Ractive.transitions);
var fake_transition = function(t){t.complete();};
for (var key in Ractive.transitions){
	Ractive.transitions[key] = fake_transition;
}

var RactiveExpress = function(opts){
	var ractive_opts = _.assign({}, opts);
};
RactiveExpress.prototype = Object.create(EventEmitter.prototype);

module.exports = RactiveExpress;