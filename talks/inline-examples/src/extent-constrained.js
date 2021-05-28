import 'ol/ol.css'
import { Map } from 'ol';
import { Tile } from 'ol/layer';
import { OSM } from 'ol/source';
import { View } from 'ol';
import { useGeographic } from 'ol/proj';
import { getCenter } from 'ol/extent';

useGeographic();

const freiburg = [7.849881 - 0.1, 47.994828 - 0.05, 7.849881 + 0.1, 47.994828 + 0.05];
const views = [
  new View({
    center: [0, 0],
    zoom: 2
  }),
  new View({
    extent: freiburg,
    center: getCenter(freiburg),
    zoom: 14
  })
]

const map = new Map({
  target: 'map',
  layers: [
    new Tile({
      source: new OSM()
    })
  ],
  view: views[0]
});

document.getElementById('view-toggle').addEventListener('click', () => {
  const viewIndex = views.indexOf(map.getView());
  const view = views[(viewIndex + 1) % 2];
  map.setView(view);
});