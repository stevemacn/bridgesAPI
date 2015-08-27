//console.log(data);

var strokeWidthRange = d3.scale.linear()
                        .domain([1,100])
                        .range([1,15])
                        .clamp(true);

d3.selectAll(".minimize").on("click", minimize);
d3.select("#reset").on("click", reset);
d3.select("#resize").on("click", resize);
allZoom = [];
allSVG = [];

var visCount = 0;
var minimizedCount = 0;
var maximizedCount = 0;

for (var key in data) {
  if (data.hasOwnProperty(key)) {
    var ele = document.getElementById("vis" + key)  
    , width = ele.clientWidth - 15
    , height = ele.clientHeight + 15

    if (d3.bst) { 
        bst = d3.bst(d3, "#vis" + key, width, height)
        bst.make(data[key])
    }
    else if (d3.queue) {
        d3.queue(d3, "#vis" + key, width, height, data[key].nodes)
    }
    else if (d3.array) {
        d3.array(d3, "#vis" + key, width, height, data[key].nodes)
    }
    else if (d3.graph) {
        d3.graph(d3, "#vis" + key, width, height, data[key]);
    }  
    else {
        console.log("unknown type");  
        d3.graph(d3, "#vis" + key, width, height, data[key]);
    }
    
    visCount++;
    maximizedCount++;
  }
}


// Reset positions and scales for all visualization divs
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
    var sentinel = false;
    for(var i = 0; i < visCount; i++) {
        if ((d3.select("#svg" + i)).attr("height") == height)
            sentinel = true; //height is default
    }
    if(sentinel) {        
            var h = window.innerHeight - 160;
            
            d3.selectAll(".assignmentContainer")
                .attr("height", h);

            d3.selectAll(".svg")
                .attr("height", h);
    } else {
         d3.selectAll(".assignmentContainer")
            .attr("height", height);    

        d3.selectAll(".svg")
            .attr("height", height);
    }
}

// Toggle minimizing and maximizing visualization divs
function minimize() {
    
    //Collapse/Expand All
    if(this.id == "min") {
        if(d3.select(this).attr("minimized") == "true") {   //MAXIMIZE
            d3.selectAll(".assignmentContainer")
                .classed("assignmentContainerMinimized", false);

            d3.selectAll(".svg")
                .style("display", "block");

            d3.selectAll(".minimize")
                .attr("minimized", false)
                .text("-");
            
            maximizedCount = visCount;
            minimizedCount = 0;
            
        } else {    //MINIMIZE
            d3.selectAll(".assignmentContainer")
                .classed("assignmentContainerMinimized", true);

            d3.selectAll(".svg")
                .style("display", "none");
            
            d3.selectAll(".minimize")
                .attr("minimized", true)
                .text("+");
            
            maximizedCount = 0;
            minimizedCount = visCount;
        }
        
        return;
    }
    
    
    if(d3.select(this).attr("minimized") == "true") {   //MAXIMIZE
        d3.select("#vis" + this.id.substr(3))
            .classed("assignmentContainerMinimized", false);

        d3.select("#svg" + this.id.substr(3))
            .style("display", "block");
       
        d3.select(this).attr("minimized", false);
        
        d3.select(this).text("-");
        
        maximizedCount++;
        minimizedCount--;
        
        if(maximizedCount == visCount) {//ALL vis are minimized
            d3.select("#min")
                .attr("minimized", false)
                .text("-");   
        }
    
    } else {    //MINIMIZE
        d3.select("#vis" + this.id.substr(3))
            .classed("assignmentContainerMinimized", true);
        
        d3.select("#svg" + this.id.substr(3))
            .style("display", "none");
        
        d3.select(this).attr("minimized", true);
        
        d3.select(this).text("+");
        
        minimizedCount++;
        maximizedCount--;
        
        if(minimizedCount == visCount) {//ALL vis are minimized
            d3.select("#min")
                .attr("minimized", true)
                .text("+");   
        }
    }
}
