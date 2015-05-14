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
			throw new Error('Expected lifecycle functions '+expected.join(', ')+' to be called. \r\n' +
			(self._lifecycle_methods_called?'Only '+self._lifecycle_methods_called.join(', '):'None') + ' called. \r\n' +
			'If overriding these methods, be sure to call your super-method with something like... \r\n' +
			'    "this._super.apply(this, arguments);"');
		}
	},
	_onroute: function(result){
		var self = this;
		if ((typeof result=='object') && (result!=null) && (typeof result.then=='function')){
			self._promise = result.catch(function(error){
				self.onrouteerror(error);
			});
		}
	},
	onconstruct: function(options){this._registerMethodCalled('onconstruct');},
	onconfig: function(options){this._registerMethodCalled('onconfig');},
	oninit: function(options){this._registerMethodCalled('oninit');},
	onrouteerror: function(error){
		var self = this;
		console.error('ractive-isomorphic '+('name' in self?'"'+self.name+'" page':'site') + ' onroute error: ', error.stack);
	}
};