# NHP

Stands for Node Hypertext Preprocessor and is a templating engine for Node.js. It's inspired by PHP but does things the Node way.

## Syntax

Usually, template engines run in the markup context by default and it can be exited to implement some programming logic. In PHP, for example, you have `<?php` and `?>` to change the context.

In NHP, things are flipped and the default context is the programming one (JavaScript), while the markup context can be switched either explicilty or implicitly. There are two rules:

1. Any line that begins with `<`, ignoring preceding whitespace, marks the start of the markup context. A line that ends with `>`, ignoring trailing whitespace, marks the end of the markup context.

```
if (cond() === true) {
    <h1>Hey, the condition is true</h1>
} 
```

In the above code, the second line is considered markup and is added to the template buffer (the rendered markup).

2. To explicitly switch to the markup context (in multiline output, for example), you use the special `<echo>` tag:

```
if (true) {
    <echo>
        <p>
            multiline
            content
        </p>
    </echo> // js comment
}
```

The echo tag partly follows the first rule, meaning that its opening `<` must be the first symbol of the line. The reason for that is simplicity - if a line starts with `<`, you always know that the following is markup. However, unlike implicit markup, the echo context ends where the `</echo>` tag appears, regardless of where in the line it is. The following is always JavaScript, hence the "js comment" above.

If you use Sublime Text, you can install the [NHP syntax highlighting plugin](http://example.com/) and you'll get used to it pretty quick.

## Features

### Modularity

NHP templates are very similar to Node.js modules - they also have a [wrapper function](https://nodejs.org/api/modules.html#modules_the_module_wrapper) and they use `module` and `module.exports` in the same manner to export data. This means that each template runs in its own scope. Templates also have the `module.buffer` property which holds the rendered markup.

### Expressions

In most cases, markup is compiled down to [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), meaning that you can use embedded expressions:

```
<ul>
    for (var i = 0; i < 5; i++) {
        <li data-index="${ i }">Item ${ i + 1 }</li>
    }
</ul>
```

This can be a double-edged sword because usage of backticks (`` ` ``) and/or backslashes (`\`) can cause errors. The compiled template would look like this:

```js
for (var i = 0; i < 5; i++) {
    echo(`<li data-index="${ i }">Item ${ i + 1 }</li>`);
}
```

If you have any unescaped backticks in the markup, they would terminate the template literal, causing an error. To output plain text where you can safely put anything, you'll have to use the `<echo>` tag with its `plain` option (described below).

### Echo tags

The special `<echo>` tags are used to explicitly denote start and end of markup. They are omitted from the rendered markup and are used solely by the compiler. They also have the following options (specified as HTML attributes) to alter its behavior:

- `plain` the markup is parsed as a plain string, meaning that it will be compiled with quotes `"` instead of backticks `` ` `` and all backslashes, double quotes and newlines will be escaped
- `trim` remove beginning and ending whitespace
- `strip` same as `trim` but also removes whitespace between tags
- `escape` HTML special characters are escaped

For example:

```html
<echo plain escape>`${"<testing>"`</echo>
```

Will be compiled to:

```js
echo("`${&quot;&lt;testing&gt;&quot;`");
```

### Asynchronicity

Each template is compiled to an [async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function), meaning that you can use [await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) to output asynchronous content (fetching something from an API, database, etc.):

```
var promises = [];

for (var i = 0; i < 5; i++) {
    let wait = Math.random() * 500;

    promises.push(
        new Promise((resolve, reject) => {
            setTimeout(() => {
                <h1>Waited ${ wait }ms!</h1>
                resolve();
            }, wait);
        })
    );
}

await Promise.all(promises);

<p>Markup continues...</p>
```

Output:

```html
<h1>Waited 171.100590117081ms!</h1>
<h1>Waited 189.2388663763811ms!</h1>
<h1>Waited 213.76346180410644ms!</h1>
<h1>Waited 295.15017108664875ms!</h1>
<h1>Waited 455.11976793144237ms!</h1>
<p>Markup continues...</p>
```

### Including templates

In an NHP template, you can use the `include()` function to render another template in the current one. You can also pass data to the included template that can be accessed via the `arguments` variable. That template, on the other hand, can export some data back to the including template:

parent.nhp:
```
var child = await include('./child.nhp', {
    name: 'John'
});

<h1>Value: ${ child.value }</h1>
```

child.nhp:
```
<p>${ arguments.name.toUpperCase() }</p>
exports.value = 42;
```

Output:

```html
<p>JOHN</p>
<h1>Value: 42</h1>
```

**Note:** We use `await` to make sure that the execution of the parent template continues only after the child has resolved. That's because (as mentioned above) each template is rendered by an async function. If we omit the `await` keyword, we would get a warning in the console and the following output:

```html
<h1>Value: undefined</h1>
```

### Requiring modules

Templates can use the `require()` function like any Node.js module to get access to other modules. This means we can use _all packages in the NPM registry_, as well as our own modules:

```
var ms = require('ms');
var data = require('./data.json');

<h1>${ ms(Math.random() * 10e4) }</h1>
<pre>${ data.text }</pre>
```

In this example, we use the [ms](https://www.npmjs.com/package/ms) utility and we also require a local JSON file that looks like this:

```json
{
    "text": "This is JSON!"
}
```

Output:

```
<h1>43s</h1>
<pre>This is JSON!</pre>
```

# Getting started

- Read the [Getting Started](#) document for a quick and easy guide to set up NHP.
- If you use Sublime Text, you should install [the syntax highlighting plugin for NHP].
- Finally, you might want to read the [API Reference](#) for a deeper explanation of the features.

**WARNING:** This is experimental technology and use in production for serious projects is **not** recommended at this point.

# License

GPL-3.0