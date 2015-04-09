
//This code is heavily based on code from 
//http://mbostock.github.io/d3/talk/20111018/tree.html 

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

d3.bst = function (d3, canvasID, w, h) {  

    d3.select("#reset").on("click", reset);
    
    //defaults 
    var bst = {},
        //mw = 20, mh = 50,
        mw = 0, mh = 0,
        //w = w || 1280, h = h || 800,
        w = ele.clientWidth - 15,
        h = ele.clientHeight - 15,
        i = 0,
        tree,
        depthStep = 50, 
        canvasID = canvasID, //canvasID must have hash like "#vis" or "#canvas"
        root;
    var svgGroup;
    
      var drag = d3.behavior.drag()
        //.origin(function(d) {  });
        .on("dragstart", dragstarted)
        .on("drag", dragged)
        .on("dragend", dragended);
    
    var zoom = d3.behavior.zoom()
        .scaleExtent([0.1,5])
        //.on("dblclick.zoom",null)
        .on("zoom", zoomHandler);
        //.on("mousedown.zoom",null);
        zoom.scale(1);
    zoom.translate([(w/2), 0]);

    bst.init = function (_w, _h, _mw, _mh, ds) {
        mw = _mw
        mh = _mh
        w = _w
        h = _h
        depthStep = ds
        return bst;
    }

    //boilerplate stuff
    bst.make = function (data) {
        tree = d3.layout.tree()
            .nodeSize([50, 50]);
        diagonal = d3.svg.diagonal() 
            .projection(function(d) { return [d.x, d.y]; });
        
        vis = d3.select(canvasID).append("svg:svg")
            .attr("width", w )
            .attr("height", h )
            .call(zoom)
            .call(drag);

        svgGroup = vis.append("svg:g")
            .attr("transform", "translate(" + (mh + (w/2)) + "," + mw + ")");

        root = data;
        root.x0 = 0;
        root.y0 = (w) / 2;
        
        update(root);
    }

    return bst;
    
    function toggle (d) {

        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
    }

    function update(source) {
        
        var duration = 600;
    
        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse();
        
        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = 15 + d.depth * depthStep; });
        nodes.forEach(function(d) { d.x = -1 * d.x; });
    
        // Update the nodes…
        var node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("svg:g")
            .attr("class", "node")
            .attr("transform", function(d) { 
                return "translate(" + source.x0 + "," + source.y0 + ")"; 
            })
            .on("click", function(d) { toggle(d); update(d); })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);
    
        nodeEnter.append("svg:rect")
        nodeEnter.append("svg:text")
            .attr("dy", ".35em")
            .attr("x", "35px")
            .attr("y",  "-7px")
            .attr("text-anchor", "start")
            .style("display", "none")
            .text(function(d) { return d.name; })
    
        
        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) { 
                var dx = d.x-15;
                return "translate(" + dx + "," + d.y + ")"; 
            })
    
        nodeUpdate.select("rect")
            .attr("width",30)
            .attr("height",10)
            .style("fill", function(d) { 
                return d.color || "#fff";
                //return d._children ? "lightsteelblue" : "#fff"; 
            })
            .style("opacity", function(d) {
                return d.opacity || 1
                //return d._children ? 1 : 0.5;
            })
            .style("stroke", function(d) {
                return "black";
            }) 
            .style("stroke-width", function(d) {
                return 1;
            })
            .style("stroke-dasharray", function(d) {
                return d._children ? "3,3" : "0,0";
            });

        
        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { 
                return "translate(" + (source.x) + "," + source.y + ")"; 
            })
            .remove();
    
        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(tree.links(nodes), function(d) { 
                return d.target.id; 
            });
    
        // Enter any new links at the parent's previous position.
        link.enter().insert("svg:path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
              var o = {x: source.x0, y: source.y0};
              return diagonal({source: o, target: o});
            })
            .transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);
    
        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
              var o = {x: source.x, y: source.y};
              return diagonal({source: o, target: o});
            })
            .remove();
    
        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
        
        // Add line breaks to node labels
        svgGroup.selectAll('text').each(insertLineBreaks); 
    }
    
// Function to add line breaks to node labels/names
function insertLineBreaks (d){
    
	var el = d3.select(this);
    var words = d3.select(this).text().split('\n');
    
    if(words.length > 1) {
        el.text('');

        for (var i = 0; i < words.length; i++) {
            var tspan = el.append('tspan').text(words[i]);
            if (i > 0)
            tspan.attr('x',"35").attr('dy','15');
            //tspan.attr('x',"0").attr('dy','15');
        }
    }    
}
    
//    // zoom function
function zoomHandler() {
    svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function dragstarted() {
    //console.log("dragstart");
    //d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
}
    
function dragged() {
     //console.log("dragging");
    //svgGroup.attr("transform", "translate(" + d3.event.translate + ")");
}
function dragended() {
     //console.log("dragend");
    d3.select(this).classed("dragging", false);
}

function mouseover() {
    d3.select(this).select("text").transition()
        .duration(750)
        .style("display","block")      
    
    var el = d3.select(this);
    el.moveToFront();
}

function mouseout() {
    d3.select(this).select("text").transition()
        .duration(750)
        .style("display","none")
}
    
function reset() {
    zoom.scale(1);
    zoom.translate([(w/2), 0]);
    //svgGroup.attr("transform", "translate(0,0)scale(1,1)");
    svgGroup.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
}
    

    
    
};
