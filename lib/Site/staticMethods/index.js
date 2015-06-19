module.exports =  {
	extend: require('./extend'),
	connect: process.browser ? null : require('./connect'),
	_filterOptions: require('./_filterOptions')
};