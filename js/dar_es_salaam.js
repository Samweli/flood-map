var DATASET_ID = '';
//var DATASETS_BASE = 'https://api.mapbox.com/v4/samtwesa.omckmmch/' + DATASET_ID + '/';
var DATASETS_BASE = ''
// var selectedRoadsSource;

//var datasetsAccessToken = 'pk.eyJ1Ijoic2FtdHdlc2EiLCJhIjoiZTc1OTQ4ODE0ZmY2MzY0MGYwMDNjOWNlYTYxMjU4NDYifQ.F1zCcOYqpXWd4C9l9xqvEQ';
var datasetsAccessToken = ''
// Define map locations
var mapLocation = {
    'reset': {
        'center': [39.2110, -6.8439],
        'zoom': 11,
        'pitch': 0,
        'bearing': 0
    },
    'magomeni': {
        'center': [39.26668, -6.80702],
        'zoom': 13.8,
        'pitch': 45,
        'bearing': 90
    },
    'jangwani': {
        'center': [39.26789, -6.81346],
        'zoom': 17,
        'pitch': 60,
        'bearing': -64,
        'highlight': 'water'
    },
    'suna': {
        'center': [39.2110, -6.8439],
        'zoom': 13.8,
        'pitch': 60,
        'bearing': -64
    },
    'kigogo': {
        'center': [39.2300, -6.8107],
        'zoom': 16,
        'pitch': 50,
        'bearing': -10
    },
    'tandale': {
        'center': [39.24360, -6.79854],
        'zoom': 17,
        'pitch': 50,
        'bearing': -10
    },
    'mirambo-street': {
        'center': [39.29089, -6.81230],
        'zoom': 17.18,
        'pitch': 45,
        'bearing': -90
    },
    'msasani': {
        'center': [39.2795, -6.7538],
        'zoom': 13.86,
        'pitch': 45,
        'bearing': 40
    }
};


// Simple map
mapboxgl.accessToken = 'pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/planemad/cih4qzr0w0012awltzvpie7qa', //stylesheet location
    hash: false
});
mapLocate('reset');

//Supress Tile errors
map.off('tile.error', map.onError);

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.Navigation());

// Define a layer collection for easy styling
var mapLayerCollection = {
    'water': ['water', 'waterway-river-canal', 'waterway-small'],
    'road-bridges': ['bridge-main', 'bridge-street', 'bridge-trunk', 'bridge-motorway'],
    'cartodem': ['chennai-cartodem'],
    'buildings': ['building'],
    'road-subways': ['tunnel-motorway', 'tunnel-trunk', 'tunnel-main', 'tunnel-street'],
    'chennai-relief-camps': ['chennai-relief-camps'],
    'chennai-relief-camps-22nov': ['chennai-relief-camps-22nov'],
    'chennai-water-logged-points': ['chennai-water-logged-points'],
    'road': [
        'road-main',
        'road-construction',
        'road-rail',
        'road-motorway',
        'road-trunk',
        'road-street',
        'road-service-driveway',
        'road-path',
        'tunnel-motorway',
        'tunnel-trunk',
        'tunnel-main',
        'tunnel-street',
        'bridge-main',
        'bridge-street',
        'bridge-trunk',
        'bridge-motorway',
        'road-street_limited',
        'aeroway-runway',
        'aeroway-taxiway',
        'road-rail',
        'bridge-rail'
    ]
};

