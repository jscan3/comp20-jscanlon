All functions of the index.html, map.js, and main.css have been correctly 
implemented. In index.html, the script tag is properly used to point to the 
external map javascript file. This file implements functions that initialize 
the google map, gets the location coordinates of the user, and computes 
the distances between the user (passenger or vehicle) with their opposite.
This means that if the user is a vehicle, the getDistances function calculates 
all the distances between them and the available passengers. Then, the
myInfoWindow function is invoked to display the distance of the closest driver 
or passenger along with their corresponding username on the user's marker.
Additionally, a second infoWindow function is called to display both the
username and the distance between that passenger or driver and the user's 
current location. 

I spent 7 hours completing this assignment 