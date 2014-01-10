var updateInterval = 5000;

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

		plot.setData([getTempData()]);

		// Since the axes don't change, we don't need to call 
		plot.setupGrid();
		plot.draw();
		setTimeout(update, updateInterval);
	}

	update();

});