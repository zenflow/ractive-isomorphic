module.exports = function(/*code*/){
    var module = {};
    eval(arguments[0]);
    return module.exports;
};