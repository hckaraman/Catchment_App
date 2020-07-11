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
                River: $("#xcor").val()
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


                var years = data.X;
                var africa = data.Y;
                var coords = years.map((v, i) => ({x: v, y: africa[i]}));

                $('#myChart').remove();
                $('#htmlresult').append('<canvas id="myChart" width="400" height="400"></canvas>');
                var ctx = document.getElementById('myChart').getContext('2d');

                var myChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: 'Hypsometric Curve',
                            data: coords,
                            borderColor: "rgba(151,187,205,1)",
                            backgroundColor: "rgba(151,187,205,1)",
                            // borderDash: [5, 5],
                            borderWidth: 2,
                            fill: false,
                            pointRadius: 0,
                        }]
                    },
                    options: {
                        responsive: true,
                        title: {
                            display: true,
                            text: "Hypsometric Curve"
                        },
                        scales: {
                            xAxes: [{
                                type: 'linear',
                                position: 'bottom',
                                gridLines: {},
                                scaleLabel: {
                                    display: true,
                                    labelString: "% Area Above"
                                },
                            }],
                            yAxes: [{
                                gridLines: {},
                                scaleLabel: {
                                    display: true,
                                    labelString: "Elevation (m)"
                                },

                            }]
                        }
                    }
                });




                var MOUNTAINS = [
                    {
                        "Average": data.stat[0],
                        "Minimum": data.stat[1],
                        "Maximum": data.stat[2],
                        "Range": data.stat[3],
                        "Std. Dev.": data.stat[4],
                        "Total": data.stat[5],
                    },
                ];


                function buildTable(data) {
                    var table = document.createElement("table");
                    table.className = "gridtable";
                    // table.align = "center";
                    var thead = document.createElement("thead");
                    var tbody = document.createElement("tbody");
                    var headRow = document.createElement("tr");
                    ["Average", "Minimum", "Maximum", "Range", "Std. Dev.", "Total"].forEach(function (el) {
                        var th = document.createElement("th");
                        th.appendChild(document.createTextNode(el));
                        headRow.appendChild(th);
                    });
                    thead.appendChild(headRow);
                    table.appendChild(thead);
                    data.forEach(function (el) {
                        var tr = document.createElement("tr");
                        for (var o in el) {
                            var td = document.createElement("td");
                            td.appendChild(document.createTextNode(el[o]));
                            tr.appendChild(td);
                        }
                        tbody.appendChild(tr);
                    });
                    table.appendChild(tbody);
                    return table;
                }

                $('#tablecontent').remove();
                $("#basintable").append("<div id=\"tablecontent\"></div>");
                document.getElementById("tablecontent").appendChild(buildTable(MOUNTAINS));

            });


        });
    });
});


