var _ = require('lodash');
var Ractive = require('ractive');

var fake_transition = function(t){t.complete();};
var transitions = null;

var toggleTransitions = function(toggle){
	if (toggle==undefined){
		return !transitions;
	}
	if (toggle){
		if (!transitions){return;}
		_.assign(Ractive.transitions, transitions);
		transitions = null;
	} else {
		if (transitions){return;}
		transitions = {};
		_.assign(transitions, Ractive.transitions);
		for (var key in Ractive.transitions){
			Ractive.transitions[key] = fake_transition;
		}
	}
};

module.exports = toggleTransitions;