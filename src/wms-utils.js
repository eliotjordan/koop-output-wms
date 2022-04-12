const util = require('util')
const proj4 = require('proj4')

/**
 * Normalize and range check input dimensions
 * @param {*} input
 * @returns {object} object with error or dimension
 */
function normalizeDimension (input) {
  const size = (input === undefined) ? 256 : parseInt(input)
  if (!Number.isInteger(size) || size < 1 || size > 2048) {
    const err = new Error('Invalid dimension: ' + size)
    err.code = 400
    return { err }
  }
  return { size }
}

/**
 * Convert a Bbox string to an integer array
 * @param {string} bboxStr string representation of Bbox coordinates
 * @returns {Number[]} Bbox as number array
 */
function normalizeBbox (bboxStr) {
  const bboxStrArr = bboxStr ? bboxStr.split(',') : []
  if (bboxStrArr.length !== 4) {
    let err = new Error('Invalid bbox: ' + util.inspect(bboxStrArr))
    err.code = 400
    return { err }
  }
  const coordinates = bboxStrArr.map(parseFloat)
  if (coordinates.some(isNaN)) {
    let err = new Error('Invalid bbox: ' + util.inspect(coordinates))
    err.code = 400
    return { err }
  }

  return { coordinates }
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

function degrees2meters (lon, lat) {
  const fromProj = proj4.defs('EPSG:4326')
  const toProf = proj4.defs('EPSG:3857')

  return proj4(fromProj, toProf, [lon, lat])

  // const x = lon * 20037508.34 / 180
  // let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180)
  // y = y * 20037508.34 / 180
  // return [x, y]
}

module.exports = { normalizeDimension, normalizeBbox, isPng, degrees2meters }
