module.exports = function (rawFile) {
    var code = rawFile.replace(/^([^\S\n]*)<echo[^>]*>(.*?)<\/echo>/gms, 'echo(`$1$2\n`);');
    code = code.replace(/^([^\S\n]*)(<.*>)\s*$/gm, '$1echo(`$1$2\n`);');
    return code;
};
