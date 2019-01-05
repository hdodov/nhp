var fs = require('fs');
var path = require('path');
var escapeHtml = require('escape-html');

var config = require('./config');
var compile = require('./compiler');

const _functions = {};
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
const RENDER_ARGS = [
    '__dirname',
    '__filename',
    'input',
    'module',
    'exports',
    'require',
    'include',
    'echo',
    'capture'
];

class Renderer {
    static evalTemplate (filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        }).then((contents) => {
            if (config.strict) {
                contents = '"use strict";\n' + contents;
            }

            var script = compile(contents),
                render = new AsyncFunction(...RENDER_ARGS, script);

            _functions[filePath] = render;

            return Promise.resolve(render);
        });
    }

    static getFunction (filePath) {
        if (config.cache && typeof _functions[filePath] != 'undefined') {
            return Promise.resolve(_functions[filePath]);
        } else {
            return this.evalTemplate(filePath);
        }
    }

    constructor (filePath, args) {
        this.filePath = filePath;
        this.dirname = path.dirname(this.filePath);
        this.args = args || {};

        this.fn = null;
        this.resolved = false;

        this.module = {
            exports: {},
            buffer: ''
        };
    }

    loadFunction () {
        return this.constructor.getFunction(this.filePath).then(fn => this.fn = fn);
    }

    runFunction () {
        var args = [
            this.dirname,
            this.filePath,

            this.args,
            this.module,
            this.module.exports,
            this.require.bind(this),
            this.include.bind(this),
            this.echo.bind(this),
            this.capture.bind(this)
        ];

        var prom = this.fn(...args).catch(err => {
            return Promise.reject(`${ err }\n    at: ${ this.filePath }`);
        });

        if (config.printErrors) {
            prom = prom.catch(err => {
                this.module.buffer = err;
                return Promise.resolve();
            });
        }

        return prom.then(() => {
            this.resolved = true;
            return Promise.resolve(this.module);
        });
    }

    render () {
        return this.loadFunction().then(() => this.runFunction());
    }

    resolvePath (inputPath) {
        var resolved = inputPath;

        if (typeof inputPath == 'string') {
            if (inputPath.indexOf('@/') === 0) {
                resolved = path.join(config.root, inputPath.substr(2));
            } else if (inputPath[0] === '.') {
                resolved = path.join(this.dirname, inputPath);
            }
        } 

        return resolved;
    }

    require (filePath) {
        return require(this.resolvePath(filePath));
    }

    include (filePath, args, echoBuffer) {
        var absPath = this.resolvePath(filePath),
            renderer = new Renderer(absPath, args);

        return renderer.render().then((template) => {
            if (echoBuffer !== false) {
                this.echo(template.buffer);
                return Promise.resolve(template.exports);
            } else {
                return Promise.resolve(template);
            }
        });
    }

    capture (callback) {
        var cachedBuffer = this.module.buffer,
            captureBuffer = null,
            result;

        this.module.buffer = '';

        try {
            result = callback();
        } catch (error) {
            this.module.buffer = null;
            console.warn(error);
        }

        if (
            result &&
            typeof result.then == 'function' &&
            typeof result.catch == 'function'
        ) {
            return result.catch((error) => {
                this.module.buffer = null;
                console.warn(error);
            }).then(() => {
                captureBuffer = this.module.buffer;
                this.module.buffer = cachedBuffer;

                return Promise.resolve(captureBuffer);
            });
        } else {
            captureBuffer = this.module.buffer;
            this.module.buffer = cachedBuffer;

            return captureBuffer;
        }
    }

    echo (content, options) {
        if (options) {
            if (options.trim || options.strip) {
                content = content.trim();
            }

            if (options.strip) {
                content = content.replace(/(?<=^|>)\s+(?=<|$)/g, '');
            }

            if (options.escape) {
                content = escapeHtml(content);
            }
        }

        this.module.buffer += content;

        if (this.resolved) {
            console.warn('WARNING! Echoing in resolved template:', this.filePath, '(use `await`)');
        }
    }
}

module.exports = Renderer;
