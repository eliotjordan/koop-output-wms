const render = require('./render')
const { isPng } = require('./wms-utils')
const { degrees2meters } = require('./wms-utils')
const fs = require('fs')
const bbox = require('geojson-bbox')

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} data
 */
function route (req, res, data) {
  const queryParams = parseQueryParams(req.query)

  if (queryParams.REQUEST === 'GetCapabilities') {
    fs.readFile('/Users/eliotj/Documents/Repositories/koop/koop-output-wms/templates/wms.xml', (err, dataBuffer) => {
      if (err) {
        console.log('error')
      }
      const template = dataBuffer.toString()
      const name = data.metadata.name.replace(".geojson", "")
      const extent = bbox(data)
      const sw = degrees2meters(extent[0], extent[1])
      const ne = degrees2meters(extent[2], extent[3])
      const xml = template.replace('{title}', name)
        .replace('{name}', name)
        .replace('{minx}', sw[0])
        .replace('{miny}', sw[1])
        .replace('{maxx}', ne[0])
        .replace('{maxy}', ne[1])

      res.status(200)
        .set('Content-Type', 'application/xml')
        .send(xml)
    })
  } else {
    render(queryParams, data, function (err, tile) {
      if (err || !tile || !isPng(tile)) {
        res.status(err.code || 500).json(err || new Error("Rendering didn't produce a proper tile"))
      } else {
        res.status(200)
          .set('Content-Length', tile.length)
          .set('Content-Type', 'image/png')
          .send(tile)
      }
    })
  }
}

/**
 * Parse the query parameters
 * @param {*} query
 */
function parseQueryParams (query = {}) {
  return Object.keys(query).reduce((options, key) => {
    options[key] = tryParse(query[key])
    return options
  }, {})
}

/**
 *
 * @param {*} input
 */
function tryParse (input) {
  try {
    return JSON.parse(input)
  } catch (e) {
    return input
  }
}

module.exports = { route }
