// Refer to Lesson 1, Activity 10-Stu_GeoJson

// URL endpoint for all earthquakes of the past day (24 hrs)
var quakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

// Perform GET request
d3.json(quakeURL).then(function(data) {
    console.log(data.features);
    createFeatures(data.features);
});

function createFeatures(quakeData) {
    // Create a popup displaying the location and magnitude of each earthquake.
    function featureInfo(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><h4>Magnitude: ${feature.properties.mag}</h4><p>Date: ${new Date(feature.properties.time)}<br>Depth: ${(feature.geometry.coordinates[2])} km</p>`);
    }
    // Create the circle markers for the earthquakes
    function QuakeCircles(feature, latlng){
        let options = {
            radius: feature.properties.mag*5,
            fillColor: chooseColor(feature.properties.mag),
            color: "#000000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9
        }
        return L.circleMarker(latlng,options);
    }
    let quakeInfo = L.geoJSON(quakeData, {
        onEachFeature: featureInfo,
        pointToLayer: QuakeCircles
    });
    createMap(quakeInfo);
}

// chooseColor color-codes the circles based on magnitude
function chooseColor(mag){
    switch(true){
        case(1.0 <= mag && mag <= 1.9):
            return "#9ACD32"; // yellow green
        case (2.0 <= mag && mag <=3.9):
            return "#FFFF00"; // yellow
        case (4.0 <= mag && mag <=5.4):
            return "#FFA500"; // orange
        case (5.5 <= mag && mag <=6.9):
            return "#FF0000"; // red
        case (7.0 <= mag && mag <= 7.9):
            return "#8b0000"; // dark-red
        case (8.0 <= mag && mag <=20.0):
            return "#000000"; // black
        default:
            return "#1E90FF"; // blue, for quakes below 1.0 in mag
    }
}

// createMap() function to setup the map and incorporate quake data into it
function createMap(quakes) {
    var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    var topomap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    var baseMaps = {
        "Street Map": streetmap,
        "Topographic Map": topomap
    };

    var overlays = {
        "Earthquakes": quakes
    };

    var myMap = L.map("map",{
        center: [39.833333, -98.583333],
        zoom: 4,
        layers: [streetmap, topomap, quakes]
    });

    L.control.layers(baseMaps, overlays, {
        collapsed: false
      }).addTo(myMap);
      legend.addTo(myMap);

}

// Create map legend
let legend = L.control({position: 'bottomright'});

legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [0.0, 1.0, 2.0, 4.0, 5.5, 7.0, 8.0];
    var labels = [];
    var legendInfo = "<h4>Magnitude</h4>";

    div.innerHTML = legendInfo

    // go through each magnitude item to label and color the legend
    // push to labels array as list item
    for (var i = 0; i < grades.length; i++) {
          labels.push('<ul style="background-color:' + chooseColor(grades[i]) + '"> <span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+') + '</span></ul>');
        }

      // add each label list item to the div under the <ul> tag
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    
    return div;
  };