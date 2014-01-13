var SPARK_CORE_ID = "53ff6d065067544833330587";
var SPARk_API_TOKEN = "8625bb578da1b5bd235d782cf851c504fa4ca678";
var machineMode = 0;

$('#autoTuneBtn').on('click', function(e) {

	console.log("auto tune");
	autoTuneMachine();

});

$('#setTargetBtn').on('click', function(e) {

	setTargetTemperature($('#targetTempField').val());

});
$('#controllBtn').on('click', function(e) {
	if (machineMode == 0) {
		startSession(SPARK_CORE_ID);
		startMachine();
	} else {
		stopSession(SPARK_CORE_ID);
		stopMachine();
	}
});


function startMachine() {
	console.log("Sending start to Spark");
	//startSession(SPARK_CORE_ID);
	sendToSpark("start", "");
}

function stopMachine() {
	console.log("Sending stop to Spark");
	sendToSpark("stop", "");
}

function autoTuneMachine() {
	sendToSpark("autoTune", "");
}

function setTargetTemperature(targetVal) {
	updateMainSessionVariable("targetTemperature",targetVal);
	sendToSpark("setTemp", targetVal.toString());
}

function getMachineMode() {
	$.get("https://api.spark.io/v1/devices/" + SPARK_CORE_ID + "/getMode?access_token=" + SPARk_API_TOKEN, function(data, status) {
		//console.log(data.result);
		machineMode = data.result;
		setUIMode(machineMode);
	});
}

function getTargetTemp() {
	$.get("https://api.spark.io/v1/devices/" + SPARK_CORE_ID + "/targetTemp?access_token=" + SPARk_API_TOKEN, function(data, status) {
		targetTemp = data.result;
		$("#targetTempID").text("Target temp: " + targetTemp);
	});
}

function initSpark(tempVal , sparkMode){
	setTargetTemperature(tempVal);
	if(sparkMode==1){
		startMachine();
	}else{
		stopMachine();
	}
}

function setUIMode(mode) {
	//the machine is off
	switch (mode) {
		case 0: //machine off
			$("#controllBtn").text("Start");
			break;
		case 1: //machine on
			$("#controllBtn").text("Stop");
			break;
	}
}


function getFromSpark(variableName) {
	$.get("https://api.spark.io/v1/devices/" + SPARK_CORE_ID + "/" + variableName + "?access_token=" + SPARk_API_TOKEN, function(data, status) {
		//alert("Data: " + data + "\nStatus: " + status);
		console.log(data);
	});
}



setInterval(function() {
	getMachineMode();
}, 2000);
setInterval(function() {
	getTargetTemp();
}, 5000);

function sendToSpark(functionName, args) {
	$.post("https://api.spark.io/v1/devices/" + SPARK_CORE_ID + "/" + functionName, {
			access_token: SPARk_API_TOKEN,
			args: args
		},
		function(data, status) {
			console.log("Data: " + data + "\nStatus: " + status);
		});
}