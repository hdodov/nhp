// Evaluates a template's render function.
// This is in a separate module to keep the template's scope clean.

module.exports = function () {
    let __render = null;
    eval(`__render = async function (${ arguments[0] }) {\n\n${ arguments[1] }\n};`);
    return __render;
};
