import "ol/ol.css";
import { Map, View } from "ol";
import { GeoPackageAPI, GeoPackageTileRetriever } from "@ngageoint/geopackage";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import XYZ from "ol/source/XYZ";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import {createEmpty, extend} from "ol/extent";

const loadGeoPackage = function (e) {
  var f = e.target.files[0];
  var r = new FileReader();
  r.onload = function () {
    var array = new Uint8Array(r.result);
    loadByteArray(array);
  };
  r.readAsArrayBuffer(f);
};

async function loadByteArray(array, callback) {
  const geoPackage = await GeoPackageAPI.open(array);
  const fitExtent = createEmpty()

  const tileTableNames = await geoPackage.getTileTables();
  tileTableNames.forEach(tileTableName => {
    const tileDao = geoPackage.getTileDao(tileTableName);
    const gpr = new GeoPackageTileRetriever(tileDao, 256, 256);
    const tileLayer = new TileLayer({
      extent: [
        tileDao.tileMatrixSet.min_x,
        tileDao.tileMatrixSet.min_y,
        tileDao.tileMatrixSet.max_x,
        tileDao.tileMatrixSet.max_y
      ],
      source: new XYZ({
        wrapX: false,
        minZoom: tileDao.minWebMapZoom,
        maxZoom: tileDao.maxWebMapZoom,
        tileUrlFunction: tileCoord => tileCoord,
        tileLoadFunction(tile, [z, x, y]) {
           gpr.getTile(x, y, z).then(dataUri => tile.getImage().src = dataUri);
        },
      }),
    });
    map.getView().fit(extend(fitExtent, tileLayer.getExtent()));
    map.addLayer(tileLayer);
  });

  const featureTableNames = await geoPackage.getFeatureTables();
  featureTableNames.forEach(featureTableName => {
    const featureDao = geoPackage.getFeatureDao(featureTableName);
    const geojson = {
      type: 'FeatureCollection',
      features: []
    }
    const iterator = featureDao.queryForGeoJSONIndexedFeaturesWithBoundingBox(undefined, true);
    for (const feature of iterator) {
      feature.type = 'Feature';
      geojson.features.push(feature);
    }
    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        url: `data:application/json;charset=utf-8,${JSON.stringify(geojson)}`
      })
    });
    vectorLayer.getSource().once('change', () => {
      map.getView().fit(extend(fitExtent, vectorLayer.getSource().getExtent()));
    });
    map.addLayer(vectorLayer);
  });

}

document.getElementById("gpkg").addEventListener("change", loadGeoPackage);

const map = new Map({
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});