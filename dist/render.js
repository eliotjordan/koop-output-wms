var mapnik = require('mapnik')
mapnik.register_default_input_plugins()
var mapnikify = require('@mapbox/geojson-mapnikify')
var ref = require('./wms-utils');
var normalizeDimension = ref.normalizeDimension;
var normalizeBbox = ref.normalizeBbox;
/**
 * Render a mapnik image tile from geojson
 * @param {object} wmsQueryParams WMS parameters from request
 * @param {object} geojson geojson data to be rendered
 * @param {function} callback post-rendering callback
 * @param {object} options
 */
function render (wmsQueryParams, geojson, callback, options) {
  if ( options === void 0 ) options = {};

  // Normalize the WMS dimensions
  var width = normalizeDimension(wmsQueryParams.WIDTH)
  if (width.err) { return callback(width.err) }
  var height = normalizeDimension(wmsQueryParams.HEIGHT)
  if (height.err) { return callback(height.err) }
  // Normalize the WMS Bbox
  var bbox = normalizeBbox(wmsQueryParams.BBOX)
  if (bbox.err) { return callback(bbox.err) }

  // Convert GeoJSON to Mapnik XML
  mapnikify(geojson, false, function (err, xml) {
    if (err) { return callback(err) }
    var map = new mapnik.Map(256, 256)

    // Create map from XML string
    map.fromString(xml, function (err, map) {
      if (err) { return callback(err) }
      // Configure and render
      map.resize(width.size, height.size)
      if (wmsQueryParams.SRS) { map.srs = "+init=" + (wmsQueryParams.SRS) }
      map.extent = bbox.coordinates
      var canvas = new mapnik.Image(width.size, height.size)
      map.render(canvas, function (err, image) {
        if (err) { return callback(err) }
        if (options.palette) { return image.encode('png8:z=1', {palette: options.palette}, callback) }
        image.encode('png32:z=1', callback)
      })
    })
  })
}

module.exports = render
