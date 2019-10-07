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
                title: 'Rivers',
                source: vectorSource,
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'blue',
                        width: 2
                    })
                })
            });

            map.addLayer(vectorLayer);

            var ext = vectorSource.getExtent();
            // {#ext = ol.proj.transformExtent(vectorSource.getExtent(), 'EPSG:3857', 'EPSG:4326');#}
            // {#ext = ol.proj.transformExtent(vectorSource.getExtent(), 'EPSG:3857', 'EPSG:4326');#}
            map.getView().fit(ext, map.getSize());


            var defaultStyle = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: [125, 55, 22, 1]
                }),
                stroke: new ol.style.Stroke({
                    color: [125, 55, 22, 1],
                    width: 1
                })
            });

            function styleFunction(feature, resolution) {


                var styleR1 = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: "rgba(90,135,204,1)",
                        width: 3
                    })
                });

                var styleR2 = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: "rgb(90,217,76)",
                        width: 3
                    })
                });

                var styleR3 = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: "rgb(250,157,100)",
                        width: 3
                    })
                });

                var styleR4 = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: "rgb(247,87,213)",
                        width: 3
                    })
                });

                var styleR5 = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: "rgb(110,219,192)",
                        width: 3
                    })
                });

                var styleCatchAll = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'red',
                        width: 3
                    }),
                });

                if (feature.get('STRM_VAL') == 1) {
                    return [styleR1];
                } else if (feature.get('STRM_VAL') == 2) {
                    return [styleR2];
                } else if (feature.get('STRM_VAL') == 3) {
                    return [styleR3];
                } else if (feature.get('STRM_VAL') == 4) {
                    return [styleR4];
                } else if (feature.get('STRM_VAL') == 5) {
                    return [styleR5];
                } else {
                    return [styleCatchAll];
                }
            }


            var format = new ol.format.GeoJSON({
                featureProjection: "EPSG:3857"
            });

            var HortonSource = new ol.source.Vector({
                features: format.readFeatures(data.Horton)
            });

            var HortonvectorLayer = new ol.layer.Vector({
                title: 'Horton',
                source: HortonSource,
                style: styleFunction
            });

            var StrahlerSource = new ol.source.Vector({
                features: format.readFeatures(data.Strahler)
            });

            var StrahlervectorLayer = new ol.layer.Vector({
                title: 'Strahler',
                source: StrahlerSource,
                style: styleFunction
            });

            var layer = new ol.layer.Group({
                title: 'River Order',
                layers: [HortonvectorLayer,StrahlervectorLayer],
                name: 'Order Group'
            });


            map.addLayer(layer);

        });
        return false;
    });
});

map.addControl(new ol.control.LayerSwitcher());

$(function () {
    $('#download').bind('click', function () {
        window.location = ($SCRIPT_ROOT + '/download');
        return false;
    });
});