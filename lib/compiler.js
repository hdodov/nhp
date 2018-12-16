module.exports = function (rawFile) {
    var code = rawFile.replace(/<template[^>]*>(.*?)<\/template>/gs, '__module.buffer += `$1`;');
    code = code.replace(/^([^\S\n]*)(<.*>)\s*$/gm, '$1__module.buffer += `$1$2\n`;');
    return code;
};
