$('#startBtn').on('click', function(e) {

	console.log("start");
	startMachine();
})

$('#stopBtn').on('click', function(e) {

	console.log("stop");
	stopMachine();

})

$('#autoTuneBtn').on('click', function(e) {

	console.log("auto tune");
	autoTuneMachine();

})

$('#setTargetBtn').on('click', function(e) {

	console.log("set target");
	setTargetTemperature($('#targetTempField').val());

})

function startMachine() {

}

function stopMachine() {


}

function autoTuneMachine() {

}

function setTargetTemperature(targetVal) {

}