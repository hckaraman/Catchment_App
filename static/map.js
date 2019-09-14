var vectorSource = new ol.source.Vector({
    projection : 'EPSG:4326',
    url: './river.geojson',
    format: new ol.format.GeoJSON()
});

var vectorLayer = new ol.layer.Vector({
    source: vectorSource
});

var center = ol.proj.transform([0, 0], 'EPSG:4326', 'EPSG:3857');
var view = new ol.View({
    center: center,
    zoom: 1
});

var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        }), vectorLayer
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([37.41, 8.82]),
        zoom: 4
    })
});


var source = new ol.source.Vector({wrapX: false});


vector = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(0, 255, 0, 0.5)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    })
});

// map.on('singleclick', function (evt) {
//     console.log(evt.coordinate);
//     console.log(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'));
// });

function getcoordinates() {
    map.on('singleclick', function (evt) {
        // console.log(evt.coordinate);
        alert(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'));
    });
}

// map.on('singleclick', function () {
//     map.getView().calculateExtent(map.getSize());
//     console.log(map.getView().calculateExtent());
// });

var draw; // global so we can remove it later
function addInteraction() {
    var value = 'Box';

    if (value !== 'None') {
        var geometryFunction, maxPoints;
        if (value === 'Square') {
            value = 'Circle';
            geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
        } else if (value === 'Box') {
            value = 'LineString';
            maxPoints = 2;
            geometryFunction = function (coordinates, geometry) {
                if (!geometry) {
                    geometry = new ol.geom.Polygon(null);
                }
                var start = coordinates[0];
                var end = coordinates[1];
                geometry.setCoordinates([
                    [start, [start[0], end[1]], end, [end[0], start[1]], start]
                ]);
                return geometry;
            };
        }

        draw = new ol.interaction.Draw({
            source: source,
            type: /** @type {ol.geom.GeometryType} */ (value),
            geometryFunction: geometryFunction,
            maxPoints: maxPoints
        });

        draw.on('drawend', function (e) {
            alert(e.feature.getGeometry().getExtent());
        });

        map.addInteraction(draw);
    }
}

// addInteraction();



//
// var corineUrl = 'http://filotis.itia.ntua.gr/mapserver?SERVICE=WFS&' +
//     'VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=biotopes_corine&' +
//     'SRSNAME=EPSG:4326&OUTPUTFORMAT=gml3';
// var naturaUrl = 'http://filotis.itia.ntua.gr/mapserver?SERVICE=WFS&' +
//     'VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=biotopes_natura&' +
//     'SRSNAME=EPSG:4326&OUTPUTFORMAT=gml3';
// var cadastreUrl = 'http://gis.ktimanet.gr/wms/wmsopen/wmsserver.aspx';
// var map = new ol.Map({
//     target: 'map',
//     layers: [new ol.layer.Tile({
//                  title: 'Open Street Map',
//                  source: new ol.source.OSM(),
//                  type: 'base'
//              }),
//              new ol.layer.Tile({
//                  title: 'Greek Cadastre',
//                  type: 'base',
//                  visible: false,
//                  source: new ol.source.TileWMS({
//                      url: cadastreUrl
//                  })
//              }),
//              new ol.layer.Vector({
//                  title: 'Corine biotopes',
//                  source: new ol.source.Vector({
//                      format: new ol.format.WFS(),
//                      url: corineUrl
//                  })
//              }),
//              new ol.layer.Vector({
//                  title: 'Natura biotopes',
//                  source: new ol.source.Vector({
//                      format: new ol.format.WFS(),
//                      url: naturaUrl
//                  })
//              })],
//     view: new ol.View({
//         projection: 'EPSG:4326',
//         center: [24, 38], zoom: 6
//     })
// });
// map.addControl(new ol.control.LayerSwitcher());

var options = {
  chart: {
    type: 'line'
  },
  series: [{
    name: 'sales',
    data: [30,40,35,50,49,60,70,91,125]
  }],
  xaxis: {
    categories: [1991,1992,1993,1994,1995,1996,1997, 1998,1999]
  },
    responsive: [
    {
      breakpoint: 1000,
      options: {
        plotOptions: {
          bar: {
            horizontal: false
          }
        },
        legend: {
          position: "bottom"
        }
      }
    }],
};

var chart = new ApexCharts(document.querySelector("#map"), options);

chart.render();