/*!
 * randomatic <https://github.com/jonschlinkert/randomatic>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var isNumber = require('is-number');
var typeOf = require('kind-of');
var mathRandom = require('math-random');

/**
 * Expose `randomatic`
 */

module.exports = randomatic;
module.exports.isCrypto = !!mathRandom.cryptographic;

/**
 * Creates a delimeted string from an array or objects from a certain property
 * @param {Array} array 
 * @param {String} propertyName 
 * @param {String} delimeter
 * @param {String} lastDelimeter - separator between last and second last item
 * @returns {String}
 */
function arrayObjMembersToDelimetedString(array, propertyName, delimeter, lastDelimeter)
{
  var i, res = [], last, value;
  if(array.length === 0) {
    return '';
  }
  for(i = 0; i < array.length; i++) {
    value = array[i][propertyName];
    if(typeof value !== 'undefined' && value !== null) {
      res.push(array[i][propertyName]);
    }
  }
  if(res.length === 0) {
    return '';
  }
  if(typeof lastDelimeter === 'string') {
    if(res.length === 1) {
      return res[0];
    } else if(res.length === 2) {
      return res[0] + lastDelimeter + res[1];
    } else {
      last = res.pop();
      return res.join(delimeter) + lastDelimeter + last;
    }
  } else {
    return res.join(delimeter);
  }
}

/**
 * Available mask characters
 */

const maskCharacters = [
  {name: "custom", identifier: "?", letters: null},
  {name: "lower", identifier: "a", letters:"abcdefghijklmnopqrstuvwxyz"},
  {name: "upper", identifier: "A", letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"},
  {name: "number", identifier: "0", letters: "0123456789"},
  {name: "special", identifier: "!", letters: "~!@#$%^&()_+-={}[];',."}
];
maskCharacters.push({
  name: "all", identifier: '*', letters: arrayObjMembersToDelimetedString(maskCharacters, 'letters', '')
});

function isValidPattern(pattern) {
  var i, j, found;
  for(i = 0; i < pattern.length; i++) {
    found = false;
    maskCharacters
    for(j = 0; j < maskCharacters.length; j++) {
      if(pattern.charAt(i) === maskCharacters[j].identifier) {
        found = true;
        break;
      }
    }
    if(!found) {
      return false; 
    }
  }
  return true;
}

/**
 * Generate random character sequences of a specified `length`,
 * based on the given `pattern`.
 *
 * @param {String|Number} `pattern` The pattern to use for generating the random string or the length result using the '*' pattern.
 * @param {Number|Object} [length] The length of the string to generate or object containing chars property that holds possible characters to be used in resulting random string.
 * @param {Object} [options] object containing 'chars' property that holds possible characters to be used in resulting random string.
 * @return {String}
 * @api public
 */
function randomatic(pattern, length, options) {
  var patternTypeIsString = typeof pattern === 'string',
    patternTypeIsNumber = (!patternTypeIsString && isNumber(pattern)),
    custom = false,
    mask = '',
    res = '',
    i;

  if (!patternTypeIsString && !patternTypeIsNumber) {
    throw new Error('randomatic expects pattern to be a string or a number.');
  }

  if (arguments.length === 1) {
    if (patternTypeIsString) {
      length = pattern.length;
    } else {
      options = {};
      length = pattern;
      pattern = '*';
    }
  }

  if (typeOf(length) === 'object' && length.hasOwnProperty('chars')) {
    options = length;
    pattern = options.chars;
    length = options.chars.length;
    custom = true;
  }
  
  if(!isNumber(length)) {
    throw new Error('randomatic expects length to be a number.');
  }
  // throw an error if options is passed in and options.chars exists but chars is not a string
  if(options && typeof options.chars !== 'undefined' && typeof options.chars !== 'string') {
    throw new Error('randomatic expects options.chars to be a string.');
  }
  // throw an error if custom pattern is not used and pattern is not valid
  if(!custom && !isValidPattern(pattern)) {
    throw new Error('randomatic pattern is not a valid pattern. Allowed patterns are ' + arrayObjMembersToDelimetedString(maskCharacters, 'identifier', ', ', ' and ') + '. Got ' + pattern);
  }
  // Characters to be used
  for(i = 0; i < maskCharacters.length; i++) {
    if (pattern.indexOf(maskCharacters[i].identifier) !== -1) {
      mask += maskCharacters[i].letters || options.chars;
    }
  }
  if (custom) {
    mask += pattern;
  }
  while (length-- > 0) {
    res += mask.charAt(mathRandom() * mask.length);
  }
  return res;
};