map.on('style.load', function (e) {

    var selectedRoadsSource = new mapboxgl.GeoJSONSource({});
    var selectedBuildingsSource = new mapboxgl.GeoJSONSource({});

    map.addSource('selected-roads', selectedRoadsSource);
    map.addLayer({
        'id': 'selected-roads',
        'type': 'line',
        'source': 'selected-roads',
        'interactive': true,
        'paint': {
            'line-color': 'rgba(255,5,230,1)',
            'line-width': 3,
            'line-opacity': 0.6
        }
    });

    map.addSource('selected-buildings', selectedBuildingsSource);
    map.addLayer({
        'id': 'selected-buildings',
        'type': 'fill',
        'source': 'selected-buildings',
        'interactive': true,
        'paint': {
            'fill-color': 'rgba(255,5,230,1)',
            'fill-width': 3,
            'fill-opacity': 0.6
        }
    });

    map.addSource('terrain-data', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-terrain-v2'
    });

    map.addLayer({
        'id': 'terrain-data',
        'type': 'line',
        'source': 'terrain-data',
        'source-layer': 'contour',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#ff69b4',
            'line-opacity': '0.3',
            'line-width': 1
        }
    });

    var site = 'http://flood-dar.herokuapp.com/'

  // Select flooded roads
    var featuresGeoJSON = {
        'type': 'FeatureCollection',
        'features': []
    };
    $('#feature-count').toggleClass('loading');
    console.log("started loading");
    function getFeatures(startID) {
        //var url = DATASETS_BASE + 'features.json';
        //var url = 'http://samweli.github.io/flood-map/data/dar_es_salaam-flooded-streets.geojson'
        console.log("start id "+startID);
       // var url = 'http://floods-daressalaam.rhcloud.com/get_data.php'
       var site = 'http://flood-dar.herokuapp.com/'
       var url = site + 'get_data.php'
        // var url = 'http://localhost:5500/model/get_data.php'
        

        var params = {
        };
        if (startID) {
            params.start = startID;
        }
        $.getJSON(url, params, function (data) {
            if (data.features.length > 0) {
                console.log("Data Present in dar " + url + params.access_token +" "+ params.startID);
                data.features.forEach(function (feature) {
                    feature.properties.id = feature.id;
                    console.log(feature);
                });
                featuresGeoJSON.features = featuresGeoJSON.features.concat(data.features);
                var lastFeatureID = data.features[data.features.length - 1].id;
                getFeatures(lastFeatureID);
                console.log(lastFeatureID);
                console.log(featuresGeoJSON);

                selectedRoadsSource.setData(getRoads(featuresGeoJSON));
                selectedBuildingsSource.setData(getBuildings(featuresGeoJSON));

                updateFeatureCount(featuresGeoJSON);
            } else {
              updateFeatureCount(featuresGeoJSON);
              $('#feature-count').toggleClass('loading');
              console.log('no new features');
                playWithMap(featuresGeoJSON);
            }
        });
    }

    getFeatures(null);

  //Live query
    map.on('mousemove', function (e) {
        map.featuresAt(e.point, {
            radius: 4
        }, function (err, features) {
            if (err) throw err;

            var featuresList = '';
            if (features[0]) {
                if (features[0].properties.class)
                    featuresList += features[0].properties.class + ' ';
                if (features[0].properties.type)
                    featuresList += features[0].properties.type + '';
                if (features[0].properties.name)
                    featuresList += '- ' + features[0].properties.name;
                if(featuresList === ''){
                    featuresList = 'Building'
                }
                $('#map-query').html(featuresList);
            }
        });
    });

  //Popups on click
    map.on('click', function (e) {
        console.log('click logged'+e.point);
        map.featuresAt(e.point, {
            radius: 10,
            layer: ['chennai-relief-camps', 'chennai-relief-camps-22nov'],
            includeGeometry: true
        }, function (err, features) {

            console.log(features.length);
            if (err){ console.log('error'); throw err;}

            if (features.length > 0) {
                console.log(features[0].geometry.coordinates);
                console.log(features[0].properties.Name);
                var popupHTML = '<h5>' + features[0].properties.Name + '</h5><p>' + $('[data-map-layer=' + features[0].layer.id + ']').html() + '</p>';
                var popup = new mapboxgl.Popup()
                                        .setLngLat(features[0].geometry.coordinates)
                                        .setHTML(popupHTML)
                                        .addTo(map);
            }
        });
    });

  // Update map legend from styles
  $('[data-map-layer]').each(function () {
      // Get the color of the feature from the map
      console.log('changing color');
      var obj = $(this).attr('data-map-layer');

      try {
          var color = map.getPaintProperty(obj, 'circle-color');
          // Set the legend color
          $(this).prepend('<div class="map-legend-circle" style="background:"' + array2rgb(color) + '></div>');
      } catch (e) {
          return;
      }
  });

    function playWithMap(data) {
        var addedRoads = [];
        var addedBuildings = [];
        var addedFeatures = [];

        //Dump Data
        window.dump = JSON.stringify(data);

        for (var i = 0; i < data.features.length; i++) {
            addedRoads.push(data.features[i].properties.id);
            addedFeatures.push(data.features[i]);
        }


        map.on('click', function (e) {
            console.log('to delete road');
            if (map.getZoom() >= 15) {
                //Check if the feature clicked on is in the selected Roads Layer.
                //If yes, UNSELECT the road
                map.featuresAt(e.point, {radius: 5, includeGeometry: true, layer: 'selected-roads'}, function (err, features) {
                    if (err) throw err;

                    if (features.length > 0) {

                        $('#map').toggleClass('loading');

                        //var saveURL = DATASETS_BASE + 'features.json/' + features[0].properties.id + '?access_token=' + datasetsAccessToken;
                        //var saveURL = 'http://samweli.github.io/flood-map/data/dar_es_salaam-flooded-streets.geojson'
                       
                       // var saveURL = 'http://floods-daressalaam.rhcloud.com/delete_data.php';

                        // var saveURL = 'http://localhost:5500/model/delete_data.php'

                        var saveURL = site + 'delete_data.php'

                        var index = addedRoads.indexOf(features[0].properties.id);
                        $.ajax({
                            'method': 'POST',
                            'url': saveURL,
                            'data': {"id":features[0].properties.id},
                            'success': function (result) {
                                $('#map').toggleClass('loading');
                                data = arrangeId(result);
                                addedRoads.splice(index, 1);
                                addedFeatures.splice(index, 1);

                                selectedRoadsSource.setData(getRoads(data));

                                updateFeatureCount(data);
                            },
                            'error': function (xhr, status, error) {
                                    $('#map').toggleClass('loading');
                                    var err = xhr.responseText + xhr.status;
                                    console.log('problem deleting roads'+ err);
                            }
                        });
                    } else {
                        //If road is not present in the `selected-roads` layer,
                        //check the glFeatures layer to see if the road is present.
                        //If yes,ADD it to the `selected-roads` layer
                        console.log('putting road');
                        map.featuresAt(e.point, {radius: 5, includeGeometry: true, layer: mapLayerCollection['road']}, function (err, glFeatures) {
                            if (err) throw err;
                            if(glFeatures.length > 0){
                            var tempObj = {
                                'type': 'Feature'
                            };

                            tempObj.geometry = glFeatures[0].geometry;
                            tempObj.properties = glFeatures[0].properties;
                            tempObj.properties['is_flooded'] = true;

                            $('#map').toggleClass('loading');

                            var id = md5(JSON.stringify(tempObj));
                            tempObj.id = id;
                            //var saveURL = DATASETS_BASE + 'features/' + id + '?access_token=' + datasetsAccessToken;
                            //var saveURL = 'http://samweli.github.io/flood-map/data/dar_es_salaam-flooded-streets.geojson'
                            //var saveURL = 'http://floods-daressalaam.rhcloud.com/put_data.php';

                            // var saveURL = 'http://localhost:5500/model/put_data.php'

                            var saveURL = site + 'put_data.php'

                            $.ajax({
                                'method': 'POST',
                                'crossDomain':true,
                                'url': saveURL,
                                'data': {'data' : tempObj},
                                'dataType': 'json',
                                'success': function (response) {
                                    $('#map').toggleClass('loading');
                                    console.log('no problem');
                                    console.log('id'+response.id)
                                    tempObj.id = response.id;
                                    tempObj.properties.id = response.id;
                                    console.log('tempObj');
                                    console.log(tempObj);
                                    addedFeatures.push(tempObj);
                                    data.features.push(tempObj);
                                    console.log("before updates");
                                    console.log(data.features);
                                    console.log("updated data");
                                    console.log(data.features);
                                    addedRoads.push(glFeatures[0].id);
                                    selectedRoadsSource.setData(getRoads(data));
                                    updateFeatureCount(data);
                                },
                                'error': function (xhr, status, error) {
                                    $('#map').toggleClass('loading');
                                    var err = xhr.responseText + xhr.status;
                                    console.log('problem putting '+ err);
                                }
                            });
                            // for buildings 
                            }else{
                                map.featuresAt(e.point, {radius: 5, includeGeometry: true, layer: 'selected-buildings'}, function (err, features) {
                                if (err) throw err;

                                if (features.length > 0) {

                                $('#map').toggleClass('loading');
                                console.log("to delete in features length if  buildings");

                                //var saveURL = DATASETS_BASE + 'features.json/' + features[0].properties.id + '?access_token=' + datasetsAccessToken;
                                //var saveURL = 'http://samweli.github.io/flood-map/data/dar_es_salaam-flooded-streets.geojson'
                                
                                //var saveURL = 'http://floods-daressalaam.rhcloud.com/delete_data.php';

                                // var saveURL = 'http://localhost:5500/model/delete_data.php';

                                var saveURL = site + 'delete_data.php'


                                var index = addedBuildings.indexOf(features[0].properties.id);
                                $.ajax({
                                    'method': 'POST',
                                    'url': saveURL,
                                    'data': {"id":features[0].properties.id},
                                    'success': function (result) {
                                        $('#map').toggleClass('loading');
                                        console.log("successfull delete buildings");
                                        data = arrangeId(result);
                                       
                                        addedBuildings.splice(index, 1);
                                        addedFeatures.splice(index, 1);

                                        selectedBuildingsSource.setData(getBuildings(data));

                                        updateFeatureCount(data);
                                    },
                                    'error': function (xhr, status, error) {
                                            $('#map').toggleClass('loading');
                                            var err = xhr.responseText + xhr.status;
                                            console.log('problem deleting buildings'+ err);
                                    }
                                });
                        }else{

                        console.log('putting building');
                        map.featuresAt(e.point, {radius: 5, includeGeometry: true, layer: mapLayerCollection['buildings']}, function (err, glFeatures) {
                        if (err) throw err;
                        var tempObj = {
                            'type': 'Feature'
                        };
                        tempObj.geometry = glFeatures[0].geometry;
                        tempObj.properties = glFeatures[0].properties;
                        tempObj.properties['is_flooded'] = true;

                        $('#map').toggleClass('loading');
                        console.log("loading to push buildings");

                        var id = md5(JSON.stringify(tempObj));
                        tempObj.id = id;
                        //var saveURL = DATASETS_BASE + 'features/' + id + '?access_token=' + datasetsAccessToken;
                        //var saveURL = 'http://samweli.github.io/flood-map/data/dar_es_salaam-flooded-streets.geojson'
                       
                       // var saveURL = 'http://floods-daressalaam.rhcloud.com/put_data.php';

                        // var saveURL = 'http://localhost:5500/model/put_data.php';

                        var saveURL = site + 'put_data.php'


                        console.log("about to push buildings");
                        console.log(tempObj);
                        $.ajax({
                            'method': 'POST',
                            'crossDomain':true,
                            'url': saveURL,
                            'data': {'data' : tempObj},
                            'dataType': 'json',
                            'success': function (response) {
                                $('#map').toggleClass('loading');
                                console.log('no problem');
                                console.log(data);
                                tempObj.id = response.id;
                                tempObj.properties.id = response.id;

                                addedFeatures.push(tempObj);
                                data.features.push(tempObj);
                                addedBuildings.push(glFeatures[0].id);

                                selectedBuildingsSource.setData(getBuildings(data));
                                updateFeatureCount(data);
                            },
                            'error': function (xhr, status, error) {
                                $('#map').toggleClass('loading');
                                var err = xhr.responseText + xhr.status;
                                console.log('problem putting '+ err);
                            }
                        });
                    });
                    }// else close for inside buildings
                });
                }// else close for buildings
                            
                        });
                    }
                });
            }
        });
    }
});
// Updated data respectively of the sources 
function getRoads(data){
    var roads = {
        'type': 'FeatureCollection',
        'features': []
    };
    features = [];
    for (var i = 0; i < data.features.length; i++) {
        if(data.features[i].geometry.type === "LineString"){
            features.push(data.features[i]);
        }
    }
    roads.features = features;
    console.log('returned data');
    console.log(roads);
    return roads;
}
function getBuildings(data){
    var buildings = {
        'type': 'FeatureCollection',
        'features': []
    };
    features = [];
    for (var i = 0; i < data.features.length; i++) {
        if(data.features[i].geometry.type === "Polygon"){
            features.push(data.features[i]);
        }
    }
    buildings.features = features;

    console.log('returned data buildings');
    console.log(buildings);
    return buildings;
}
// return arranged data
function arrangeId(data){
    
    for (var i = 0; i < data.features.length; i++) {
        data.features[i].properties.id = data.features[i].id;
    }
    return data;
}


  //Update feature count
function updateFeatureCount(data) {
    var count = data.features.length;
    $('#feature-count').html(count);
}

function array2rgb(color) {
    // Combine and return the values
    return 'rgba(' + color.map(function (x) {
        return x * 255;
    }).join() + ')';
}

$(function () {
    $('#sidebar').mCustomScrollbar({
        theme: 'rounded-dots',
        scrollInertia: 100,
        callbacks: {
            onInit: function () {
                $('#sidebar').css('overflow', 'auto');
            }
        }
    });
});
