//This code is heavily based on code from 
//http://mbostock.github.io/d3/talk/20111018/tree.html 

d3.queue = function(d3, canvasID, w, h, data) {

    var spacing = w / data.length;

    var chart = d3.select(".chart").append("svg")
        .attr("width", w)
        .attr("height", h)

    var nodes = chart.selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, i) {
            size = d.size;
            return "translate(" + 
                i*spacing+","+(h/2 - size/2)+")";
        })

    nodes.append("rect")
        .attr("height", function(d) {
            return d.size;
        })
        .attr("width", function(d) {
            return d.size;
        })
        .style("fill", function (d) {
            return d.color   
        })
    

        
}
