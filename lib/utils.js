var path = require('path');
var config = require('./config');

exports.path = function (inputPath, relativeTo) {
    var resolved = inputPath;

    if (typeof inputPath == 'string') {
        if (inputPath.indexOf('@/') === 0) {
            resolved = path.join(config.projectRoot, inputPath.substr(2));
        } else if (inputPath.indexOf('#/') === 0) {
            resolved = path.join(config.webRoot, inputPath.substr(2));
        } else if (inputPath[0] === '.' && typeof relativeTo == 'string') {
            resolved = path.join(relativeTo, inputPath);
        }
    }

    return resolved;
};
