$(function () {
    $('#coordinates').bind('click', function () {

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
                    radius: 3,
                    fill: new ol.style.Fill({
                        color: "#14ff66"
                    })
                })
            })
        });

        function drawpoint() {
            draw = new ol.interaction.Draw({
                source: source,
                type: "Point"
            });
            map.addInteraction(draw);
            snap = new ol.interaction.Snap({source: source});
            map.addInteraction(snap);
        }

        drawpoint();

        map.addLayer(vector);

        map.on('singleclick', function (evt) {
            // console.log(evt.coordinate);
            var x = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');


            $.getJSON($SCRIPT_ROOT + '/preprocess', {
                X: x[0],
                Y: x[1],
            }, function (data) {

                var routeJSON = data.Boundary;

                var format = new ol.format.GeoJSON({
                    featureProjection: "EPSG:3857"
                });

                var vectorSource = new ol.source.Vector({
                    features: format.readFeatures(routeJSON)
                });

                var num = Math.round(0xffffff * Math.random());
                var r = num >> 16;
                var g = num >> 8 & 255;
                var b = num & 255;
                var t = 0.35;
                var color = 'rgb(' + r + ', ' + g + ', ' + b + ', ' + t + ')';

                var vectorLayer = new ol.layer.Vector({
                    title: 'Basins',
                    source: vectorSource,

                    style: new ol.style.Style({
                        fill: new ol.style.Fill({

                            color: color,
                        }),
                        stroke: new ol.style.Stroke({
                            color: color,
                            width: 2,
                        }),
                        image: new ol.style.Circle({
                            radius: 7,
                            fill: new ol.style.Fill({
                                color: color,
                            })
                        })
                    })
                });

                map.addLayer(vectorLayer);

            });
        });
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