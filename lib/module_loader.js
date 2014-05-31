module.exports = function(/*code*/){
    return eval('(function(){var module = {}; '+arguments[0]+' return module.exports;})()');
};