Parse.initialize("QvJbOzUIMLphGxYkonhtzfsa28udV7n58155MnHU", "87AcQFBUPOPsCXcsn5SG5acuH5VfGLDab4HKgW2K");


$(document).ready(function() {
	var GameScore = Parse.Object.extend("GameScore");
	var query = new Parse.Query(GameScore);
	query.equalTo("playerName", "Dan Stemkoski");
	query.find({
		success: function(results) {
			alert("Successfully retrieved " + results.length + " scores.");
			// Do something with the returned Parse.Object values
			for (var i = 0; i < results.length; i++) {
				var object = results[i];
				alert(object.id + ' - ' + object.get('playerName'));
			}
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
});