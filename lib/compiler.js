module.exports = function (rawFile) {
    var code = rawFile.replace(/<template[^>]*>(.*?)<\/template>/gs, 'buffer += `$1`;');
    code = code.replace(/^([^\S\n]*)(<.*>)\s*$/gm, '$1buffer += `$1$2\n`;');
    return code;
};
