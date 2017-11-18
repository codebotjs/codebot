import path from 'path';
import fs from 'fs-extra';
import codebot from '../src/';

let writer = (item, content) => {
  //console.log(item.fullname);
};

let ops = {
  modules: [
    //path.resolve(path.join(__dirname, '/templates/angular')),
    //path.resolve(path.join(__dirname, '/templates/server')),
    path.resolve(path.join(__dirname, '/templates/experiments'))
  ],
  output: path.resolve(path.join(__dirname, '/output')),
  model: fs.readJsonSync(path.join(__dirname, '/templates/model.json')),
  //simulate: false,
  //writer
};

codebot(ops)
  .then(results => {
    //console.log('everything done');
    //console.dir(results);
    console.log('');
    results.modules.forEach( m => {
      //console.log(m);
      console.log(m.toString(true, 'source-tree'));
    });
    console.log('');
    results.modules.forEach( m => {
      console.log(m.toString(true, 'output-tree'));
    });
    results.modules.forEach( m => {
      //let templ = m.getTemplates();
      //console.log(templ);
    });
  })
  .catch(err => {
    console.log('something wrong');
    console.error(err);
  });