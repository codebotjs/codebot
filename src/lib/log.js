'use strict';

import log from 'npmlog';

export default function({ stdout=process.stderr, level='verbose' }){
  log.level  =  level;
  log.stream = stdout;

  log.enableColor();

  return log;
}