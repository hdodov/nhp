var Parser = require('./parser');
var transform = require('./transformer');

module.exports = function (content) {
    var parser = new Parser(content);
    parser.parse();

    return transform(content, parser.ast);
};
