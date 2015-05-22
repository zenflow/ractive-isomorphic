var mapObject = function(obj, iterator, self){
	var result = {};
	for (var key in obj){
		result[key] = iterator.call(self || null, obj[key], key);
	}
	return result;
};
module.exports = mapObject;