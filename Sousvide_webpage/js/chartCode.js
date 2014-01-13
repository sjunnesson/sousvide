var updateInterval = 1000;

$(function() {

	var plot = $.plot("#cookingChart", [getTempData()], {
		series: {
			shadowSize: 0 // Drawing is faster without shadows
		},

		xaxis: {
			show: false
		},

	});

	function update() {

		var tempArray = getTempData();
		if (tempArray.length > 0) {
			console.log(tempArray[tempArray.length - 1][1]);
			$("#lastTempID").text("Last temp: " + tempArray[tempArray.length - 1][1]);
		}
		plot.setData([tempArray]);

		plot.setupGrid();
		plot.draw();
		setTimeout(update, updateInterval);
	}

	update();

});