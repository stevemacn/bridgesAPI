//console.log(data);

var strokeWidthRange = d3.scale.linear()
                        .domain([1,100])
                        .range([1,15])
                        .clamp(true);

d3.select("#reset").on("click", reset);
allZoom = [];
allSVG = [];

for (var key in data) {
  if (data.hasOwnProperty(key)) {
    var ele = document.getElementById("vis" + key)
    , width = ele.offsetWidth - 15
     height = ele.offsetHeight + 15
     
    if (d3.bst) { 
        bst = d3.bst(d3, "#vis" + key, width, height)
        bst.make(data[key])
    }
    else if (d3.queue) {
        d3.queue(d3, "#vis" + key, width, height, data[key].nodes)
    }
    else if (d3.graph) {
        d3.graph(d3, "#vis" + key, width, height, data[key]);
    }  
    else {
        console.log("unknown type");  
        d3.graph(d3, "#vis" + key, width, height, data[key]);
    }
  }
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