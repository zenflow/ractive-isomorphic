var _ = require('lodash');
module.exports = {
	_getId: function(){return 'name' in this ? this.name : 'Site';},
	onerror: function(error){
		var self = this;
		self.root.set('status', 500);
		console.error('ractive-isomorphic '+ self._getId() + ' error: ', error.stack);
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