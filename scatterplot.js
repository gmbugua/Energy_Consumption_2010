/*
	ALL SUPPORTED 
	-------------
	
	i) pan + drag => Set all of the points to be responsible for all pointer events.
		             This with the default zoom package, allows us pan and drag with
					 our points.
					 
	ii) zoom in => To zoom in we need to rescale our x and y axis when we zoom.
				   That's what the, "zoomed," function does. It rescales the axis 
				   relative to the transformation and all of the points in the 
				   scatter plot to the new axis. 
				   
	iii) Country name + tooltip  => I decided to stick with only the tool tip
									because the country name was just extra 
									clutter in the visualization. To implement this
									I set the tool tip posiiton relative to the page position of the points.
*/

/* 
	SVG Setup 
	---------
*/
var width = 1300;
var height = 860;

var margin = {
	top: 100,
	right: 100,
	bottom: 100,
	left: 100
}

var svgWidth = width - margin.left - margin.right;
var svgHeight = height - margin.top - margin.bottom;

var svg = d3.select("body")
	.append("svg")
	.attr("class", "scatter_plot")
	.attr("width", svgWidth + margin.left + margin.right)
	.attr("height", svgHeight + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	.style("background-color", "None");

/* append tooltip div to doc */
var tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

d3.csv("scatterdata.csv").then(function (data) {

	var countries = data.map(function (d) {
		return {
			country: d.country,
			values: {
				gdp: +d.gdp,
				population: +d.population,
				epc: +d.ecc,
				tec: +d.ec
			}
		}
	});

	var gdp_list = countries.map(function (c) {
		return c.values.gdp;
	});

	var epc_list = countries.map(function (c) {
		return c.values.epc;
	});

	var tec_list = countries.map(function (c) {
		return c.values.tec;
	});

	var gdp_max = d3.max(gdp_list) + 3;
	var epc_max = d3.max(epc_list);
	var tec_max = d3.max(tec_list);

	var xScale = d3.scaleLinear().domain([0, gdp_max]).range([0, svgWidth]);
	var yScale = d3.scaleLinear().domain([0, epc_max]).range([svgHeight, 0]);
	var rScale = d3.scaleLinear().domain([0, tec_max]).range([1, 100]);
	
	var zScale = d3.scaleSequential(d3.interpolateRainbow);
	zScale.domain([d3.min(tec_list), d3.max(gdp_list) / 60]);

	// X Axis
	var gX = svg.append("g")
		.attr("class", "axis x axis")
		.attr("transform", "translate(0," + svgHeight + ")")
	  	.call(d3.axisBottom(xScale));
	
	// Add X axis label:
	svg.append("text")
		.attr("text-anchor", "end")
		.attr("x", svgWidth / 2 + 100)
		.attr("y", svgHeight + margin.bottom - 30)
		.text("GDP (in Trillion US Dollars) in 2010")
		.attr("font-size", "20px");

	// Y Axis
	var gY = svg.append("g")
		.attr("class", "axis y axis")
		.call(d3.axisLeft(yScale));

	// Y axis label:
	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.attr("x", -svgHeight / 2)
		.attr("y", -margin.left + 25)
		.text("Energy Consumption per Capita (in Millions BTUs per person)")
		.attr("font-size", "20px");

	// Country, by data
	var scatter = svg.append("g");
	scatter.selectAll("cirlce")
		.data(countries)
		.enter()
		.append("circle")
		.attr("class", "dot")
		.attr("r", function (d) {
			return rScale(d.values.tec);
		})
		.attr("cx", function (d) {
			return xScale(d.values.gdp);
		})
		.attr("cy", function (d) {
			return yScale(d.values.epc);
		})
		.style("fill", function (d) {
			return zScale(d.values.gdp);
		}).style("opacity", ".6")
		.style("pointer-events", "all") // Set pointer events to circles.
		.on("mouseover", function (d) {
			var html =
				"<div><p><strong>Country:</strong>" + " " + d.country + "</p></div>" +

				"<span>" + "<p><strong>Population:</strong> " + d.values.population + " " + "Million</p>" + "</span>" +
				"<span>" + "<strong><p>GDP: </strong>" + d.values.gdp + " " + "Trillion</p>" + "</span>" +
				"<span>" + "<strong><p>EPC: </strong>" + d.values.epc + " " + "Million BTUs </p>" + "</span>" +
				"<span>" + "<strong><p>Total: </strong>" + d.values.tec + " " + "Trillion BTUs </p>" + "</span>";
		
			/*
				Set the html of our tooltip to the html created above. 
				Position the tooltip based on the page position of the circle.
				Give it a transition for when it pops up.
			*/
			tooltip.html(html)
				.style("left", d3.event.pageX + 15 + "px")
				.style("top", d3.event.pageY - 15 + "px")
				.transition()
				.duration(200)
				.style("opacity", .9)
		}).on("mouseout", function (d) {
			tooltip.transition()
				.duration(300)
				.style("opacity", 0);
		})


	/* 
		Legend SVG
		----------
	*/

	var legend_svg = d3.selectAll(".legend")
		.append("svg")
		.attr("width", 400)
		.attr("height", 400)
		.style("background-color", "None")
		.attr("stroke", "None");

	// Legend Title
	legend_svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", 20 + 150)
		.attr("y", 50)
		.text("Legend")
		.attr("font-family", "sans-serif")
		.attr("font-size", "24px")
		.attr("fill", "white");

	// Circle 1
	legend_svg.append("circle")
		.attr("class", "dot")
		.attr("r", rScale(5))
		.attr("cx", 20 + 200)
		.attr("cy", 100)
		.attr("fill", zScale(7))
		.attr("stroke", "#545353")
		.attr("stroke-width", "1");

	legend_svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", 20 + 60)
		.attr("y", 105)
		.text("TEC of 5 Trillion")
		.attr("font-family", "sans-serif")
		.attr("font-size", "17px")
		.attr("fill", "white");

	// Circle 2
	legend_svg.append("circle")
		.attr("class", "dot")
		.attr("r", rScale(10))
		.attr("cx", 20 + 200)
		.attr("cy", 160)
		.attr("fill", zScale(11))
		.attr("stroke", "#545353")
		.attr("stroke-width", "1");

	legend_svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", 20 + 60)
		.attr("y", 165)
		.text("TEC of 10 Trillion")
		.attr("font-family", "sans-serif")
		.attr("font-size", "17px")
		.attr("fill", "white");

	// Circle 3
	legend_svg.append("circle")
		.attr("class", "dot")
		.attr("r", rScale(100))
		.attr("cx", 20 + 250)
		.attr("cy", 280)
		.attr("fill", zScale(101))
		.attr("stroke", "#545353")
		.attr("stroke-width", "1");

	legend_svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", 20 + 60)
		.attr("y", 265)
		.text("TEC of 100 Trillion")
		.attr("font-family", "sans-serif")
		.attr("font-size", "17px")
		.attr("fill", "white");

	/* Zoom Pan, Drag */
	
	// Can zoom from 0x to 20x
	var zoom = d3.zoom()
		.scaleExtent([0, 20])
		.on("zoom", zoomed);
	
	// reset button calls the zoom reset button
	d3.select(".reset").on("click", resetted);
	
	/* 
		On event, such as a zoom we transform and rescale both of our 
		axis. Then re-call them with the new axis scales. 
		
		After, we just need to rescale the positions of our points relative
		to the new axis.
	
	*/
	function zoomed() {	
		
		// Recover the new scale
		var newX = d3.event.transform.rescaleX(xScale);
		var newY = d3.event.transform.rescaleY(yScale);

		// Update axes with these new boundaries
		gX.call(d3.axisBottom(newX)) 
		gY.call(d3.axisLeft(newY))

		// Update circle position
		scatter.selectAll(".dot")
			.attr('cx', function (d) {
				return newX(d.values.gdp);
			})
			.attr('cy', function (d) {
				return newY(d.values.epc);
			})
	};
	
	/* 
		Reset our zoom by setting the current zoom transform to the zoom's
		identity. Which is the original setting of the zoom.
	*/
	function resetted() {
		scatter.transition()
			.duration(1500)
			.call(zoom.transform, d3.zoomIdentity);
	}
	
	scatter.call(zoom);

});