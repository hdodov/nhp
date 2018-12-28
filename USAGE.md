# Getting Started

## Prerequisites

First of all, you should have [Node.js](https://nodejs.org/) and [NPM](https://www.npmjs.com/) installed. Then, you should open a terminal, create a folder for your project, let's say `project`, and run `npm init` to create a `package.json` file for your project. Read more on that [here](https://docs.npmjs.com/about-npm/).

## Installing NHP

Once you have your project set up, you should install NHP in it by running:

```
npm install nhp --save
```

**(name pending, package not available at the moment via npm)**

or `cd` in your project root and run:

```
git init
git submodule add https://github.com/hdodov/nhp
```

## Server Setup

Once you have NHP installed, you need an http server that processes all `.nhp` requests with the NHP renderer.

### Using [Express](https://expressjs.com/)

Express is a Node.js framework that handles the nasty networking part of web servers. NHP ships with a handler function that can be used as Express middleware to handle `.nhp` requests. Here's what you need to do:

1. In the terminal, install Express in your project by running `npm install express --save`.
2. Create a script that starts the web server:

    `project/index.js`
    ```js
    var nhp = require('nhp'); // path should be './nhp' if you installed NHP as a Git submodule in the project root
    var express = require('express');

    var app = express();
    app.get(/\.nhp$/, nhp.expressHandler); // use the NHP Express handler to process requests ending in `.nhp`
    app.use(express.static('.')); // serve all other files as static files

    app.listen(8080, function () {
        console.log('Listening on port 8080');
    });
    ```
3. Create your first NHP template:

    `project/index.nhp`
    ```
    if (true) {
        <h1>Hello World!</h1>
    }
    ```
4. In the terminal, start the server by running `node index.js`.
5. Open a browser and navigate to `http://localhost:8080/index.nhp`.
6. You're using NHP!