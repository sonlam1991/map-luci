
function radians_to_degrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}

function degrees_to_radians(degrees) {
    return degrees * Math.PI / 180;
}
function calculate_initial_compass_bearing(pointA, pointB) {
    const lat1 = degrees_to_radians(pointA[0]);
    const lat2 = degrees_to_radians(pointB[0]);

    const diffLong = degrees_to_radians(pointB[1] - pointA[1]);

    const x = Math.sin(diffLong) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - (Math.sin(lat1)
        * Math.cos(lat2) * Math.cos(diffLong));

    let initial_bearing = Math.atan2(x, y);

    initial_bearing = radians_to_degrees(initial_bearing);
    const compass_bearing = (initial_bearing + 360) % 360;

    return compass_bearing;
}


pointA = [20.99559963827694, 105.84126583206178]
pointB = [20.992898431839215, 105.84113708602902]

console.log(calculate_initial_compass_bearing(pointA, pointB));