$(function () {
    $('#calculate').bind('click', function () {
        $.getJSON($SCRIPT_ROOT + '/process', {
            X: $("#xcor").val(),
            Y: $("#ycor").val(),
            X1: $("#x1").val(),
            Y1: $("#y1").val(),
            X2: $("#x2").val(),
            Y2: $("#y2").val(),
        }, function (data) {
            // $("#Area").val(data.Area);
            // $("#UTM").val(data.UTM);

            var routeJSON = data.Branch;

            var features = vector.getSource().getFeatures();
            features.forEach((feature) => {
                vector.getSource().removeFeature(feature);
            });
            map.removeInteraction(draw);
            map.removeInteraction(modify);

            var format = new ol.format.GeoJSON({
                featureProjection: "EPSG:3857"
            });

            var vectorSource = new ol.source.Vector({
                features: format.readFeatures(routeJSON)
            });

            var vectorLayer = new ol.layer.Vector({
                source: vectorSource,
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'blue',
                        width: 2
                    })
                })
            });

            map.addLayer(vectorLayer);
            //
            // var routeJSON = data.Polygon;
            //
            // var format = new ol.format.GeoJSON({
            //     featureProjection: "EPSG:3857"
            // });
            //
            // var vectorSource = new ol.source.Vector({
            //     features: format.readFeatures(routeJSON)
            // });
            //
            // var vectorLayer = new ol.layer.Vector({
            //     source: vectorSource,
            //     style: new ol.style.Style({
            //         stroke: new ol.style.Stroke({
            //             color: 'blue',
            //             width: 3
            //         })
            //     })
            // });



            // var vectorSource = new ol.source.Vector({
            //     format: new ol.format.GeoJSON({
            //         featureProjection: "EPSG:3857"
            //     }),
            //     url: './static/data/riverswht.geojson',
            //     // url: "{{ url_for('data' , filename ='riverswht.geojson') }}",
            // });
            //
            // var vectorLayer = new ol.layer.Vector({
            //     source: vectorSource,
            //     style: new ol.style.Style({
            //         stroke: new ol.style.Stroke({
            //             color: 'blue',
            //             width: 2
            //         })
            //     })
            // });
            //
            // map.addLayer(vectorLayer);


            var ext = vectorSource.getExtent();
            // {#ext = ol.proj.transformExtent(vectorSource.getExtent(), 'EPSG:3857', 'EPSG:4326');#}
            // {#ext = ol.proj.transformExtent(vectorSource.getExtent(), 'EPSG:3857', 'EPSG:4326');#}
            map.getView().fit(ext, map.getSize());

        });
        return false;
    });
});

$(function () {
    $('#download').bind('click', function () {
        window.location = ($SCRIPT_ROOT + '/download');
        return false;
    });
});