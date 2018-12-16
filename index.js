var express = require('express');
var app = express();
var path = require('path');
var handler = require('./lib/handler');

process.env.NHP_ROOT = path.join(__dirname, 'test');
process.env.NHP_CACHE = false;

app.get(/\.nhp$/, function (req, res) {
    handler(req).catch((error) => {
        return Promise.resolve({
            buffer: error.toString()
        });
    }).then((data) => {
        res.send(data.buffer);
    });
})

app.listen(8080, function () {
    console.log('Listening on port 8080');
});
