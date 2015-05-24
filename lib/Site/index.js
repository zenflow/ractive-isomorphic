var Site = require('../util/wrap')(
	require('ractive'),
	require('./options'),
	require('./filterOptions'),
	require('./assignStaticMembers'),
	require('./initialise')
);

module.exports = Site;