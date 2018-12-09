module.exports = function (__TEMPLATE__, args = {}) {
    var buffer = '',
        exports = {};

    __TEMPLATE__ = __TEMPLATE__.replace(/^(\s*<.*>\s*)$/gm, '\nbuffer += `$1`;');
    console.log(__TEMPLATE__);

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
