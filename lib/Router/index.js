var _ = require('lodash');
var ObsRouter = require('obs-router');
var Router = function(){
	var self = this;
	ObsRouter.apply(self, arguments);
};
Router.prototype = _.create(ObsRouter.prototype);
module.exports = Router;