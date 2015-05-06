var Ractive = require('ractive');
var _ = require('lodash');
var on_client = require('on-client');
var common_common = {
	_: _,
	on_client: on_client,
	getUrl: function(route, params) {
		return this.root.router.toUrl(route || this.root.page.name, params);
	}
};
var Common = Ractive.extend(_.assign({}, common_common, {
	data: _.assign({}, common_common, {
	}),
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
	onconstruct: function(options){this._registerMethodCalled('onconstruct');},
	onconfig: function(options){this._registerMethodCalled('onconfig');},
	oninit: function(options){this._registerMethodCalled('oninit');}
}));
module.exports = Common;