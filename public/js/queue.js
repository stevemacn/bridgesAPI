//This code is heavily based on code from 
//http://mbostock.github.io/d3/talk/20111018/tree.html 

d3.queue = function(d3, canvasID, w, h, data) {

    
    //d3.select("#reset").on("click", reset);
    
    var spacing = 140//w / data.length;
    var defaultSize = 15;

    var chart = d3.select(canvasID).append("svg")
        //.attr("width", "50000")
        .attr("width", w)
        .attr("height", h)
        .style("margin-left", 25)
        .attr("id", "svg" + canvasID.substr(4))
        .classed("svg", true);

    var nodes = chart.selectAll("g")
        .data(data)
        .enter().append("g")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .attr("transform", function(d, i) {
            size = parseFloat(d.size || defaultSize);
            return "translate(" +
                i * spacing + "," + (h / 2 - size / 2) + ")";
        })

    nodes.append("rect")
        .attr("height", function(d) {
            return parseFloat(d.size || defaultSize);
        })
        .attr("width", function(d) {
            return parseFloat(d.size || defaultSize);
        })
        .style("fill", function(d) {
            return d.color || "steelblue"
        })
        .style("stroke", "gray")
        .style("stroke-width", 2)

    nodes
        .append("text")
        .style("display", "none")
        .text(function(d) {
            return d.name
        })
        .attr("x", 0)
        .attr("y", function(d) {
            size = parseFloat(d.size||defaultSize)
            return 15 + size
        })
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

   svg.selectAll('text').each(insertLinebreaks);

    //we don't want to process the first node
    data.pop()

    var lines = chart.selectAll("line")
        .data(data)
        .enter().append("line")
        .attr("x1", function(d, i) {
            return (i) * spacing + parseFloat(d.size || defaultSize);
        })
        .attr("x2", function(d, i) {
            return (i + 1) * spacing
        })
        .attr("y1", h / 2)
        .attr("y2", h / 2)
        .style("stroke", "black")
        .style("stroke-width", function(d) {
                return strokeWidthRange(d.weight) || 1;
            })
    
function mouseover() {

    d3.select(this).select("text").transition()
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
    
    d3.select(this).select("text").transition()
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
//function zoomHandler() {
//    svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
//}
//    
//function reset() {
//    zoom.scale(1);
//    zoom.translate([0, 0]);
//    //svgGroup.attr("transform", "translate(0,0)scale(1,1)");
//    svgGroup.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
//}
    
}
