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

$(document).ready(function () {
    $('#coordinates').one('click', function (ev) {
        getcoordinates();
        return false;
    });
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





$(document).ready(function () {
    $('#draw').one('click', function (ev) {
        addInteraction();
        return false;
    });
});


function openCity(evt, cityName) {
    var i, x, tablinks;
    x = document.getElementsByClassName("city");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" w3-red", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " w3-red";
}