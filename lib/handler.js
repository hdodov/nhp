var fs = require('fs');
var path = require('path');
var render = require('./renderer');

module.exports = function (req) {
    var file = path.join(process.env.NHP_ROOT, req.path);

    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    }).then(render);
};