var initialise = function(self, options, Super){
	// call super constructor
	Super.call(self, options);
	// throw error if user didnt call super method
	//self._assertMethodsCalled();
};

module.exports = initialise;