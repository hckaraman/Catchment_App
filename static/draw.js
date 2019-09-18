var extent = new ol.interaction.Extent;
map.addInteraction(extent);
extent.setActive(false);

//Enable interaction by holding shift
window.addEventListener('keydown', function (event) {
    if (event.keyCode == 16) {
        extent.setActive(true);
    }
});
window.addEventListener('keyup', function (event) {
    if (event.keyCode == 16) {
        extent.setActive(false);
        var Area = ol.extent.getBottomRight(extent);
        console.log(Area);
    }
});

