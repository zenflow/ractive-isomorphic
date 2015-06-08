var _ = require('lodash');
module.exports = {
	_registerMethodCalled: function(name){
		var self = this;
		self._lifecycle_methods_called = self._lifecycle_methods_called || [];
		self._lifecycle_methods_called.push(name);
	},
	_assertMethodsCalled: function(){
		var self = this;
		var expected = ["onconstruct","onconfig","oninit"];
		if (JSON.stringify(self._lifecycle_methods_called)!=JSON.stringify(expected)){
			throw new Error(self._getName() + ' expected lifecycle functions '+expected.join(', ')+' to be called. \r\n' +
			(self._lifecycle_methods_called?'Only '+self._lifecycle_methods_called.join(', '):'None') + ' called. \r\n' +
			'If overriding these methods, be sure to call your super-method with something like... \r\n' +
			'    "this._super.apply(this, arguments);"');
		}
	},
	_onroute: function(is_initial){
		var self = this;
		var result = (typeof self.onroute=='function') && self.onroute(self.root.router.route, is_initial);
		if (result && (typeof result.then=='function')){self.root.waitr.wrap(result);}
		self.fire('route', self.root.router.route, is_initial);
	},
	_getName: function(){return 'name' in this ? this.name : 'Site';},
	onconstruct: function(options){this._registerMethodCalled('onconstruct');},
	onconfig: function(options){this._registerMethodCalled('onconfig');},
	oninit: function(options){this._registerMethodCalled('oninit');},
	onerror: function(error){
		var self = this;
		self.root.set('status', 500);
		console.error('ractive-isomorphic '+ self._getName() + ' error: ', error.stack);
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