var path = require('path');
var compile = require('./compiler');

module.exports = function (__TEMPLATE__, args = {}) {
    var buffer = '',
        exports = {};

    try {
        eval(`async function __RENDER__ () {\n${ compile(__TEMPLATE__) }\n}`);
    } catch (err) {
        console.warn(err);
        return Promise.resolve({
            buffer: __TEMPLATE__
        });
    }    

    return __RENDER__().then(() => {
        return Promise.resolve({
            buffer, exports
        });
    });
};
