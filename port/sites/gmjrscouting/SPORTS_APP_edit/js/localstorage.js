/**

	This file defines local storage functionality

*/
_LS_Config = new Object();




_LS_IsLocalStorageEnabled = function() {
	if(typeof(Storage) !== "undefined") return true;
	else return false;
}




_LS_AttachConnectivityListeners = function(obj) {

	if(obj.OfflineCallback)
		window.addEventListener("offline", obj.OfflineCallback(), false);

	if(obj.OnlineCallback)
		window.addEventListener("online", function() { 
			obj.OnlineCallback();
			obj.UploadRecords();
		}, false);	
		
	window.applicationCache.addEventListener("error", function(e) {
		alert('Error: window.applicationCache issue');
		console.log("Error: Most Likely Offline");
	});
		
}



LS_IsDataAvailable = function() {
	
	if(localStorage.length > 0) { return true; }
	else { return false; }
		
}



LS_GetAllRecords = function() {
	var records = [];
	for(var key in localStorage) {
		records.push($j.parseJSON(localStorage[key]));
	}
	return records;
}



//uploads all local storage records to database via function defined in options
LS_UploadRecords = function(obj) {
	if(obj.UploadRecords != undefined)
		obj.UploadRecords();
}



LS_EmptyStorage = function() {
	localStorage.clear();	
}




LS_IsOnline = function() {
	if (navigator.onLine) 	{ return true; }
	else 					{ return false; }
}




/**

	Stores array of key value pairs
	
	Parameters:
	(array)		arr			array of key value pairs | key = 0, value = 1
	(string)	fieldName	field to store data in locally.  This is the key's value we are searching for in arr

*/
LS_StoreData = function(arr, fieldName) {

	//if we are online, no need to store data
	if(LS_IsOnline() == true)
		return false;
	
	var field	= '';

	for(var i=0; i<arr.length; i++) 
		if(arr[i][0] == fieldName)
			field = arr[i][1];
			
	if(field != '') {
		localStorage.setItem(field, JSON.stringify(arr));
	}
	else
		console.log('could not store', fieldName, arr);
}




LS_UpdateOnlineStatus = function() {
	if(_LS_Config.indicator != undefined) {
		if(LS_IsOnline)	{ document.getElementById(obj.indicator).innerHTML = '<span style="color: green;">Online</span>'; }
		else			{ document.getElementById(obj.indicator).innerHTML = '<span style="color: #C00;">Offline</span>'; }
	}
}





/**

	Parameters:
	
	(object)		obj
	(string)		obj.indicator 			status indicator
	(function)		obj.OnlineCallback		name of callback func for online connected
	(function)		obj.OfflineCallback		name of callback func for offline disconnected
	(function)		obj.UploadRecords		name of function to upload all records in local storage to db


*/
LS_Init = function(obj) {
	
	if(_LS_IsLocalStorageEnabled == false) {
		alert('Local Storage Not Available On This Device');
		return false;
	}
	
	
	if(LS_IsDataAvailable() == true) {
		console.log('data available');
		LS_UploadRecords(obj);
	}
	
	console.log('attaching listeners');
	_LS_AttachConnectivityListeners(obj);

	if(obj.indicator) 
		_LS_Config.indictaor = obj.indicator;

	LS_UpdateOnlineStatus();		
}

