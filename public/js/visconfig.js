
var strokeWidthRange = d3.scale.linear()
                        .domain([1,100])
                        .range([1,15])
                        .clamp(true);

d3.select("#reset").on("click", reset);
d3.select("#resize").on("click", resize);
d3.select(".minimize").on("click", minimize);
allZoom = [];
allSVG = [];

var strokeWidthRange = d3.scale.linear()
                        .domain([1,100])
                        .range([1,15])
                        .clamp(true);

var ele = document.getElementById("vis0"),
    width = ele.offsetWidth - 15
    height = ele.offsetHeight + 250  
     
if (d3.bst) { 
    bst = d3.bst(d3, "#vis0", width, height)
    bst.make(data)
}
else if (d3.queue) {
    d3.queue(d3, "#vis0", width, height, data.nodes)
}
else if (d3.graph) {
    d3.graph(d3, "#vis0", width, height, data)
} else {
    console.log("unknown type");  
    d3.graph(d3, "#vis" + key, width, height, data[key]);
}

function reset() {
    for (var i = 0; i < allZoom.length; i++) {
        var zoom = allZoom[i];
        var svgGroup = allSVG[i];
        zoom.scale(1);
        zoom.translate([0, 0]);
        //svgGroup.attr("transform", "translate(0,0)scale(1,1)");
        svgGroup.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
    }
}

// Toggle resizing of visualization divs (swaps between two sizes)
function resize() {
    if((d3.select(".assignmentContainer")[0])[0].clientHeight < 400) {        
            d3.selectAll(".assignmentContainer")
                .attr("height", height);

            d3.selectAll(".svg")
                .attr("height", height);
    } else {
        d3.selectAll(".assignmentContainer")
                .attr("height", height - height/2);

            d3.selectAll(".svg")
                .attr("height", height - height/2 + 30);
    }
}

// Toggle minimizing and maximizing visualization divs
function minimize() {
    
    if(d3.select(this).attr("minimized") == "true") {
        d3.select("#vis" + this.id.substr(3))
            .classed("assignmentContainerMinimized", false);

        d3.select("#svg" + this.id.substr(3))
            .style("display", "block");
       
        d3.select(this).attr("minimized", false);
        
        d3.select(this).text("-");
    } else {
        d3.select("#vis" + this.id.substr(3))
            .classed("assignmentContainerMinimized", true);
        
        d3.select("#svg" + this.id.substr(3))
            .style("display", "none");
        
        d3.select(this).attr("minimized", true);
        
        d3.select(this).text("+");
    }
}


