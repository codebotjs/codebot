'use strict';

/**
 * Utils
 */

import XRegExp from 'xregexp';
import _ from 'lodash';

const utils = {
  // Regular exrepssion to parse templates names
  regex: {
    isLayer: /^#.+$/i,
      layer: XRegExp('^[#]{1}(?<accesor>.+$)', 'x'),
      isAuto: /^@.*$/i,
      isInject: /^!.*$/i,
      isDynamic: /^(@|!)?\$(:?[cklsup]{1})?{[\$\w\.]+}.*$/i,
      dynamic: XRegExp('^(@|!)?\\$(?<modifier>[cklsup]{1})?{(?<accesor>[\\$\\w\\.]+)}.*$', 'x'),
      directive: XRegExp('(?<directive>^(@|!)?\\$(:?[cklsup]{1})?{[\\$\\w\\.]+}).*$', 'x')
  },
  resolveModifier: (modifier, name) => {
    const func = {
      'l': _.lowerCase,
      'u': _.upperCase,
      'c': _.camelCase,
      's': _.snakeCase,
      'k': _.kebabCase,
      'p': _.capitalize
    };
    let f = func[modifier];
    if (!f){
      return name;
    }
    return f(name);
  }
};

export default utils;