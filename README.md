<big><h1 align="center">{--} CodebotJS</h1></big>

<p align="center">
  <a href="https://npmjs.org/package/codebot">
    <img src="https://img.shields.io/npm/v/codebot.svg?style=flat-square"
         alt="NPM Version">
  </a>

  <a href="https://travis-ci.org/delmosaurio/codebot">
    <img src="https://img.shields.io/travis/delmosaurio/codebot.svg?style=flat-square"
         alt="Build Status">
  </a>

  <a href="https://npmjs.org/package/codebot">
    <img src="http://img.shields.io/npm/dm/codebot.svg?style=flat-square"
         alt="Downloads">
  </a>

  <a href="https://david-dm.org/delmosaurio/codebot.svg">
    <img src="https://david-dm.org/delmosaurio/codebot.svg?style=flat-square"
         alt="Dependency Status">
  </a>

  <a href="https://github.com/delmosaurio/codebot/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/codebot.svg?style=flat-square"
         alt="License">
  </a>
</p>

***This project is under development***

Codebot is the easy way to make applications from templates.

The idea is that you need to write the code one time, then use a model.

Think an application, write it as templates and then use to make multiple apps changin the model, if you improve something, change the templates and every app will take the benefit.

### Install

```sh
npm i --save-dev codebot
```

### Templates

Codebot use [ejs](https://www.npmjs.com/package/ejs) as default template engine

If the `src` is not defined on `/path/from/module/codebot.json`, the templates will be searched on the `/path/from/module/src/` folder

### Directives to filenames and folders

directive|usage      |description
---------|-----------|-----------
\#       |\#layername|layer/folder names
@        |@filename  |automatic file
!        |!filename  |injector file (not supported yet)
${}      |${target}  |dynamics names
$this    |${$this}   |current dynamic name from parent

**Modifiers**
  
character|usage     |description
---------|----------|-----------
l        |$l{target}|write the target as [lowerCase*](https://lodash.com/docs#lowerCase)
u        |$u{target}|write the target as [upperCase*](https://lodash.com/docs#upperCase)
c        |$c{target}|write the target as [camelCase*](https://lodash.com/docs#camelCase)
s        |$s{target}|write the target as [snakeCase*](https://lodash.com/docs#snakeCase)
k        |$k{target}|write the target as [kebabCase*](https://lodash.com/docs#kebabCase)
p        |$p{target}|write the target as [capitalize*](https://lodash.com/docs#capitalize)

**please see the [lodash](https://lodash.com/docs) documentation*

**Configuration file**

```js
// codebot.json
{
  "src": "the_source/",
  "ignore": [ "some_file/expression" ]
}
```

*NOTE:* you can set the config into the `package.json` like 

```js
{
  "name": "my-awesome-template",
  ....
  "codebot": {
    "src": "the_source/"
  }
  ....
}
```

## Usage

```js
import codebot from 'codebot';

let model = {
  foo: 'bar'
};

let ops = {
  modules: [
    '/path/from/templates/module1',
    'path/from/templates/module2'
  ],
  output: '/path/to/',
  model: model
};

codebot(ops)
  .then(results => {
    // all tamplates are processed

    // show the trees
    results.modules.forEach( m => {
      console.log(m.toString(true, 'source-tree'));
    });
    console.log('');
    results.modules.forEach( m => {
      console.log(m.toString(true, 'output-tree'));
    });
  })
  .catch(err => {
    console.log(err);
  });
```

**The inject file example** *(not supported yet)*

*the transpiler match a full line with the `codebot:inject` thing*

```js
  // !some.js
  // inject:codebot
  console.log($this.name);
  // endinject
```

```html
  // !some.html
  <!-- inject:codebot -->
  <h1><%= $this.title %></h1>
  <!-- endinject -->
```

## Usage with gulp

```
npm i --save-dev gulp-codebot
```

```js
var codebot = require('gulp-codebot');

var modules = [
  '/path/from/templates/module1',
  '/path/from/templates/module2'
];

gulp.src('./model.json')
    .pipe(codebot({ modules: modules }))
    .pipe(gulp.dest('./src'));
```

## Example

```js
//model.json
{
  layer: {
    'app': './client/app',
    'routes': './server/routes'
  },
  target: {
    'actor': { 
      plurals: 'actors',
      view: {
        'add': {/*view stuff*/}
      }
    },
    'director': { 
      plurals: 'directors',
      view: {
        'add': {/*view stuff*/}
      }
    },
    'movie': { 
      plurals: 'movies',
      view: {
        'add': {/*view stuff*/},
        'edit': {/*view stuff*/},
        'search': {/*view stuff*/},
      }
    }
  }
}
```

**Templates example**

```js
// /path/from/angular/src/
- #app
  - ${target}
    - @${$current}.controller.js
    - @${$current.view}.html
    - !config.js
  - @app.config.js
  - app.js
```

```js
// /path/from/api/src/
- #routes
  - @${target.plurals}.js
```

**The output**

```js
./client/app/actor/actor.controller.js       // writed every time
./client/app/actor/config.js                 // writed/injected every time
./client/app/actor/add.html                  // writed every time

./client/app/director/director.controller.js // writed every time
./client/app/director/config.js              // writed if the output is not exists
./client/app/director/add.html               // writed every time

./client/app/movie/movie.controller.js       // writed every time
./client/app/movie/config.js                 // writed if the output is not exists
./client/app/movie/add.html                  // writed every time
./client/app/movie/edit.html                 // writed every time
./client/app/movie/search.html               // writed every time

./client/app/app.config.js                   // writed every time
./client/app/app.js                          // writed if the output is not exists

./server/routes/actors.js                    // writed every time
./server/routes/directors.js                 // writed every time
./server/routes/movies.js                    // writed every time
```

## License

MIT © [Delmo](https://github.com/delmosaurio/codebot)

[npm-url]: https://npmjs.org/package/codebot
[npm-image]: https://img.shields.io/npm/v/codebot.svg?style=flat-square

[travis-url]: https://travis-ci.org/delmosaurio/codebot
[travis-image]: https://img.shields.io/travis/delmosaurio/codebot.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/delmosaurio/codebot
[coveralls-image]: https://img.shields.io/coveralls/delmosaurio/codebot.svg?style=flat-square

[depstat-url]: https://david-dm.org/delmosaurio/codebot
[depstat-image]: https://david-dm.org/delmosaurio/codebot.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/codebot.svg?style=flat-square
