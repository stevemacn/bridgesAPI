//This code is heavily based on code from 
//http://mbostock.github.io/d3/talk/20111018/tree.html 

d3.queue = function(d3, canvasID, w, h, data) {

    var spacing = 140//w / data.length;
    var defaultSize = 15;

    var chart = d3.select(canvasID).append("svg")
        .attr("width", "10000")
        .attr("height", h)
        .style("margin-left", 25)

    var nodes = chart.selectAll("g")
        .data(data)
        .enter().append("g")
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
        .text(function(d) {
            return d.name
        })
        .attr("x", 0)
        .attr("y", function(d) {
            size = parseFloat(d.size||defaultSize)
            return 15 + size
        })
        .attr("dy", ".35em")

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
}
