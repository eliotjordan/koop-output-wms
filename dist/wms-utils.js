var util = require('util')

/**
 * Normalize and range check input dimensions
 * @param {*} input
 * @returns {object} object with error or dimension
 */
function normalizeDimension (input) {
  var size = (input === undefined) ? 256 : parseInt(input)
  if (!Number.isInteger(size) || size < 1 || size > 2048) {
    var err = new Error('Invalid dimension: ' + size)
    err.code = 400
    return { err: err }
  }
  return { size: size }
}

/**
 * Convert a Bbox string to an integer array
 * @param {string} bboxStr string representation of Bbox coordinates
 * @returns {Number[]} Bbox as number array
 */
function normalizeBbox (bboxStr) {
  var bboxStrArr = bboxStr ? bboxStr.split(',') : []
  if (bboxStrArr.length !== 4) {
    var err = new Error('Invalid bbox: ' + util.inspect(bboxStrArr))
    err.code = 400
    return { err: err }
  }
  var coordinates = bboxStrArr.map(parseFloat)
  if (coordinates.some(isNaN)) {
    var err$1 = new Error('Invalid bbox: ' + util.inspect(coordinates))
    err$1.code = 400
    return { err: err$1 }
  }

  return { coordinates: coordinates }
}

/**
 * Test if input data is a PNG
 * @param {Uint8Array} data
 * @returns {boolean}
 */
function isPng (data) {
  return data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E &&
  data[3] === 0x47 && data[4] === 0x0D && data[5] === 0x0A &&
  data[6] === 0x1A && data[7] === 0x0A
}

module.exports = { normalizeDimension: normalizeDimension, normalizeBbox: normalizeBbox, isPng: isPng }
