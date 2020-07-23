var drawingManager;
var selectedShape;
var colors = ['#1E90FF', '#FF1493', '#32CD32', '#FF8C00', '#4B0082'];
var selectedColor;
var colorButtons = {};

var coordinatesPolygon;
var coordinatesTarget;

function clearSelection() {
  if (selectedShape) {
    selectedShape.setEditable(false);
    selectedShape = null;
  }
}

function setSelection(shape) {
  clearSelection();
  selectedShape = shape;
  shape.setEditable(false);
  selectColor(shape.get('fillColor') || shape.get('strokeColor'));
}

function deleteSelectedShape() {
  if (selectedShape) {
    selectedShape.setMap(null);
  }
}

function selectColor(color) {
  selectedColor = color;
  for (var i = 0; i < colors.length; ++i) {
    var currColor = colors[i];
    colorButtons[currColor].style.border = currColor == color ? '5px solid #789' : '5px solid #fff';
  }
  var polygonOptions = drawingManager.get('polygonOptions');
  polygonOptions.fillColor = color;
  drawingManager.set('polygonOptions', polygonOptions);
  
}

function setSelectedShapeColor(color) {
  if (selectedShape) {
    if (selectedShape.type == google.maps.drawing.OverlayType.POLYLINE) {
      selectedShape.set('strokeColor', color);
    } else {
      selectedShape.set('fillColor', color);
    }
  }
}

function makeColorButton(color) {
  var button = document.createElement('span');
  button.className = 'color-button';
  button.style.backgroundColor = color;
  google.maps.event.addDomListener(button, 'click', function() {
    selectColor(color);
    setSelectedShapeColor(color);
  });

  return button;
}

function buildColorPalette() {
  var colorPalette = document.getElementById('color-palette');
  for (var i = 0; i < colors.length; ++i) {
    var currColor = colors[i];
    var colorButton = makeColorButton(currColor);
    colorPalette.appendChild(colorButton);
    colorButtons[currColor] = colorButton;
  }
  selectColor(colors[0]);
}

function getLocation() {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert("Geolocation is not support by this browser!");
  }
}

function coordinateStringtofloat(coord) {
  var len = coord.length;
  var new_coord = [];
  console.log(len);
  for(i=0; i<len; i++) {
    coord = coord.replace("(","");
    coord = coord.replace(")","");
    coord = coord.replace(" ","");
  }
  var res = coord.split(",");
  console.log("res",res);
  for(i=0; i<res.length; i+=2) {
    var tmp = [];
    tmp.push(parseFloat(res[i]));
    tmp.push(parseFloat(res[i+1]));
    new_coord.push(tmp);
  }
  return new_coord;
}

function showPosition(position) {
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  map.setCenter(new google.maps.LatLng(lat, lng));
}

function checkPointInsidePolygon(vs, point) {
  console.log("cal polygon",vs);
  console.log("cal point",point);
/*      
  p5<------p4
  '          '
  '           '
  '            p3
  '             '           
  '           '
  '         ' 
  p1------>p2
*/
  //point:target, vs:polygon (oreder is counter-clockwise)
  // ray-casting algorithm based on
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
  var x = point[0][0], y = point[0][1];

  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      var xi = vs[i][0], yi = vs[i][1];
      var xj = vs[j][0], yj = vs[j][1];

      var intersect = ((yi > y) != (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
  }
  return inside;
}

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 18,
    center: new google.maps.LatLng(24.786282, 120.997929),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    zoomControl: true
  });

  var polyOptions = {
    strokeWeight: 0,
    fillOpacity: 0.45,
    editable: true
  };
  
  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: null,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: ["marker","polygon"]
    },
    markerOptions: {
      draggable: true,
      icon:
        "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
    },
    polygonOptions: polyOptions,
    map:map 
  });

  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
    if (e.type != google.maps.drawing.OverlayType.MARKER) {
      // Switch back to non-drawing mode after drawing a shape.
      drawingManager.setDrawingMode(null);

      var coordinatesStringArray = e.overlay.getPath().getArray().toString();
      coordinatesArray = coordinateStringtofloat(coordinatesStringArray);
      console.log("Coordinate: ",coordinatesArray);

      coordinatesPolygon = coordinatesArray;

      // Add an event listener that selects the newly-drawn shape when the user
      // mouses down on it.
      var newShape = e.overlay;
      newShape.type = e.type;
      google.maps.event.addListener(newShape, 'click', function() {
        setSelection(newShape);
      });
      setSelection(newShape);
    }
    else {
      coordinatesStringTarget = e.overlay.position.toString();
      coordinatesTarget = coordinateStringtofloat(coordinatesStringTarget);
    }
    
  });
  // Clear the current selection when the drawing mode is changed, or when the map is clicked.
  google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
  google.maps.event.addListener(map, 'click', clearSelection);
  google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', deleteSelectedShape);
  document.getElementById('set-button').onclick = function () {
    console.log("click");
    if(coordinatesPolygon!=null && coordinatesTarget!=null) {
      console.log("coordinatesPolygon",coordinatesPolygon);
      console.log("coordinatesTarget: ",coordinatesTarget);
      var result = checkPointInsidePolygon(coordinatesPolygon,coordinatesTarget);
      console.log(result);
    }
    if(result == true) {
      alert("目標點 在 圍籬內!!");
    } else {
      alert("目標點 不在 圍籬內!!");
    }
  };
  buildColorPalette();
}
google.maps.event.addDomListener(window, 'load', initMap);

//var test = [[24.786029,120.997994], [24.786056,120.998887], [24.787013,120.998852], [24.787023,120.997980]];  //library
//console.log(test);