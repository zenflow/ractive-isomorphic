var initialise = function(self, options, Super){
	// call super constructor
	Super.call(self, options);

	// throw error if user didnt call super method
	self._assertMethodsCalled();
	self.page._assertMethodsCalled();

	// track initial route execution
	self._trackRouteExecution();
};

module.exports = initialise;