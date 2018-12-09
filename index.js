var express = require('express');
var app = express();
var path = require('path');
var handler = require('./lib/handler');

process.env.NHP_ROOT = path.join(__dirname, 'test');

app.get(/\.nhp$/, function (req, res) {
    handler(req).catch((e) => {
        return Promise.resolve(e);
    }).then((data) => {
        console.log(data);
        res.send(data.buffer);
    });
})

app.listen(8080, function () {
    console.log('Listening on port 8080');
});