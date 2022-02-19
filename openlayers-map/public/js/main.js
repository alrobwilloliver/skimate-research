// Base Layer with Open Street Maps
const baseMapLayer = new ol.layer.Tile({
  source: new ol.source.OSM()

});

//Construct the Map Object
const map = new ol.Map({
  target: 'map',
  layers: [ baseMapLayer],
  view: new ol.View({
          center: ol.proj.fromLonLat([23.44596, 41.775824488072445]),
          zoom: 15 //Initial Zoom Level
        })
});

//Set up an  Style for the marker note the image used for marker
const iconStyle = new ol.style.Style({
    image: new ol.style.Icon(/** @type {module:ol/style/Icon~Options} */ ({
      anchor: [0.5, 16],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: 'image/icon.png'
    }))
});


//Adding a marker on the map
const marker = new ol.Feature({
  geometry: new ol.geom.Point(
    ol.proj.fromLonLat([23.445983,41.775824488072445])
  )
});

marker.setStyle(iconStyle);

const vectorSource = new ol.source.Vector({
  features: [marker]
});


const markerVectorLayer = new ol.layer.Vector({
  source: vectorSource,

});

// add style to Vector layer style map
map.addLayer(markerVectorLayer);

function updateCoordinate(item) { 
    // Structure of the input Item
    // {"Coordinate":{"Longitude":80.2244,"Latitude":12.97784}}
    const featureToUpdate = marker;

    const coord = ol.proj.fromLonLat([item.Coordinate.Longitude, item.Coordinate.Latitude]);

    featureToUpdate.getGeometry().setCoordinates(coord);
}

const longlats = [[],[23.44597, 41.775824488072445 ],
[23.44598, 41.775824488072446],
[23.44599, 41.775824488072447],
[23.44600, 41.775824488072448]]
let count = 0
const item = {};
item.id = marker.getId;
item.Coordinate = {};
const interval = setInterval(function() {
  count++
  if (count > longlats.length - 1) {
    clearInterval(interval)
    return
  }
  item.Coordinate.Longitude = longlats[count][0];
  item.Coordinate.Latitude = longlats[count][1];
  updateCoordinate(item);
}, 1000);
