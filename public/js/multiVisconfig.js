
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

console.log(data);
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
        if(data[key].visual != "Array"){
          switch (data[key].visual) {
            case "DoublyLinkedList":
                var orderedNodes = data[key];
                var sortedNodes = sortDoublyListByLinks(orderedNodes,0);
                d3.array(d3, "#vis" + key, width, height, sortedNodes, data[key].transform);
                break;
            case "CircularDoublyLinkedList":
                var orderedNodes = data[key];
                var sortedNodes = sortDoublyListByLinks(orderedNodes,1);
                d3.array(d3, "#vis" + key, width, height, sortedNodes, data[key].transform);
                break;
            case "SinglyLinkedList":
                var orderedNodes = data[key];
                var sortedNodes = sortSinglyListByLinks(orderedNodes, 0);
                d3.array(d3, "#vis" + key, width, height, sortedNodes, data[key].transform);
                break;
            case "CircularSinglyLinkedList":
                var orderedNodes = data[key];
                var sortedNodes = sortSinglyListByLinks(orderedNodes, 1);
                d3.array(d3, "#vis" + key, width, height, sortedNodes, data[key].transform);
                break;
            default:
          }
        }else{
          d3.array(d3, "#vis" + key, width, height, data[key].nodes, data[key].transform);
        }
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

        /* set default translate based on visualization type */
        if(d3.array) zoom.translate([20, 200]);
        else if(d3.bst) zoom.translate([(d3.select("#svg0").attr("width")/2), 0]);
        else zoom.translate([0, 0]);

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

// Asynchronously update the node positions
function savePositions () {
  var updateTheseNodes = {};


  // store indices for all fixed nodes
  for (var key in data) {
    updateTheseNodes[key] = {
      'fixedNodes': {},
      'unfixedNodes': {}
    };
    if (data.hasOwnProperty(key)) {
      d3.select("#vis" + key).selectAll(".node").each(function(d, i) {
        // we need to name the nodes so we can identify them on the server; indices don't suffice
        if(d.fixed) updateTheseNodes[key].fixedNodes["n" + i] = {"x": d.x, "y": d.y};
        else updateTheseNodes[key].unfixedNodes["n" + i] = true;
      });
    }
  }

  // send fixed node indices to the server to save
  $.ajax({
      url: "/assignments/updatePositions/"+assignmentNumber,
      type: "post",
      data: updateTheseNodes
  }).done(function() {
      console.log('positions saved');
  });
}


//Asynchronously update the vis transform values
//this method is just for testing, if approved, it still needs the ajax call and routing set up as well as the dabatase.
//It also can be used with the tree visualization
function saveListPositions(){
    var visTransforms = {};
    for (var key in data) {
        var my_transform = d3.transform(d3.select("#vis"+key).select("g").attr("transform"));
        var my_translateX = my_transform.translate[0];
        var my_translateY = my_transform.translate[1];
        var my_scale = my_transform.scale[0];
        var visTransform = {
                                  // "id":key,
                                "scale":my_scale,
                           "translatex":my_translateX,
                           "translatey":my_translateY
                           };
        visTransforms[key] = visTransform;
    }

    console.log(visTransforms);
    // send fixed node indices to the server to save
    $.ajax({
        url: "/assignments/updateListPositions/"+assignmentNumber,
        type: "post",
        data: visTransforms
    }).done(function(status) {
        if(status == 'OK'){
            var today = new Date().toLocaleTimeString()+" - "+new Date().toLocaleDateString();
            $("#updateStatus").html("Saved!"+"<br>"+today);
            $("#updateStatus").show();
            setTimeout(function(){
               $("#updateStatus").hide();
            },3000);
        }else{
            $("#updateStatus").html("Try again!");
            $("#updateStatus").css("color","red");
            $("#updateStatus").show();
            setTimeout(function(){
               $("#updateStatus").hide();
               $("#updateStatus").css("color","green");
            },2500);
        }
    });

}


//this methods sorts the SinglyLinkedList and CircularSinglyLinkedList nodes
function sortSinglyListByLinks(unsortedNodes, iTer){
    // console.log(orderedNodes);
    var myNodes = unsortedNodes.nodes;
    var myLinks = unsortedNodes.links;
    var myNodesSize = myNodes.length-1;
    var getSourceFromTarget = {};
    var getTargetFromSource = {};
    // var getTarget = {};
    // var getSource = {};
    var head = 0;
    for(var i = iTer; i < myLinks.length; i++){
        // getSource[myLinks[i].source] = myLinks[i].source;
        // getTarget[myLinks[i].target] = myLinks[i].target;

      // if( getSource[myLinks[i].source] != undefined || getTarget[myLinks[i].target] != undefined ){
        getSourceFromTarget[myLinks[i].target] = myLinks[i].source;
        getTargetFromSource[myLinks[i].source] = myLinks[i].target;
      //}

      if(parseInt(myLinks[i].target) >= myNodesSize){
         alert(i+"head");
      }

    }

    for(var i = 0; i < myNodes.length; i++){
        if(getSourceFromTarget[i] == undefined){
          head = i;
        }
    }

    var sortedNodes = [];
    sortedNodes.push(head);
    for(var i = 0; i < Object.keys(getSourceFromTarget).length; i++){
        sortedNodes.push(getTargetFromSource[head]);
        head = getTargetFromSource[head];
    }

    var sortedNodesToReturn = [];
    for(s in sortedNodes){
        sortedNodesToReturn.push(myNodes[sortedNodes[s]]);
    }

    return sortedNodesToReturn;

}

//this methods sorts the DoublyLinkedList and CircularDoublyLinkedList nodes
function sortDoublyListByLinks(unsortedNodes, iTer){
    var myNodes = unsortedNodes.nodes;
    var myLinks = unsortedNodes.links;
    var myNodesSize = myNodes.length-1;
    var getSourceFromTarget = {};
    var getTargetFromSource = {};
    var getTarget = {};
    var getSource = {};
    var head = 0;
    for(var i = 0; i < myLinks.length - iTer; i++){
        if( getSource[myLinks[i].source] != undefined || getTarget[myLinks[i].target] != undefined ){
            getSourceFromTarget[myLinks[i].target] = myLinks[i].source;
            getTargetFromSource[myLinks[i].source] = myLinks[i].target;
        }
        getSource[myLinks[i].source] = myLinks[i].source;
        getTarget[myLinks[i].target] = myLinks[i].target;
    }
    for(var i = 0; i < myNodes.length; i++){
        if(getSourceFromTarget[i] == undefined){
          head = i;
        }
    }

    var sortedNodes = [];
    sortedNodes.push(head);
    for(var i = 0; i < Object.keys(getSourceFromTarget).length; i++){
        sortedNodes.push(getTargetFromSource[head]);
        head = getTargetFromSource[head];
    }

    var sortedNodesToReturn = [];
    for(s in sortedNodes){
        sortedNodesToReturn.push(myNodes[sortedNodes[s]]);
    }

    return sortedNodesToReturn;
}
