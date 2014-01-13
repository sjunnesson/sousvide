// web.js
var express = require("express");
var logfmt = require("logfmt");
var Kaiseki = require('kaiseki');
var https = require('https');


// PARSE variables 
var APP_ID = 'QvJbOzUIMLphGxYkonhtzfsa28udV7n58155MnHU';
var REST_API_KEY = 'C6oYtNXc7Hd135iLQOnOgTcJAAzPlMLAh5AZGpRN';
var UPDATE_INTERVAL = 5000;

// SPARK variables
var SPARK_URL_BASE = "api.spark.io";
var SPARK_URL_PATH = "/v1/devices/";

var SPARK_CORE_ID = "53ff6d065067544833330587"; // SOUSVIDE
var SPARK_CORE_IDS = [SPARK_CORE_ID];
var SPARK_CORE_ACCESS_TOKEN = "8625bb578da1b5bd235d782cf851c504fa4ca678";

var SPARK_VARIABLE = "temperature";
var sparkIDCounter = 0;


// instantiate 
var kaiseki = new Kaiseki(APP_ID, REST_API_KEY);
var app = express();


app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
	res.send('Hello World!');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});

//##############################################################################################################
// PARSE KAISEIKU functions

var className = 'Temperature';

function sendToParse(className, newValue, senderCore) {

	// new sensor object to be stored
	var sensor = {
		type: 'SOUSVIDE',
		coreID: senderCore,
		value: newValue.toString()
	};

	kaiseki.createObject(className, sensor, function(err, res, body, success) {
		//console.log('object created = ', body);
		// if the post fails we keep pushing until we get through
		if (success == false) {
			console.log('Failed updating so trying again');
			updateParse(className, sensor.value)
		} else {
			nextSparkCoreID();
		}
	});
}

function updateParse(className, newValue, senderCore) {
	if (newValue != 'undefined' || newValue != undefined) {
		// the temp should never go above boiling so ignore all values above that
		if (newValue < 150 && Math.floor(newValue) != 0) {
			sendToParse(className, newValue, senderCore);
			getSparkMode(SPARK_CORE_IDS[sparkIDCounter]);

		} else {
			console.log("Strange value found so ignoring it...");
			nextSparkCoreID();
		}
	}
}



//##############################################################################################################
// SPARK CORE functions

// retrieves the SPARK variable and makes it into a JSON object

function getSparkValue(coreID) {
	//console.log("Getting spark core id: "+ sparkIDCounter);
	https.get("https://api.spark.io/v1/devices/" + coreID + "/" + SPARK_VARIABLE + "?access_token=" + SPARK_CORE_ACCESS_TOKEN, function(res) {
		console.log("--------------------------------------------");
		//console.log("Core number: " + sparkIDCounter);
		console.log("statusCode: ", res.statusCode);

		// only update of we had a successful retrieval from Spark
		if (res.statusCode == 200) {
			data = "";
			res.on('data', function(d) {
				data += d;
				//	process.stdout.write(d);
			});
			res.on('end', function() {
				var jsonifiedData = JSON.parse(data)
				console.log("Value:" + jsonifiedData.result);
				console.log("Core ID: ", jsonifiedData.coreInfo.deviceID);
				updateParse(className, jsonifiedData.result, jsonifiedData.coreInfo.deviceID);
				//updateParse(className, 0.00, jsonifiedData.coreInfo.deviceID);
			});
		} else {
			nextSparkCoreID();
		}
	}).on('error', function(e) {
		console.log(e);
	});
}

function getSparkMode(coreID) {
	//console.log("Getting spark core id: "+ sparkIDCounter);
	https.get("https://api.spark.io/v1/devices/" + coreID + "/getMode?access_token=" + SPARK_CORE_ACCESS_TOKEN, function(res) {

		// only update of we had a successful retrieval from Spark
		if (res.statusCode == 200) {
			data = "";
			res.on('data', function(d) {
				data += d;
				//	process.stdout.write(d);
			});
			res.on('end', function() {
				var jsonifiedData = JSON.parse(data);
				console.log("Mode: " + jsonifiedData.result);
			});
		}
	}).on('error', function(e) {
		console.log(e);
	});
}


function nextSparkCoreID() {
	if (sparkIDCounter < SPARK_CORE_IDS.length - 1) {
		sparkIDCounter++;
		getSparkValue(SPARK_CORE_IDS[sparkIDCounter]);
	} else {
		sparkIDCounter = 0;
		setTimeout(function() {
			console.log("#####################################################################")
			getSparkValue(SPARK_CORE_IDS[sparkIDCounter]);
		}, UPDATE_INTERVAL);
	}
}

//##############################################################################################################
// TIMER functions
console.log("Starting timer with interval: " + UPDATE_INTERVAL);
// get the first spark core value to kick off the polling routine

getSparkValue(SPARK_CORE_IDS[sparkIDCounter]);