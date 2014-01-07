// web.js
var express = require("express");
var logfmt = require("logfmt");
var Kaiseki = require('kaiseki');
var https = require('https');


// PARSE variables 
var APP_ID = 'ww6FQ3CumG9kHfrR6DYZUTLMH6d6Dbvg0EBeHC8o';
var REST_API_KEY = 's0L4ELQK3RvjCv1mUl1lJTHS3coKJfXICRZvKh3l';
var UPDATE_INTERVAL = 10000;

// SPARK variables
var SPARK_URL_BASE = "api.spark.io";
var SPARK_URL_PATH = "/v1/devices/";
var SPARK_CORE_ID_A = "53ff6c065067544831120787"; // A
var SPARK_CORE_ID_B = "48ff6d065067555009342387"; // B
var SPARK_CORE_ID_C = "48ff6c065067555031092287"; // C
var SPARK_CORE_ID_D = "53ff67065067544820110687"; // D
var SPARK_CORE_ID_E = "53ff6c065067544828320187"; // E
var SPARK_CORE_ID_F = "50ff6d065067545625570287"; // F
var SPARK_CORE_IDS = [SPARK_CORE_ID_A, SPARK_CORE_ID_B, SPARK_CORE_ID_C, SPARK_CORE_ID_D, SPARK_CORE_ID_E, SPARK_CORE_ID_F];
var SPARK_CORE_ACCESS_TOKEN = "8625bb578da1b5bd235d782cf851c504fa4ca678";
//var SPARK_FUNCTION = "presence";
var SPARK_VARIABLE = "presence";
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

var className = 'Room3';

function sendToParse(className, newValue, senderCore) {

	// new sensor object to be stored
	var sensor = {
		type: 'PIR',
		// sender: 'PIR_3',
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
		// query with parameters
		var params = {
			where: {
				coreID: senderCore
			},
			order: '-createdAt'
		};

		kaiseki.getObjects(className, params, function(err, res, body, success) {
			if (success) {
				// check if this core has been identified before
				if (body[0] != undefined) {
					if (body[0].value != "undefined") {
						if (body[0].value != newValue) {
							console.log('New val: ' + newValue + " old: " + body[0].value);
							sendToParse(className, newValue, senderCore);
						} else {
							console.log("No new value");
							nextSparkCoreID();
						}
					}
				} else {
					// a new core has been found so add it without checking for previous value
					console.log("Core ID not found so adding it to Parse");
					sendToParse(className, newValue, senderCore);
				}
			} else {
				console.log("Failed fetching data from Parse");
			}
		});
	}
}



//##############################################################################################################
// SPARK CORE functions

// retrieves the SPARK variable and makes it into a JSON object

function getSparkValue(coreID) {
	//console.log("Getting spark core id: "+ sparkIDCounter);
	https.get("https://api.spark.io/v1/devices/" + coreID + "/" + SPARK_VARIABLE + "?access_token=" + SPARK_CORE_ACCESS_TOKEN, function(res) {
		console.log("--------------------------------------------");
		console.log("Core number: " + sparkIDCounter);
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
				console.log("Presence:" + jsonifiedData.result);
				console.log("Core ID: ", jsonifiedData.coreInfo.deviceID);
				updateParse(className, jsonifiedData.result, jsonifiedData.coreInfo.deviceID);
			});
		} else {
			nextSparkCoreID();
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
			console.log("####################################################################################")
			getSparkValue(SPARK_CORE_IDS[sparkIDCounter]);
		}, UPDATE_INTERVAL);
	}
}

//##############################################################################################################
// TIMER functions
console.log("Starting timer with interval: " + UPDATE_INTERVAL);
// get the first spark core value to kick off the polling routine
getSparkValue(SPARK_CORE_IDS[sparkIDCounter]);

// setInterval(function() {
// 	getSparkValue(SPARK_CORE_IDS[sparkIDCounter]);
// }, UPDATE_INTERVAL);