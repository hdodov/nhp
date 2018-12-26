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
            if (index - this.node.start > 0) {
                this.node.end = index;
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
        if (
            this.lineLastPrintChar === '>' &&
            this.context === 'markup'
        ) {
            this.setContext(null);
        }

        this.lineIndex = this.index;
        this.lineFirstPrintChar = null;
        this.lineLastPrintChar = null;
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
                this.beginLine = true;
            }
        }
    }

    parse () {
        while (this.index < this.content.length) {
            this.next();
            this.checkToken();
        }

        this.setContext(null);
    }
}

module.exports = Parser;
