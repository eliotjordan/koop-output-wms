var render = require('./render')
var ref = require('./wms-utils');
var isPng = ref.isPng;
/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} data
 */
function route (req, res, data) {
  var queryParams = parseQueryParams(req.query)

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
