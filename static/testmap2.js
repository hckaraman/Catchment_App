// create a vector source that loads a GeoJSON file
// var vectorSource = new ol.source.Vector({
//     projection: 'EPSG:4326',
//     url: "{{ url_for('assets' , filename ='r.geojson')}}",
//     format: new ol.format.GeoJSON()
// });
//
// // a vector layer to render the source
// var vectorLayer = new ol.layer.Vector({
//     source: vectorSource
// });
//
// var center = ol.proj.transform([34.42, 39.42], 'EPSG:4326', 'EPSG:3857');
// var view = new ol.View({
//     center: center,
//     zoom: 1
// });
//
// // Create layers instances
// var layerOSM = new ol.layer.Tile({
//     source: new ol.source.OSM(),
//     name: 'OpenStreetMap',
//     title: 'OpenStreetMap'
// });
//
// var layerStamenWater = new ol.layer.Tile({
//     source: new ol.source.Stamen({
//         layer: 'watercolor'
//     }),
//     name: 'Watercolor',
//     title: 'Watercolor'
// });
// var layerStamenTerrain = new ol.layer.Tile({
//     source: new ol.source.Stamen({
//         layer: 'terrain'
//     }),
//     name: 'Terrain',
//     title: 'Terrain'
//
// });
//
// var map = new ol.Map({
//     target: 'map',
//     layers: [layerStamenTerrain
//     ],
//     view: new ol.View({
//         center: ol.proj.fromLonLat([34.42, 39.42]),
//         zoom: 6
//     })
// });

// var layerSwitcher = new ol.control.LayerSwitcher({
//     tipLabel: 'Légende', // Optional label for button
//     groupSelectStyle: 'children' // Can be 'children' [default], 'group' or 'none'
// });
// map.addControl(layerSwitcher);

var appId = 'NlGDN7VmUR5CEjwlC2h2';
var appCode = 'oWcExuiIq_UmB4EFUFVNJA';
var hereLayers = [
    {
        base: 'base',
        type: 'maptile',
        scheme: 'normal.day',
        app_id: appId,
        app_code: appCode
    },
    {
        base: 'base',
        type: 'maptile',
        scheme: 'normal.day.transit',
        app_id: appId,
        app_code: appCode
    },
    {
        base: 'base',
        type: 'maptile',
        scheme: 'pedestrian.day',
        app_id: appId,
        app_code: appCode
    },
    {
        base: 'aerial',
        type: 'maptile',
        scheme: 'terrain.day',
        app_id: appId,
        app_code: appCode
    },
    {
        base: 'aerial',
        type: 'maptile',
        scheme: 'satellite.day',
        app_id: appId,
        app_code: appCode
    },
    {
        base: 'aerial',
        type: 'maptile',
        scheme: 'hybrid.day',
        app_id: appId,
        app_code: appCode
    }
];
var urlTpl = 'https://{1-4}.{base}.maps.cit.api.here.com' +
    '/{type}/2.1/maptile/newest/{scheme}/{z}/{x}/{y}/256/png' +
    '?app_id={app_id}&app_code={app_code}';
var layers = [];
var i, ii;
for (i = 0, ii = hereLayers.length; i < ii; ++i) {
    var layerDesc = hereLayers[i];
    layers.push(new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        source: new ol.source.XYZ({
            url: createUrl(urlTpl, layerDesc),
            attributions: 'Map Tiles &copy; ' + new Date().getFullYear() + ' ' +
                '<a href="http://developer.here.com">HERE</a>'
        })
    }));
}

var map = new ol.Map({
    layers: layers,
    // Improve user experience by loading tiles while dragging/zooming. Will make
    // zooming choppy on mobile or slow devices.
    loadTilesWhileInteracting: true,
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([34.42, 39.42]),
        zoom: 6
    })
});

function createUrl(tpl, layerDesc) {
    return tpl
        .replace('{base}', layerDesc.base)
        .replace('{type}', layerDesc.type)
        .replace('{scheme}', layerDesc.scheme)
        .replace('{app_id}', layerDesc.app_id)
        .replace('{app_code}', layerDesc.app_code);
}

var select = document.getElementById('layer-select');

function onChange() {
    var scheme = select.value;
    for (var i = 0, ii = layers.length; i < ii; ++i) {
        layers[i].setVisible(hereLayers[i].scheme === scheme);
    }
}

select.addEventListener('change', onChange);
onChange();




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

// function myFunction() {
//   document.getElementById("myText").value = "Johnny Bravo";
// }

function getcoordinates() {

    map.on('singleclick', function (evt) {
        // console.log(evt.coordinate);
        var x = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        // alert(x[0],x[1])
        // var x = evt.coordinate;
        document.getElementById("xcor").value = x[0];
        document.getElementById("ycor").value = x[1];
    });
}

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
            ex = (e.feature.getGeometry().getExtent());
            // ex = ol.proj.transform(ex, 'EPSG:3857', 'EPSG:4326')
        });

        map.addInteraction(draw);
    }
}
