module.exports = function (rawFile) {
    var code = rawFile.replace(/<template[^>]*>(.*?)<\/template>/gs, 'echo(`$1`);');
    code = code.replace(/^([^\S\n]*)(<.*>)\s*$/gm, '$1echo(`$1$2\n`);');
    return code;
};
