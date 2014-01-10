Parse.initialize("QvJbOzUIMLphGxYkonhtzfsa28udV7n58155MnHU", "87AcQFBUPOPsCXcsn5SG5acuH5VfGLDab4HKgW2K");
var tempData = [];
var chartData = [];

var updateParseInterval = 5000;

$(document).ready(function() {
	getParseData();
});

function getParseData() {
	var Temperature = Parse.Object.extend("Temperature");
	var query = new Parse.Query(Temperature);
	query.equalTo("type", "SOUSVIDE");
	query.limit(1000); 
	query.ascending("createdAt");
	query.find({
		success: function(results) {
			console.log("Successfully retrieved " + results.length + " temperatures.");
			// Do something with the returned Parse.Object values
			tempData = [];
			for (var i = 0; i < results.length; i++) {
				var object = results[i];
				//console.log(object.createdAt + ' - ' + object.get('value'));
				var temp = object.get('value');
				tempData.push(temp);
			}
			chartData = [];
			for (var i = 0; i < tempData.length; ++i) {
				chartData.push([i, tempData[i]]);
			}
			//updateChart(chartData);
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
	setTimeout(getParseData, updateInterval);
}

// set a time stamp of a session so that we know what data set to retrieve
// first call stop session to make sure that is dead
// then start with timestamp that will be used in the above to retrieve the sessions
// then start polling
function startSession(){
	var Session = Parse.Object.extend("Session");
	session = new Session();
	console.log(Date.now());
	//session.set("startTime",Date.now());
}


function getTempData() {
	return chartData;
}