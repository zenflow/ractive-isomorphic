var Promise = require('es6-promise').Promise;
module.exports = {
	half: function(num){
		return new Promise(function(resolve, reject){
			setTimeout(function(){
				resolve(num/2);
			}, 500);
		});
	}
};