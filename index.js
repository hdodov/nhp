var config = require('./lib/config');
var Renderer = require('./lib/renderer');

exports.__express = function (file, options, callback) {
    var renderer = new Renderer(file, options);

    return renderer.render().then((data) => {
        callback(null, data.buffer);
    }).catch(callback);
};

exports.config = function (settings) {
    for (var k in settings) {
        config[k] = settings[k];
    }
};
