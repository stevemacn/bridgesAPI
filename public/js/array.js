//This code is heavily based on code from
//http://mbostock.github.io/d3/talk/20111018/tree.html

d3.array = function(d3, canvasID, w, h, data) {

    //d3.select("#reset").on("click", reset);

    var spacing = 5;//w / data.length;
    var marginLeft = 20;
    var defaultSize = 100;

    // error when zooming directly after pan on OSX
    // https://github.com/mbostock/d3/issues/2205
    var zoom = d3.behavior.zoom()
        .scaleExtent([0,5])
        .on("zoom", zoomHandler);
        zoom.scale(1);
    allZoom.push(zoom);

    chart = d3.select(canvasID).append("svg")
        .attr("width", w)
        .attr("height", h)
//        .style("margin-left", 5)
        .attr("id", "svg" + canvasID.substr(4))
        .classed("svg", true)
        .call(zoom);

    var svgGroup = chart.append("g");
    allSVG.push(svgGroup);

    // var elementsPerRow = 4 * parseInt((w - (spacing + defaultSize)) / (spacing + defaultSize));

    var nodes = svgGroup.selectAll("nodes")
        .data(data)
        .enter().append("g")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .attr("transform", function(d, i) {
            //console.log(d.size);
            //size = parseFloat(d.size || defaultSize);
            size = defaultSize;
            return "translate(" + (marginLeft + i * (spacing + size)) + ")";
            // return "translate(" + (marginLeft + ((i % elementsPerRow) * (spacing + size)))+ "," + ((h/4) + ((Math.floor(i / elementsPerRow)) * (spacing+size))) + ")";
        });

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
            return BridgesVisualizer.getColor(d.color) || "steelblue"
        })
        .style("stroke", "gray")
        .style("stroke-width", 2)

    nodes
        .append("rect")
        .attr("class", "TEMP")
        .style("display", "none")
        .style("fill", "white")
        .attr("width", function(d) {
            return (d.name.length * 12) + "px"
        })
        .attr("height", function(d) {return "20px";})
        .attr("y", -40);
    nodes
        .append("text")
        .attr("class", "TEMP")
        .style("display", "none")
        .text(function(d) {
            return d.name
        })
        .attr("x", 10)
        .attr("y", -30)
//        .attr("y", function(d) {
//            size = parseFloat(d.size||defaultSize)
//            return 15 + size
//        })
        .attr("dy", ".35em")

     var insertLinebreaks = function (d, i) {
        var el = d3.select(this);
        var words = d3.select(this).text().split('\n');
        el.text('');

        for (var i = 0; i < words.length; i++) {
            var tspan = el.append('tspan').text(words[i]);
            if (i > 0)
                tspan.attr('x', 0).attr('dy', '15');
        }
    };

   svgGroup.selectAll('text').each(insertLinebreaks);

    //we don't want to process the first node???
  //  data.pop()

//    var lines = svgGroup.selectAll("line")
//        .data(data)
//        .enter().append("line")
//        .attr("x1", function(d, i) {
//            return (i) * spacing + parseFloat(d.size || defaultSize);
//        })
//        .attr("x2", function(d, i) {
//            return (i + 1) * spacing
//        })
//        .attr("y1", h / 2)
//        .attr("y2", h / 2)
//        .style("stroke", "black")
//        .style("stroke-width", function(d) {
//                return BridgesVisualizer.strokeWidthRange(d.weight) || 1;
//            })

function mouseover() {

    d3.select(this).selectAll(".TEMP").transition()
        .duration(750)
        .style("display","block")
    /*
    d3.select(this).select("path").transition()
        .duration(750)
        .attr('d', function (d) {
            return d3.svg.symbol().type(d.shape||"circle")
                    .size(scaleSize(40))()
        })
    */
}

function mouseout() {

    d3.select(this).selectAll(".TEMP").transition()
        .duration(750)
        .style("display","none")
    /*
    d3.select(this).select("path").transition()
        .duration(750)
        .attr('d', function (d) {
            return d3.svg.symbol().type(d.shape||"circle")
                    .size(scaleSize(d.size||1))()
        })
    */
}

//// zoom function
function zoomHandler() {
//        console.log(d3.event.scale);
    svgGroup.attr("transform", "translate(" + (d3.event.translate) + ")scale(" + d3.event.scale + ")");
}
////
//function reset() {
//    zoom.scale(1);
//    zoom.translate([0, 0]);
//    //svgGroup.attr("transform", "translate(0,0)scale(1,1)");
//    svgGroup.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
//}

}
