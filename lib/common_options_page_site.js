var _ = require('lodash');
module.exports = {
	_onroute: function(is_initial){
		var self = this;
		if (typeof self.onroute=='function'){
			var result = self.onroute(self.site.router.route, is_initial);
			if (result && (typeof result.then=='function')){
				result.catch(function(error){
					self.onrouteerror(error);
				});
				self.site.waitr.wrap(result);
			}
		}
	},
	onrouteerror: function(error){
		var self = this;
		self.site.set('status', 500);
		if (self.site.debug >= 0) {
			console.error(self.name + ':', error.stack);
		}
	},
	getFilteredData: function (){
		var self = this;
		var data = _.clone(self.get(''));
		delete data.route;
		_.forEach(_.keys(data), function(key){
			if ( (typeof data[key]=='function') || (_.isEqual(self.constructor.prototype.data[key], data[key])) ){
				delete data[key];
			}
		});
		return data;
	},
	log: function(level, message, data){
		var self = this;
		if (self.site.debug >= level){
			console.log(self.name+': '+message, data || '');
		}
	}
};