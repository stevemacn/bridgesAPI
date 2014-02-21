//based loosely on bostock's example and 
//interaction by amelia greenhall

nodes = [
    {"name":"steve"},
    {"name":"dan"},
    {"name":"joe"},
    {"name":"matt"},
    {"name":"bob"},
    {"name":"kevin"}
],
links = [
    {"source":1, "target":0},
    {"source":1, "target":2},
    {"source":3, "target":2},
    {"source":3, "target":1},
    {"source":1, "target":3},
    {"source":4, "target":3}
]

var width = 960;
var height = 600;

var force = d3.layout.force()
    .charge([-250])
    .linkDistance([30])
    .size([width, height])
    .nodes(nodes)
    .links(links)
    .start();

var colors = d3.scale.category20(); //10 or 20

var svg = d3.select("#vis").append("svg")
    .attr("width", width)
    .attr("height", height);

var link = svg.selectAll(".link")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    //Set this as css for the page...
    .style("stroke", "#ccc")
    .style("stroke-width", 1);

var node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node")
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .call(force.drag);
node 
    .append("circle")
    .attr("r", 10)
    .style("fill", function(d, i) {
        return colors(i);
    })

node.append("text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .text(function(d) {
        return d.name;
    });

force.on("tick", function() {
    link 
        .attr("x1", function(d) {return d.source.x;})
        .attr("y1", function(d) {return d.source.y;})
        .attr("x2", function(d) {return d.target.x;})
        .attr("y2", function(d) {return d.target.y;});
    node
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
});

function mouseover() {
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 16);
}

function mouseout() {
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 8);
}
