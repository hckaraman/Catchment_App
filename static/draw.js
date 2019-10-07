var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
});

var source = new ol.source.Vector({wrapX: false});

var vector = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: "rgba(0, 255, 0, 0.5)"
        }),
        stroke: new ol.style.Stroke({
            color: "#ffcc33",
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: "#ffcc33"
            })
        })
    })
});


var draw; // global so we can remove it later
function addInteraction() {
    var geometryFunction, maxPoints;
    value = "Box";
    value = "LineString";
    maxPoints = 2;
    geometryFunction = function (coordinates, geometry) {
        if (!geometry) {
            geometry = new ol.geom.Polygon([coordinates]);
        }
        var start = coordinates[0];
        var end = coordinates[1];
        geometry.setCoordinates([
            [start, [start[0], end[1]], end, [end[0], start[1]], start]
        ]);
        return geometry;
    };

    draw = new ol.interaction.Draw({
        source: source,
        type: /** @type {ol.geom.GeometryType} */ (value),
        geometryFunction: geometryFunction,
        maxPoints: maxPoints
    });
    map.addInteraction(draw);
    var modify = new ol.interaction.Modify({source: source});

    map.addInteraction(modify);
    map.addLayer(vector);
    // var select = new ol.interaction.Select();
    // map.addInteraction(select);
    //
    // var selectedFeatures = select.getFeatures();


    draw.on("drawend", function (e) {
        var xPro = ol.proj.transformExtent(e.feature.getGeometry().getExtent(), 'EPSG:3857', 'EPSG:4326');
        document.getElementById("x1").value = xPro[0];
        document.getElementById("y1").value = xPro[1];
        document.getElementById("x2").value = xPro[2];
        document.getElementById("y2").value = xPro[3];
        // debugger;
        var features = vector.getSource().getFeatures();
        features.forEach((feature) => {
            vector.getSource().removeFeature(feature);
        });
    });
}

$(document).ready(function () {
    $('#draw').click(function (ev) {
        addInteraction();
        return false;
    });
});


