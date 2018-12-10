module.exports = function (__TEMPLATE__, args = {}) {
    var buffer = '',
        exports = {};

    __TEMPLATE__ = __TEMPLATE__.replace(/<template[^>]*>(.*?)<\/template>/gs, 'buffer += `$1`;');
    __TEMPLATE__ = __TEMPLATE__.replace(/^([^\S\n]*)(<.*>)\s*$/gm, '$1buffer += `$1$2\n`;');

    try {
        eval(`async function __RENDER__ () {\n${__TEMPLATE__}\n}`);
    } catch (err) {
        return Promise.reject(err);
    }    

    return __RENDER__().then(() => {
        return Promise.resolve({
            buffer, exports
        });
    });
};
