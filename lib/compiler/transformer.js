const RE_ECHO = /^<echo(\s[\sa-zA-Z]*)?>([\s\S]*)<\/echo\s*>$/i;

function escapeString (input) {
    return input
        .replace(/\\/g, '\\\\')
        .replace(/(\r)?\n/g, '\\n')
        .replace(/"/g, '\\"');
}

function transformMarkup (input) {
    return `echo(\`${ input }\`);\n`;
}

function transformEcho (input) {
    var match = input.match(RE_ECHO),
        options,
        content;

    if (match && match.length === 3) {
        if (typeof match[1] == 'string') {
            options = match[1].trim().split(/\s+/);
        }

        content = match[2];

        if (options && options.indexOf('plain') >= 0) {
            content = '"' + escapeString(content) + '"';
        } else {
            content = '`' + content + '`';
        }

        if (options) {
            return `echo(${ content }, {${ options.map(el => `'${el}': true`).join(', ') }});`;
        } else {
            return `echo(${ content });`;
        }
    } else {
        throw new Error('Malformed echo tag');
    }
}

module.exports = function (content, ast) {
    ast.forEach(function (node) {
        node.content = content.substring(node.start, node.end);

        if (node.type === 'echo') {
            node.content = transformEcho(node.content);
        } else if (node.type === 'markup') {
            node.content = transformMarkup(node.content);
        }
    });

    return ast.map(node => node.content).join('');
};
