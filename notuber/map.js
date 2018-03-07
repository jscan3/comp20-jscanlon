var myLat = 0; 
var myLng = 0;
var username = "TapqFEtdFF"; 
var myLocation; 
var map; 
var marker;
var passengersMarker;
var vehicleMarker;

function initMap() {

	var defaultLocation  = new google.maps.LatLng(0,0); 

	// configure map settings
	var myOptions = { 
		zoom: 13,
		center: defaultLocation,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	// create the map in the "map_canvas" div with default location
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions)

	// get location of user
	getMyLocation(); 
}

function getMyLocation() {

	if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
		navigator.geolocation.getCurrentPosition(function(position) {
			myLat = position.coords.latitude;
			myLng = position.coords.longitude;

			// render map with current location of user
			renderMap();
		});
	}

	else {
		alert("Geolocation is not supported by your web browser.  What a shame!");
	}

}

function renderMap() {

	myLocation = new google.maps.LatLng(myLat,myLng); 
	var myLocationOptions = {
		zoom: 15,
		center: myLocation, 
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	// render map to zoom to current location of user
	map = new google.maps.Map(document.getElementById("map_canvas"), myLocationOptions); 
	map.panTo(myLocation);

	var image = "myMarker.png";

	// set current marker of the user 
	 marker = new google.maps.Marker({
		position: myLocation, 
		icon: image
	}); 
	// add blue thumbtack marker to map
	marker.setMap(map);
	// get passenger or vehicle data
	getInformation();
}
function getInformation() {

	// create instance of XML object 
	var xhr = new XMLHttpRequest();
	// set URL
	var URL =  "https://jordan-marsh.herokuapp.com/rides";

	// sending in string as parameter to send function
	var params = "username=" + username + "&lat=" + myLat + "&lng=" + myLng;
	xhr.open("POST", URL, true); 

	// send proper header information along with request
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	// set up handler to deal with HTTP response 
	xhr.onreadystatechange = function() {

		// if request completed and HTTP status is ok, get response data
		if (xhr.readyState == 4 && xhr.status == 200) {

			// converts string into javascipt object
			var dataObject = JSON.parse(xhr.responseText); 
			// function to find closest vehicle or passenger
			getDistances(dataObject); 
		}
	}
	xhr.send(params);
}

function getDistances(dataObject){

	var passengersArray = dataObject.passengers;

	var myCoords = new google.maps.LatLng(myLat,myLng);
	var minDistance = Number.POSITIVE_INFINITY; 

	var closestPassenger = {};
	var closestVehicle = {};

	var passengerIcon = "passengerIcon.png";
	var vehicleIcon = "vehicleMarker.png";

	if (passengersArray != undefined) {

		for (var passengers of passengersArray) { 

			passengerLat = passengers["lat"];
			passengerLng = passengers["lng"];
			passengerCoords = new google.maps.LatLng(passengerLat, passengerLng);

			passengersMarker = new google.maps.Marker({
				position: passengerCoords, 
				icon: passengerIcon
			}); 

			// render individual passenger's pin on map
			passengersMarker.setMap(map);

			distance = google.maps.geometry.spherical.computeDistanceBetween(myCoords,passengerCoords);
			// convert distance from meters to miles
			distance = Math.round(distance * .000621371 * 1000)/1000;
			
			// send in content for infoWindow function
			infoWindow(passengers,passengersMarker,distance);

			// update minimum distance and cooresponding closestPassenger object 
			if (distance < minDistance) {
				minDistance = distance;
				closestPassenger = passengers;
			}
		}
		// invoke function to create info window on click of user's location pin
		myInfoWindow(closestPassenger,minDistance); 
	}

	// user is passenger 
	else { 

		var vehicleArray = dataObject.vehicles; 
		var closestVehicle = {};

		for (var vehicles of vehicleArray) { 

			vehicleLat = vehicles["lat"];
			vehicleLng = vehicles["lng"];
			vehicleCoords = new google.maps.LatLng(vehicleLat, vehicleLng);

			vehicleMarker = new google.maps.Marker({
				position: vehicleCoords, 
				icon: vehicleIcon
			}); 

			// render vehicle pin on map 
			vehicleMarker.setMap(map);

			distance = google.maps.geometry.spherical.computeDistanceBetween(myCoords,vehicleCoords);
			distance = Math.round(distance * .000621371 * 1000)/1000;

			infoWindow(vehicles,vehicleMarker,distance);

			if (distance < minDistance) {
				minDistance = distance;
				closestVehicle = vehicles;
			}
		}
		myInfoWindow(closestVehicle,minDistance);

	}

}

function myInfoWindow(nearestObject,minDistance) { 

	// declare and initialize content displayed on info window 
	var contentString = ""; 
	// passenger or driver
	var objectString = "";

	if (nearestObject.passengers == undefined)
		objectString = "driver"; 
	else 
		objectString = "passenger";

	if (minDistance == Number.POSITIVE_INFINITY) 
		contentString = "<h2> username: " + username + "</h2>" + "<br/>" + "<h2> Sorry no available " + objectString + "!</h2>";
	else 
		contentString = "<h2> username: " + username + "</h2>" + "<br/>" + "<h2> closest " + objectString + ": " + minDistance +  " miles</h2>";

	var myInfoWindow = new google.maps.InfoWindow();
			
	// Open info window on click of marker
	google.maps.event.addListener(marker, 'click', function() {
			myInfoWindow.setContent(contentString);
			myInfoWindow.open(map, marker);
	});
}

function infoWindow(dataObject,marker,distance) {

	var objectString = ""; 
	username = dataObject["username"];

	if (dataObject.passengers != undefined)
		objectString = "driver"; 
	else 
		objectString = "passenger";

	var infoWindow = new google.maps.InfoWindow(); 
	// diplayed content for each passenger or vehicle icon
	var contentString = "<h2> username: " + username + "</h2>" + "<br/>" + "<h2> distance: " + distance + " miles</h2>";

	
	google.maps.event.addListener(marker, 'click', function() {
			infoWindow.setContent(contentString);
			infoWindow.open(map,marker);
	});
}