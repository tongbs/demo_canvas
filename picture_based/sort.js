//[{"x":298,"y":104},{"x":302,"y":379},{"x":461,"y":373},{"x":463,"y":89}]
// Array of points;
const points = [{x:11,y:5},{x:9,y:8},{x:4,y:8},{x:4,y:2},{x:9,y:2}];

// Find min max to get center
// Sort from top to bottom
points.sort((a,b)=>a.y - b.y);

// Get center y
const cy = (points[0].y + points[points.length -1].y) / 2;

// Sort from right to left
points.sort((a,b)=>b.x - a.x);

// Get center x
const cx = (points[0].x + points[points.length -1].x) / 2;

// Center point
const center = {x:cx,y:cy};

// Pre calculate the angles as it will be slow in the sort
// As the points are sorted from right to left the first point
// is the rightmost

// Starting angle used to reference other angles
var startAng;
points.forEach(point => {
    var ang = Math.atan2(point.y - center.y,point.x - center.x);
    if(!startAng){ startAng = ang }
    else {
         if(ang < startAng){  // ensure that all points are clockwise of the start point
             ang += Math.PI * 2;
         }
    }
    point.angle = ang; // add the angle to the point
});

//UPDATE correction
// ****************************************************
// UPDATE the following code is incorrect
// ****************************************************
// Sort anti clockwise;
// points.sort((a,b)=> b.angle - a.angle);
// ****************************************************
// https://stackoverflow.com/questions/45660743/sort-points-in-counter-clockwise-in-javascript
//=====================================================
// the correct way to sort anticlockwise     
//=====================================================

// first sort clockwise
points.sort((a,b)=> a.angle - b.angle);
console.log("points: ",points)
// then reverse the order
const counter_clockwise = new Array();
for(var i=0; i<points.length; i++){
  counter_clockwise.push(points[i]);
}
console.log("counter: ",counter_clockwise);