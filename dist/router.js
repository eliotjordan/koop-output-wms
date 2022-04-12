var render = require('./render')
var ref = require('./wms-utils');
var isPng = ref.isPng;
var ref$1 = require('./wms-utils');
var degrees2meters = ref$1.degrees2meters;
var fs = require('fs')
var bbox = require('geojson-bbox')

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} data
 */
function route (req, res, data) {
  var queryParams = parseQueryParams(req.query)

  if (queryParams.REQUEST === 'GetCapabilities') {
    fs.readFile('/Users/eliotj/Documents/Repositories/koop/koop-output-wms/templates/wms.xml', function (err, dataBuffer) {
      if (err) {
        console.log('error')
      }
      var template = dataBuffer.toString()
      var name = data.metadata.name.replace(".geojson", "")
      var extent = bbox(data)
      var sw = degrees2meters(extent[0], extent[1])
      var ne = degrees2meters(extent[2], extent[3])
      var xml = template.replace('{title}', name)
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
function parseQueryParams (query) {
  if ( query === void 0 ) query = {};

  return Object.keys(query).reduce(function (options, key) {
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

module.exports = { route: route }
