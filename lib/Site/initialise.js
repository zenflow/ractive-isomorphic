var _ = require('lodash');
var Waitr = require('waitr');

var initialise = function(self, options, Super){
	// call super constructor
	Super.call(self, options);

	// throw error if no page mounted
	if (!self.page){throw new Error('No page was mounted. Did you forget to include {{>content}} somewhere in your body template?');}

	// throw error if user didnt call super method
	self._assertMethodsCalled();
	self.page._assertMethodsCalled();

	self._route_waiter = new Waitr;
	self._route_waiter.wait()();
	_.forEach(['waiting', 'ready'], function(name){
		self._route_waiter.on(name, function(){self.fire(name);});
	});

	// track initial route execution
	self._trackRouteExecution();
};

module.exports = initialise;