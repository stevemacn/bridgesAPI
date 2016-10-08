/*

Array visualization for Bridges

*/
d3.array = function(d3, canvasID, w, h, data) {

    var spacing = 5;        // spacing between elements
    var marginLeft = 20;
    var defaultSize = 100;  // default size of each element box

    // error when zooming directly after pan on OSX
    // https://github.com/mbostock/d3/issues/2205

    var zoom = d3.behavior.zoom()
        .translate([20, 200])
        .scale(1)
        .scaleExtent([0,5])
        .on("zoom", zoomHandler);
    allZoom.push(zoom);

    chart = d3.select(canvasID).append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("id", "svg" + canvasID.substr(4))
        .classed("svg", true)
        .call(zoom);

    var svgGroup = chart.append("g");
    // initialize the scale and translation
    svgGroup.attr('transform', 'translate(' + zoom.translate() + ') scale(' + zoom.scale() + ')');
    allSVG.push(svgGroup);

    // var elementsPerRow = 4 * parseInt((w - (spacing + defaultSize)) / (spacing + defaultSize));

    // Bind nodes to array elements
    var nodes = svgGroup.selectAll("nodes")
        .data(data)
        .enter().append("g")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .attr("transform", function(d, i) {
            //size = parseFloat(d.size || defaultSize);
            size = defaultSize;
            return "translate(" + (marginLeft + i * (spacing + size)) + ")";
            // return "translate(" + (marginLeft + ((i % elementsPerRow) * (spacing + size)))+ "," + ((h/4) + ((Math.floor(i / elementsPerRow)) * (spacing+size))) + ")";
        });

    // Create squares for each array element
    nodes.append("rect")
        .attr("height", function(d) {
            //return parseFloat(d.size || defaultSize);
            return defaultSize;
        })
        .attr("width", function(d) {
            //return parseFloat(d.size || defaultSize);
            return defaultSize;
        })
        .style("fill", function(d) {
            return BridgesVisualizer.getColor(d.color) || "steelblue";
        })
        .style("stroke", "gray")
        .style("stroke-width", 2);

    // Show array index below each element
    nodes
        .append("text")
        .attr("class","index-textview")
        .text(function(d, i){
          return i;
        })
        .attr("y", 115)
        .attr("x", defaultSize / 2 - 5);

    // Show full array label above each element
    nodes
        .append("text")
        .attr("class","value-textview")
        .text(function(d, i){
          return d.name;
        })
        .attr("y", -10)
        .style("display","none");

    // Show array labels inside each element
    nodes
        .append("text")
        .attr("class", "value-elementview")
        .style("display", "block")
        .style("font-size", 30)
        .text(function(d) {
            return d.name.substr(0,10);
        })
        .attr("fill", "black")
        .attr("x", 10)
        .attr("y", defaultSize / 2)
        .attr("dy", ".35em");

    // bind linebreaks to text elements
    var insertLinebreaks = function (d, i) {
        var el = d3.select(this);
        var words = d3.select(this).text().split('\n');
        el.text('');

        for (var j = 0; j < words.length; j++) {
            var tspan = el.append('tspan').text(words[j]);
            if (j > 0)
                tspan.attr('x', 0).attr('dy', '15');
        }
    };
    svgGroup.selectAll('text').each(insertLinebreaks);

    function mouseover() {
        // scale text size based on zoom factor
        var hoverSize = d3.scale.linear().domain([0,0.7]).range([300, 14]).clamp(true);
        d3.select(this).selectAll(".value-textview").transition()
              .duration(250)
              .style("display","block")
              .style("font-size", function(d) {
                return hoverSize(zoom.scale());
              });
    }

    function mouseout() {
        d3.select(this).selectAll(".value-textview").transition()
            .duration(750)
            .style("display","none")
            .style("font-size", 14);
    }

    //// zoom function
    function zoomHandler() {
        zoom.translate(d3.event.translate);
        zoom.scale(d3.event.scale);
        svgGroup.attr("transform", "translate(" + (d3.event.translate) + ")scale(" + d3.event.scale + ")");
    }

};
