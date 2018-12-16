var fs = require('fs');
var path = require('path');
var evalFn = require('./eval');
var compile = require('./compiler');

const _functions = {};
const RENDER_ARGS = [
    '__module',
    '__dirname',
    '__filename',
    'arguments',
    'module',
    'exports',
    'require',
    'include',
    'echo'
].join(', ');

class Renderer {
    static evalFile (filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        }).then((contents) => {
            var script = compile(contents),
                render = evalFn(RENDER_ARGS, script);

            _functions[filePath] = render;

            return Promise.resolve(render);
        });
    }

    static getFunction (filePath) {
        if (typeof _functions[filePath] != 'undefined') {
            return Promise.resolve(_functions[filePath]);
        } else {
            return this.evalFile(filePath);
        }
    }

    constructor (filePath, args) {
        this.filePath = filePath;
        this.dirname = path.dirname(this.filePath);
        this.args = args;
        this.fn = null;

        this.module = {
            exports: {},
            buffer: ''
        };
    }

    loadFunction () {
        return this.constructor.getFunction(this.filePath).then((fn) => this.fn = fn);
    }

    runFunction () {
        var args = [
            this.module,
            this.dirname,
            this.filePath,

            this.args,
            this.module,
            this.module.exports,
            this.require.bind(this),
            this.include.bind(this),
            this.echo.bind(this)
        ];

        return this.fn(...args).then(() => {
            return Promise.resolve(this.module);
        });
    }

    render () {
        return this.loadFunction().then(() => this.runFunction());
    }

    require (filePath) {
        if (typeof filePath == 'string' && filePath[0] === '.') {
            filePath = path.join(this.dirname, filePath);
        }

        return require(filePath);
    }

    include (filePath, args) {
        var absPath = path.join(this.dirname, filePath),
            renderer = new Renderer(absPath, args);

        return renderer.render();
    }

    echo (content) {
        this.module.buffer += content;
    }
}

module.exports = Renderer;
