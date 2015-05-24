var Site = require('../util/wrap')(
	require('ractive'),
	require('./options'),
	require('./filterOptions'),
	require('./static'),
	require('./initialise')
);

module.exports = Site;