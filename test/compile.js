var fs = require('fs');
var chalk = require('chalk');

var Parser = require('./parser');
var transformer = require('./transformer');

fs.readFile('./test.nhp', 'utf8', (err, data) => {
    if (err) {
        reject(err);
    } else {
        var par = new Parser(data);
        par.parse();

        var colors = {
            'script': 'bgYellow',
            'echo': 'bgCyan',
            'markup': 'bgGreen'
        }
        par.ast.forEach(function (node, i) {
            process.stdout.write(chalk.bold[colors[node.type]](data.substring(node.start, node.end)));
        });
        console.log('\x1b[0m', par.ast);

        transformer(data, par.ast);
    }
});
