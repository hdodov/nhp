var fs = require('fs');
var path = require('path');

const RE_FILE = /\/[^\/]+\.([^.]+)$/;

module.exports = function (req, res, next) {
    var root = req.app.get('views');
    var absPath = path.join(root, req.path);
    var fileMatch = req.path.match(RE_FILE);

    return new Promise((resolve, reject) => {
        var filePath = null;

        if (fileMatch) {
            filePath = absPath;
            fileExt = fileMatch[1];
        } else {
            filePath = path.join(absPath, '/index.nhp');
            fileExt = 'nhp';
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(err);
            } else {
                if (fileExt === 'nhp') {
                    resolve(res.render(filePath, req));
                } else {
                    resolve(res.sendFile(absPath));
                }
            }
        });
    }).catch((err) => {
        if (fileMatch) {
            next();
        } else {
            return new Promise((resolve, reject) => {
                var filePath = absPath + '.nhp';

                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        resolve();
                        next();
                    } else {
                        resolve(res.render(filePath, req));
                    }
                });
            });
        } 
    });
};
