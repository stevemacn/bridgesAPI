
//This code is heavily based on code from 
//http://mbostock.github.io/d3/talk/20111018/tree.html 

d3.bst = function (d3, canvasID, w, h) {  

    //defaults 
    var bst = {},
        mw = 20, mh = 50,
        w = w || 1280, h = h || 800,
        i = 0,
        tree,
        depthStep = 75, 
        canvasID = canvasID, //canvasID must have hash like "#vis" or "#canvas"
        root;

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
        tree = d3.layout.tree().size([h, w]);
        diagonal = d3.svg.diagonal() 
            .projection(function(d) { return [d.x, d.y]; });

        vis = d3.select(canvasID).append("svg:svg")
            .attr("width", w )
            .attr("height", h )
            .append("svg:g")
            .attr("transform", "translate(" + mh + "," + mw + ")");

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
        nodes.forEach(function(d) { d.y = d.depth * depthStep; });
    
        // Update the nodes…
        var node = vis.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });
    
        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("svg:g")
            .attr("class", "node")
            .attr("transform", function(d) { 
                return "translate(" + source.x0 + "," + source.y0 + ")"; 
            })
            .on("click", function(d) { toggle(d); update(d); });
    
        nodeEnter.append("svg:rect")
        nodeEnter.append("svg:text")
            .attr("dy", ".35em")
            .attr("x", "40px")
            .attr("text-anchor", "start")
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
                return d._children ? "lightsteelblue" : "#fff"; 
            });
    
        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { 
                return "translate(" + source.x + "," + source.y + ")"; 
            })
            .remove();
    
        // Update the links…
        var link = vis.selectAll("path.link")
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
    }
};
