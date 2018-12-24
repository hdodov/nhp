const RE_WHITESPACE = /\s/;
const CH_NEWLINE= "\n\r\u2028\u2029";

class Parser {
    constructor (input) {
        this.content = input;
        this.ast = [];

        this.index = 0;
        this.node = null;
        this.context = null;
        
        this.startLine();
        this.setContext('script');
    }

    setContext (type, index = this.index) {
        if (this.node) {
            this.node.end = index;

            if (this.node.end - this.node.start > 0) {
                this.ast.push(this.node);
            }
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
        if (this.context === 'markup' && this.lineLastPrintChar === '>') {
            this.setContext('script');
        }
    }

    char (offset = 0) {
        return this.content.charAt(this.index + offset);
    }

    read () {
        var ch = this.char();
  
        if (!RE_WHITESPACE.test(ch)) {
            if (this.lineFirstPrintChar === null) {
                this.lineFirstPrintChar = ch;
            }

            this.lineLastPrintChar = ch;
        }

        if (this.lineFirstPrintChar === '<' && this.context !== 'markup') {
            this.setContext('markup', this.lineIndex);
        }

        if (CH_NEWLINE.indexOf(ch) >= 0) {
            if (!(ch === '\r' && this.char(1) === '\n')) {
                this.endLine();
                this.startLine();
            }
        }

        this.index++;
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

        par.ast.forEach(function (node, i) {
            console.log(`${ node.type } ${i}:`, data.substr(node.start, node.end - node.start));
        });
        console.log(par.ast);
    }
});