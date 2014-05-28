//based loosely on bostock's example and 
//http://bl.ocks.org/d3noob/5141278

var count = 0
for (i in links) {
   if (count<links[i].value) count = links[i].value 
}

var ele = document.getElementById("vis")
    , width = ele.offsetWidth
     height = ele.offsetHeight

var force = d3.layout.force()
    .charge([-250])
    .linkDistance([75])
    .size([width, height])
    .nodes(nodes)
    .links(links)
    .start();

var defaultColors = d3.scale.category20(); //10 or 20

var svg = d3.select("#vis").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("svg:defs").selectAll("marker")
    .data(["end"])// Different path types defined here
    .enter().append("svg:marker")  
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", 0)
    .attr("markerUnits", "userSpaceOnUse")
    .style("fill", function (d) {
        return d.color || "black"
    })
    .style("opacity", function(d) {
        return d.opacity || 1
    })
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

var link = svg.append("svg:g").selectAll("path")
    .data(links)
    .enter().append("svg:path")
    .attr("class", "link")
    .attr("marker-end", "url(#end)")
    .style("stroke-width", function (d) {
        return d.width || "1.5"
    })
    .style("stroke", function (d) {
        return d.color || "black"
    })
    .style("opacity", function(d) {
        return d.opacity || 1
    })
    .style("fill", "none")

var node = svg.selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node")
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .call(force.drag);

node 
    .append("circle")
    .attr("r", function (d) {
        return d.size || 7;
    })
    .style("fill", function(d, i) {
        return d.color || defaultColors(i);
    })

node
    .append("text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .style("display", "none")
    .text(function(d) {
        return d.name;
    });

force.on("tick", function() {
    link
        .attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + 
                d.source.x + "," + 
                d.source.y + "A" + 
                dr + "," + dr + " 0 0,1 " + 
                d.target.x + "," + 
                d.target.y;
        });
    
    node
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
})

function mouseover() {
    
    d3.select(this).select("text").transition()
        .duration(750)
        .style("display","block")
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 12);
}

function mouseout() {
    
    d3.select(this).select("text").transition()
        .duration(750)
        .style("display","none")
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", function(d){
            return d.size || 7
        });
}
