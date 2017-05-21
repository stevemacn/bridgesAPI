/*

Array visualization for Bridges

*/
d3.array3d = function(d3, canvasID, w, h, data, dimensions) {

    var dimOne = dimensions[0],
        dimTwo = dimensions[1],
        dimThree = dimensions[2],
        spacing = 40,        // spacing between elements
        marginLeft = 20,
        defaultSize = 100,  // default size of each element box
        spacingBetweenGrid = defaultSize + 400,
        valueToCenterGridTitle = 195;
        levelCount = -1,
        visID = canvasID.substr(4),
        finalTranslate = BridgesVisualizer.defaultTransforms.array3d.translate,
        finalScale =  BridgesVisualizer.defaultTransforms.array3d.scale,
        transformObject = BridgesVisualizer.getTransformObjectFromCookie(visID),
        elementsPerRow = dimOne,
        elementsPerColumn = (dimOne * dimTwo) / dimOne;

    if(transformObject){
        finalTranslate = transformObject.translate;
        finalScale = transformObject.scale;
    }

    var zoom = d3.behavior.zoom()
        .translate(finalTranslate)
        .scale(finalScale)
        .scaleExtent([0,5])
        .on("zoom", zoomHandler);
    allZoom.push(zoom);

    chart = d3.select(canvasID).append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("id", "svg" + canvasID.substr(4))
        .classed("svg", true)
        .call(zoom);

    var svgGroup = chart.append("g").attr("id","myG");
    // initialize the scale and translation
    svgGroup.attr('transform', 'translate(' + zoom.translate() + ') scale(' + zoom.scale() + ')');
    allSVG.push(svgGroup);

    // Bind nodes to array elements
    var nodes = svgGroup.selectAll("nodes")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, i) {
            return "translate(" + (marginLeft + ((i % elementsPerRow) * (spacing + defaultSize)))+ "," + ((h/4) + ((Math.floor(i / elementsPerRow)) * (spacing+defaultSize))) + ")";
        })
        .attr("id",function(d,i){
            return "g"+i;
        })
        .on("mouseover", BridgesVisualizer.textMouseover)
        .on("mouseout", BridgesVisualizer.textMouseout);


    // Create squares for each array element
    nodes.append("rect")
        .attr("id",function(d,i){
            return "rect"+i;
        })
        .attr("height", function(d) {
            //return parseFloat(d.size || defaultSize);
            return defaultSize;
        })
        .attr("width", function(d) {
            //return parseFloat(d.size || defaultSize);
            return defaultSize;
        })
        .style("fill", function(d) {
            return BridgesVisualizer.getColor(d.color) || "steelblue";
        })
        .style("stroke", "gray")
        .style("stroke-width", 2);

    // Show array index below each element
    nodes
        .append("text")
        .attr("class","index-textview")
        .text(function(d, i){
          var threeLevel = parseInt(i / (dimOne*dimTwo));

          if((i % elementsPerRow == 0)){
              levelCount++;
          }

          if(levelCount > (elementsPerColumn-1) ){
              levelCount = 0;
          }
          return "("+threeLevel+", "+(i % elementsPerRow)+", "+levelCount+")";
          // return "("+levelCount+", "+(i % elementsPerRow)+", "+threeLevel+")";
        })
        .attr("y", 115)
        .attr("x", defaultSize / 4);


    // Show array labels inside each element
    nodes
        .append("text")
        .attr("class", "value-elementview")
        .style("display", "block")
        .style("font-size", 30)
        .text(function(d) {
          // return d.name.substr(0,3)+"...";
          return d.name;
        })
        .attr("fill", "black")
        .attr("x", 10)
        .attr("y", defaultSize / 2)
        .attr("dy", ".35em");

    // bind linebreaks to text elements
    var insertLinebreaks = function (d, i) {
        var el = d3.select(this);
        var words = d3.select(this).text().split('\n');
        el.text('');

        for (var j = 0; j < words.length; j++) {
            var tspan = el.append('tspan').text(words[j]);
            if (j > 0)
                tspan.attr('x', 0).attr('dy', '15');
        }
    };
    svgGroup.selectAll('text').each(insertLinebreaks);

    var my_translateX = parseFloat(d3.transform(d3.select("#g"+(elementsPerRow-1)).attr("transform")).translate[0]) + spacingBetweenGrid;
    d3.select("#g0").attr("class","first-2d");

    var ii = 0;
    svgGroup.selectAll("g").each(function(d,i){

        if(i >= dimOne*dimTwo){
            d3.select(this).attr("transform",function(){
                if( i % (dimOne*dimTwo) == 0 ){
                    d3.select("#g"+i).attr("class","first-2d");
                    ii++;
                }
                var tempI = i % (dimOne*dimTwo);
                return "translate("+(parseFloat(d3.transform(d3.select(this).attr("transform")).translate[0])+parseFloat(my_translateX*ii))
                                    +","+
                                    d3.transform(d3.select("#g"+tempI).attr("transform")).translate[1]
                                    +")";
            });
        }
    });

    var half2d = ( ( (spacing + defaultSize) * elementsPerRow) / 2 ) - marginLeft;

    //first2Ditems is the collection of the first node of every grid
    var first2Ditems = d3.selectAll(".first-2d");
    first2Ditems.each(function(d,i){
        svgGroup
            .append("line")
            .attr("class",function(){
                if(i == 0){
                    return "first-v";
                }
                else if(i == first2Ditems[0].length-1){
                    return "last-v";
                }
            })
            .attr("y1", -50)
            .attr("y2", 20)
            .attr("x1", parseFloat(d3.transform(d3.select(this).attr("transform")).translate[0])+half2d)
            .attr("x2", parseFloat(d3.transform(d3.select(this).attr("transform")).translate[0])+half2d)
            .attr("stroke", "black")
            .attr("stroke-width",5);

        svgGroup
            .append("text")
            .text(function(){
                return "(Slice: "+ i +")";
                // return "(0,0,"+ i +")";
            })
            .attr("x", (parseFloat(d3.transform(d3.select(this).attr("transform")).translate[0])+half2d) - valueToCenterGridTitle)
            .style("font-size","100px")
            .attr("y", parseInt(d3.select(".first-v").attr("y2")) + 80);

    });

    //connecting the 2D grid with one horizontal line
    svgGroup
        .append("line")
        .attr("y1", d3.select(".first-v").attr("y1"))
        .attr("y2", d3.select(".first-v").attr("y1"))
        .attr("x1", d3.select(".first-v").attr("x1"))
        .attr("x2", d3.select(".last-v").attr("x1"))
        .attr("stroke", "black")
        .attr("stroke-width",5);

    // function mouseover() {
    //     // scale text size based on zoom factor
    //     var hoverSize = d3.scale.linear().domain([0,0.7]).range([300, 14]).clamp(true);
    //     d3.select(this).selectAll(".value-textview").transition()
    //           .duration(250)
    //           .style("display","block")
    //           .style("font-size", function(d,i) {
    //             if(i > elementsPerRow){
    //               d3.select(this.parentNode).moveToFront();
    //             }
    //             return hoverSize(zoom.scale());
    //           });
    // }
    //
    // function mouseout() {
    //     d3.select(this).selectAll(".value-textview").transition()
    //         .duration(750)
    //         .style("display",function(d,i){
    //           if(i > elementsPerRow){                d3.select(this).moveToFront();
    //
    //             d3.select(this.parentNode).moveToBack();
    //           }
    //           return "none";
    //         })
    //         .style("font-size", 14);
    // }

    //// zoom function
    function zoomHandler() {
        zoom.translate(d3.event.translate);
        zoom.scale(d3.event.scale);
        svgGroup.attr("transform", "translate(" + (d3.event.translate) + ")scale(" + d3.event.scale + ")");
    }

};
