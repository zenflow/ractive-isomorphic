var cancellableNextTick = function(fn){
	var cancelled = false;
	var cancel = function(){
		cancelled = true;
	};
	process.nextTick(function(){
		if (!cancelled){
			fn();
		}
	});
	return cancel;
};

module.exports = cancellableNextTick;