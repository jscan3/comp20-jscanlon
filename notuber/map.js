var myLat = 0; 
var myLng = 0;
var username = "TapqFEtdFF"; 
var myLocation; 
var map; 
var marker;
var passengerMarker; 
var vehicleMarker;

function initMap() {
	var defaultLocation  = new google.maps.LatLng(0,0); 

	// set up map 
	var myOptions = { 
		zoom: 13,
		center: defaultLocation,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}; 
	// create the map in the "map_canvas" div with default location
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions)

	// get location
	getMyLocation(); 
}
function getMyLocation() {
	if (navigator.geolocation) { // the navigator.geolocation object is supported on your browser
		navigator.geolocation.getCurrentPosition(function(position) {
			myLat = position.coords.latitude;
			myLng = position.coords.longitude;
			// render map with location of user
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
	map = new google.maps.Map(document.getElementById("map_canvas"), myLocationOptions); 
	map.panTo(myLocation);

	var image = "myMarker.png";

	// set current marker of the user 
	 marker = new google.maps.Marker({
		position: myLocation, 
		icon: image
	}); 
	marker.setMap(map);
	getInformation();
}
function getInformation() {

	// create instance of XML object 
	var xhr = new XMLHttpRequest();
	// set URL
	var URL =  "https://jordan-marsh.herokuapp.com/rides";
	// sending in parameter
	var params = "username=" + username + "&lat=" + myLat + "&lng=" + myLng; 
	xhr.open("POST", URL, true); 
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	// set up handler to deal with HTTP response 
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			// converts string into javascipt object
			var dataObject = JSON.parse(xhr.responseText); 
			// find closest vehicle or passenger
			getDistances(dataObject); 
			//infoWindow();

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

			distance = Math.round(google.maps.geometry.spherical.computeDistanceBetween(myCoords,passengerCoords));
			passengersMarker.setMap(map);
			//
			infoWindow(passengers,passengersMarker,distance);

			if (distance < minDistance) {
				minDistance = distance;
				closestPassenger = passengers;
			}
		}
		myInfoWindow(passengers,minDistance); 
		//infoWindow(closestPassenger);
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

			distance = google.maps.geometry.spherical.computeDistanceBetween(myCoords,vehicleCoords);
			// convert distance from meters to miles
			distance = Math.round(distance * .000621371 * 1000)/1000;
			// render vehicle pin on map 
			vehicleMarker.setMap(map);
			// create info window on vehicle pin 
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

	var objectString = "";
	if (nearestObject.passengers == undefined)
		objectString = "driver"; 
	else 
		objectString = "passenger";
	// This is a global info window...
	var myInfoWindow = new google.maps.InfoWindow();

	var contentString = "<h2> username: " + username + "</h2>" + "<br/>" + "<h2> closest " + objectString + ": " + minDistance +  " miles</h2>";
				
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
	// global info window 
	var infoWindow = new google.maps.InfoWindow(); 

	var contentString = "<h2> username: " + username + "</h2>" + "<br/>" + "<h2> distance: " + distance + " miles</h2>";

	// Open info window on click of marker
	google.maps.event.addListener(marker, 'click', function() {
			infoWindow.setContent(contentString);
			infoWindow.open(map,marker);
	});
}

// function infoWindow(dataObject,marker,distance) {
// 	var infoWindow = new google.maps.InfoWindow(); 

// 	// Open info window on click of marker 
// 	google.maps.event.addListener()

// }





		//var defaultLocation = new Google.maps.LatLng(0,0); 

		// getMyLocation(); 
		// 	}

		// 	function getMyLocation() {
		// 		if (navigator.geolocation)
		// 			getCurrentPosition(
		// 			function(position) {
		// 				myLat = position.coords.latitude; 
		// 				myLng = position.coords.longitude; 
		// 				elem = document.getElementById("location")
		// 				elem.innerHTML = "<h2> You are located at " + mylat + ", " + myLng + "</h2"; 
		// 			}); 
		// 		else {
		// 			alert("Geolocation is not supported by your web browser.");
		// 		}
		// 	}


// TODO:
// 1. Get your location
// 2. (Put this step inside of the callback of get your location) call getsetcurrmarker and getinfo inside of getgeolocation function
// 3. Get the data in the Json format of a string, need to parse the string using json parse 
// 4. Do console log 