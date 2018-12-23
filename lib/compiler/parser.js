const RE_ESCAPE = "(?<!\\\\)(?:\\\\{2})*";

var contexts = [
    {
        type: 'literal',
        start: "'",
        end: new RegExp(RE_ESCAPE + "'")
    }
];

class Parser {
    constructor (input) {
        this.buffer = input;
        this.context = 'script';
    }
}

var fs = require('fs');
fs.readFile('./test.nhp', 'utf8', (err, data) => {
    if (err) {
        reject(err);
    } else {
        console.log(data.match(contexts[0].end));
    }
});