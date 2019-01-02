# Getting Started

## Prerequisites

You should have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed. Then, open a terminal and create a folder for your project, let's say `project`, and run `npm init` to create a `package.json` file. Read more on that [here](https://docs.npmjs.com/about-npm/).

## Installing NHP

Once you have your project set up, you should install NHP in it by running:

```
npm install hdodov/nhp#master --save
```

**Note:** The package is currently not available on npm but the command above still installs it from the GitHub repo and lists it as a dependency.

## Server Setup

Once you have NHP installed, you need an http server that processes your NHP templates.

### Using [Express](https://expressjs.com/)

Express is a Node.js framework that handles the nasty networking part of web servers by using [middleware](https://expressjs.com/en/guide/using-middleware.html). NHP comes with support for it and using it is the easier and fastest way to get started.

1. Install Express:

    ```
    npm install express --save
    ```

2. Create folder `views` in your project.

3. In the `views` folder, create `index.nhp`:

    ```html
    if (true) {
        <h1>This is NHP!</h1>
    }
    ```

4. Create an `index.js` script in your project that will start the server:

    ```js
    var express = require('express');
    var app = express();

    app.set('view engine', 'nhp');
    app.get('/', function (req, res) {
        res.render('index');
    });

    app.listen(80, function () {
        console.log('Server listening...');
    });
    ```

    This initializes an Express app, loads NHP as a template engine, defines a route that will respond to requests for `/` (the web root) with our newly created index template, and tells the server to listen on port 8080. Read more about Express routing [here](https://expressjs.com/en/guide/routing.html).

5. Run the script in a terminal with `node index.js`.

6. Open `http://localhost/` in a browser to see your first NHP template!

#### The Express handler

Defining routes for each view in `index.js` can be intimidating, especially for someone with a PHP background, for example. To help with that, NHP has a handler function that you can set for all routes and it will serve files in a PHP manner:

```js
var nhp = require('nhp');
var express = require('express');
var app = express();

app.set('view engine', 'nhp');
app.get('*', nhp.handlers.express);
app.get('*', function (req, res) {
    // If the NHP handler couldn't respond and this middleware is reached,
    // then the requested resource likely doesn't exist.
    res.send('Not found!');
});

app.listen(80, function () {
    console.log('Server listening...');
});
```

If a file is requested, that file is served, rendering it in case it's an NHP file. If a directory is requested, such directory exists, and there's an `index.nhp` file in it - that file will be served. Otherwise, an NHP file with the name of the directory will be served. If no file is found to serve, the app will move to the next middleware function where it can handle the case. In the above script, it will respond with "Not found!"

To better grasp what this does, here are some examples of requests and how they would be served:

| Request path | Served file |
| ------------ | ----------- |
| `/` | `views/index.nhp` |
| `/index.nhp` | `views/index.nhp` |
| `/about` | `views/about/index.nhp` if it exists, or `/about.nhp` |
| `/foo/bar` | `views/foo/bar/index.nhp` if it exists, or `/views/foo/bar.nhp` |
| `/assets/style.css` | `views/assets/style.css` |

### Using the http module

If you don't want to use Express for some reason, you can use the [http](https://nodejs.org/api/http.html) and [path](https://nodejs.org/api/path.html) modules which are built-in in Node.js:

```js
var http = require('http');
var path = require('path');
var Renderer = require('nhp/lib/renderer');

var server = http.createServer(function (req, res) {
    var file = path.join(__dirname, 'views/index.nhp');
    var renderer = new Renderer(file);

    return renderer.render().then((data) => {
        res.statusCode = 200;
        res.write(data.buffer);
        res.end();
    });
});

server.listen(80);
```