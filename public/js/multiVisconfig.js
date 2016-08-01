
// Bridges visualizer object to remove vis methods from the global scope
BridgesVisualizer.strokeWidthRange = d3.scale.linear()
                        .domain([1,10])
                        .range([1,15])
                        .clamp(true);
// function to return color depending on the style of representation
BridgesVisualizer.getColor = function(color) {
  if(Array.isArray(color))
    return "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] + ")";
  return color;
};

// bind event handlers for ui
d3.selectAll(".minimize").on("click", minimize);
d3.select("#reset").on("click", reset);
d3.select("#resize").on("click", resize);

allZoom = [];
allSVG = [];

var visCount = 0,
    minimizedCount = 0,
    maximizedCount = 0;

var map = map || null;
if( map )
  map( mapData );

/* create new assignments  */
for (var key in data) {
  if (data.hasOwnProperty(key)) {
    var ele = document.getElementById("vis" + key),
    width = ele.clientWidth - 15,
    height = ele.clientHeight + 15;

    if (d3.bst) {
        bst = d3.bst(d3, "#vis" + key, width, height);
        tempAddChildNode(data[key]);
        bst.make(data[key]);
    }
    else if (d3.queue) {
        d3.queue(d3, "#vis" + key, width, height, data[key].nodes);
    }
    else if (d3.array) {
        d3.array(d3, "#vis" + key, width, height, data[key].nodes);
    }
    else if (d3.graph) {
        d3.graph(d3, "#vis" + key, width, height, data[key]);
    }
    else {
        console.log("unknown data type");
        d3.graph(d3, "#vis" + key, width, height, data[key]);
    }

    visCount++;
    maximizedCount++;
  }
}

/*
  Recursive function adds a null child to enforce binary search tree child positioning.
  Optimizations: add the null child nodes (perhaps with more appropriate contents and checking)
    at some point in the controller, either when uploading a tree assignment or rendering a tree visualization.
    We will also need to enforce different rules for positioning in n-ary trees.
 */
function tempAddChildNode( root ) {
  if( root.role || !root.children ) return;

  if( root.children.length == 2 ) {
    tempAddChildNode( root.children[0] );
    tempAddChildNode( root.children[1] );
  }
  else if( root.children.length == 1 ) {
    if( parseFloat( root.children[0].key ) < parseFloat( root.key ) ) {
      root.children[1] = root.children[0];
      root.children[0] = {role: "nullChild"};
      tempAddChildNode( root.children[0] );
      tempAddChildNode( root.children[1] );
    } else {
      root.children[1] = {role: "nullChild"};
      tempAddChildNode( root.children[0] );
      tempAddChildNode( root.children[1] );
    }
  }
}

// Reset positions and scales for all visualization divs
function reset() {
    for (var i = 0; i < allZoom.length; i++) {
        var zoom = allZoom[i];
        var svgGroup = allSVG[i];
        zoom.scale(1);
        zoom.translate([0, 0]);
        svgGroup.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
    }
}

// Toggle resizing of visualization divs (swaps between two sizes)
function resize() {
    var sentinel = false;

    for(var i = 0; i < visCount; i++) {
        if ((d3.select("#vis" + i)).attr("height") < 400)
            sentinel = true;
    }
    if(sentinel) {
        height *= 2;

        d3.selectAll(".assignmentContainer")
            .attr( "height", height );
        d3.selectAll(".svg")
            .attr( "height", height );
    } else {
        height /= 2;

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
