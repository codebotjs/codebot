import path from 'path';
import fs from 'fs-extra';
import codebot from '../src/';

let ops = {
  modules: [
    path.resolve(path.join(__dirname, '/templates/angular')),
    path.resolve(path.join(__dirname, '/templates/server'))
  ],
  output: path.resolve(path.join(__dirname, '/output')),
  model: fs.readJsonSync(path.join(__dirname, '/templates/model.json'))
};

codebot(ops)
  .then(results => {
    //console.log('everything done');
    //console.dir(results);
    console.log('');
    results.items.forEach( m => {
      console.log(m.toString(true, 'source-tree'));
    });
    console.log('');
    results.items.forEach( m => {
      console.log(m.toString(true, 'output-tree'));
    });
  })
  .catch(err => {
    console.log('something wrong');
    console.error(err);
  });