const RE_WHITESPACE = /\s/;
const RE_ECHO_START = /^<echo(?:\s[^>]*)?>/i;
const RE_ECHO_END = /<\/echo\s*>/i;
const CH_NEWLINE= "\n\r\u2028\u2029";

class Parser {
    constructor (input) {
        this.content = input;
        this.ast = [];

        this.index = -1;
        this.node = null;
        this.context = null;
        this.beginLine = true;
    }

    char (offset = 0) {
        return this.content.charAt(this.index + offset);
    }

    peek (length) {
        return this.content.substr(this.index, length);
    }

    remainder () {
        return this.content.substring(this.index);
    }

    forward (iterations) {
        while (iterations-- > 0) {
            this.next();
        }
    }

    setContext (type, index = this.index) {
        if (this.node) {
            this.node.end = index;

            if (this.node.end - this.node.start > 0) {
                this.ast.push(this.node);
            }

            this.node = null;
        }

        if (type) {
            this.node = {
                type,
                start: index,
                end: null
            };
        }

        this.context = type;
    }

    startLine () {
        this.lineIndex = this.index;
        this.lineFirstPrintChar = null;
        this.lineLastPrintChar = null;
    }

    endLine () {
        if (
            this.lineLastPrintChar === '>' &&
            this.context === 'markup'
        ) {
            this.setContext(null);
        }

        this.beginLine = true;
    }

    readEcho () {
        var match = this.remainder().match(RE_ECHO_END);
        if (match && match.length) {
            this.forward(match.index + match[0].length);
            this.setContext(null);
        } else {
            throw new Error('Unclosed <echo> tag');
        }
    }

    checkToken () {
        if (
            this.lineFirstPrintChar === '<' &&
            this.context !== 'markup' &&
            this.context !== 'echo'
        ) {
            if (RE_ECHO_START.test(this.remainder())) {
                this.setContext('echo');
                this.readEcho();
            } else {
                this.setContext('markup', this.lineIndex);
            }
        }

        if (!this.context) {
            this.setContext('script');
        }
    }

    next () {
        this.index++;
        var ch = this.char();
        // console.log(`next ${this.index}: ${ch}`);

        if (this.beginLine) {
            this.beginLine = false;
            this.startLine();
        }
  
        if (!RE_WHITESPACE.test(ch)) {
            if (this.lineFirstPrintChar === null) {
                this.lineFirstPrintChar = ch;
            } else {
                // First printable character passed
                this.lineFirstPrintChar = false;
            }

            this.lineLastPrintChar = ch;
        }

        if (CH_NEWLINE.indexOf(ch) >= 0) {
            if (!(ch === '\r' && this.char(1) === '\n')) {
                this.endLine();
            }
        }
    }

    read () {
        this.next();
        this.checkToken();
    }

    parse () {
        while (this.index < this.content.length) {
            this.read();
        }

        this.setContext(null);
    }
}

var fs = require('fs');
fs.readFile('./test.nhp', 'utf8', (err, data) => {
    if (err) {
        reject(err);
    } else {
        var par = new Parser(data);
        par.parse();

        var colors = {
            'script': '\x1b[33m',
            'echo': '\x1b[36m',
            'markup': '\x1b[32m'
        }
        par.ast.forEach(function (node, i) {
            process.stdout.write(colors[node.type] + data.substring(node.start, node.end));
        });
        console.log('\x1b[0m', par.ast);
    }
});