import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {Layer, Heatmap} from 'ol/layer';
import {composeCssTransform} from 'ol/transform';
import VectorSource from 'ol/source/Vector';
import {KML} from 'ol/format';

// @ts-ignore
import svg from './data/world.svg';
// @ts-ignore
import earthquakes from './data/2012_Earthquakes_Mag5.kml';

var map = new Map({
  target: 'map',
  view: new View({
    center: [0, 0],
    extent: [-180, -90, 180, 90],
    projection: 'EPSG:4326',
    zoom: 2
  })
});

const heatmapLayer = new Heatmap({
  source: new VectorSource({
    url: earthquakes,
    format: new KML({
      extractStyles: false
    })
  })
});

map.addLayer(heatmapLayer);

var svgContainer = document.createElement('div');
var xhr = new XMLHttpRequest();
console.log(svg)
xhr.open('GET', svg);
xhr.addEventListener('load', function() {
  var svg = xhr.responseXML.documentElement;
  svgContainer.ownerDocument.importNode(svg, false);
  svgContainer.appendChild(svg);
});
xhr.send();

var width = 2560;
var height = 1280;
var svgResolution = 360 / width;
svgContainer.style.width = width + 'px';
svgContainer.style.height = height + 'px';
svgContainer.style.transformOrigin = 'top left';
svgContainer.style.position = 'absolute';
svgContainer.className = 'svg-layer';

const svgLayer = new Layer({
  /**
   * @param {import("ol/PluggableMap").FrameState} frameState 
   */
  render: function(frameState) {
    var scale = svgResolution / frameState.viewState.resolution;
    var center = frameState.viewState.center;
    var size = frameState.size;
    var cssTransform = composeCssTransform(
      size[0] / 2, size[1] / 2,
      scale, scale,
      frameState.viewState.rotation,
      -center[0] / svgResolution - width / 2, center[1] / svgResolution - height / 2);
    svgContainer.style.transform = cssTransform;
    svgContainer.style.opacity = String(svgLayer.getOpacity());
    return svgContainer;
  }
});

map.addLayer(svgLayer);