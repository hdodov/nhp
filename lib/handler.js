var path = require('path');
var Renderer = require('./renderer');

module.exports = function (req) {
    var file = path.join(process.env.NHP_ROOT, req.path);
    var inst = new Renderer(file, req);

    return inst.render();
};
