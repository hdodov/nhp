var path = require('path');
var escape = require('escape-html');
var config = require('./lib/config');
var Renderer = require('./lib/renderer');

exports.expressHandler = function (req, res) {
    var file = path.join(config.webRoot, req.path);
    var renderer = new Renderer(file, req);

    return renderer.render().catch((error) => {
        return Promise.resolve({
            buffer: `<pre>${ escape(error.stack || error) }</pre>`
        });
    }).then((data) => {
        res.send(data.buffer);
    });
};

exports.config = function (settings) {
    for (var k in settings) {
        config[k] = settings[k];
    }

    return exports;
};
