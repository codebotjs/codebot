'use strict';

/**
 * Utils
 */

import XRegExp from 'xregexp';

const utils = {
  // Regular exrepssion to parse templates names
  regex: {
    isLayer: /^#.+$/i,
      layer: XRegExp('^[#]{1}(?<accesor>.+$)', 'x'),
      isAuto: /^@.*$/i,
      isDynamic: /^@?\$(:?[cklsu]{1})?{[\$\w\.]+}.*$/i,
      dynamic: XRegExp('^@?\\$(?<modifier>[cklsu]{1})?{(?<accesor>[\\$\\w\\.]+)}.*$', 'x'),
      directive: XRegExp('(?<directive>^@?\\$(:?[cklsu]{1})?{[\\$\\w\\.]+}).*$', 'x')
    }
};

export default utils;