import path from 'path';
import fs from 'fs-extra';
import codebot from '../src/';


let ops = {
  sources: [
    path.resolve('./templates/angular'),
    path.resolve('./templates/server')
  ],
  output: path.resolve('./output'),
  model: fs.readJsonSync('./templates/model.json')
};

codebot(ops)
  .then(results => {
    console.log('everything done');
    console.dir(results);
  })
  .catch(err => {
    console.log('something wrong');
    console.error(err);
  });