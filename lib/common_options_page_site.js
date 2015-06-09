var _ = require('lodash');
module.exports = {
	_getId: function(){return 'name' in this ? this.name : 'Site';},
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
		self.root.set('status', 500);
		console.error('ractive-isomorphic:', self._getId() + ':', error.stack);
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
	}
};