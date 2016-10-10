/*

Linked List visualization for Bridges

*/


d3.array = function(d3, canvasID, w, h, data) {


    function getTranslateScaleCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    var visID = canvasID.substr(4);

    var finalTranslate = [50, -5];
    var finalScale = 0.36;

    // if(w > 1200){ finalScale = 0.28;}

    var cname = "vis"+visID+"-"+location.pathname;
    var cookieStringValue = getTranslateScaleCookie(cname);
    var cookieJSONValue;
    try{
        cookieJSONValue = JSON.parse(cookieStringValue);
    }catch(err){
        console.log(err);
    }

    if(cookieJSONValue){
      if(cookieJSONValue.hasOwnProperty("translatex") &&
         cookieJSONValue.hasOwnProperty("translatey") &&
         cookieJSONValue.hasOwnProperty("scale")){
           finalTranslate = [cookieJSONValue.translatex, cookieJSONValue.translatey];
           finalScale = [cookieJSONValue.scale];
      }
    }

    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
          this.parentNode.appendChild(this);
        });
    };

    d3.selection.prototype.moveToBack = function() {
        return this.each(function() {
            var firstChild = this.parentNode.firstChild;
            if (firstChild) {
                this.parentNode.insertBefore(this, firstChild);
            }
        });
    };

    // var spacing = 5;        // spacing between elements
    var spacing = 115;
    var marginLeft = 20;
    var defaultSize = 100;  // default size of each element box
    var defaultSizeW = 160;  // default size of each element box


    // error when zooming directly after pan on OSX
    // https://github.com/mbostock/d3/issues/2205

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

    var svgGroup = chart.append("g");
    // initialize the scale and translation
    svgGroup.attr('transform', 'translate(' + zoom.translate() + ') scale(' + zoom.scale() + ')');
    allSVG.push(svgGroup);

    var elementsPerRow = 4 * parseInt((w - (spacing + defaultSize)) / (spacing + defaultSize));

    // Bind nodes to array elements
    var nodes = svgGroup.selectAll("nodes")
        .data(data)
        .enter().append("g")
        .attr("id",function(d,i){
          return "svg"+visID+"g"+i;
        })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .attr("transform", function(d, i) {
            //size = parseFloat(d.size || defaultSize);
            size = defaultSize
            // return "translate(" + (marginLeft + i * (spacing + size)) + ")";
            return "translate(" + (marginLeft + ((i % elementsPerRow) * (spacing + size)))+ "," + ((h/4) + ((Math.floor(i / elementsPerRow)) * (spacing+size))) + ")";
        });

    // Create squares for each array element
    nodes
        .append("rect")
        .attr("id",function(d,i){
          return "svg"+visID+"rect"+i;
        })
        .attr("height", function(d) {
            //return parseFloat(d.size || defaultSize);
            return defaultSize;
        })
        .attr("width", function(d) {
            //return parseFloat(d.size || defaultSize);
            return defaultSizeW;
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
          return i;
        })
        .attr("y", 115)
        .attr("x", defaultSizeW / 2 - 5);


    nodes
        .append("line")
        .attr("y1", 0)
        .attr("y2", 100)
        .attr("x1", 130)
        .attr("x2", 130)
        .attr("stroke", "black")
        .attr("stroke-width",2);
        // .attr("marker-end","url('#Triangle')")
    nodes
        .append("line")
        .attr("y1", 0)
        .attr("y2", 100)
        .attr("x1", 30)
        .attr("x2", 30)
        .style("stroke", "black")
        .attr("stroke-width",2);
        // .attr("marker-end","url('#Triangle')")

    // Show full array label above each element
    nodes
        .append("text")
        .attr("class","value-textview")
        .text(function(d, i){
          return d.name;
        })
        .attr("y", -10)
        .style("display","none");

    // Show array labels inside each element
    nodes
        .append("text")
        .attr("class", "value-elementview")
        .style("display", "block")
        .style("font-size", 30)
        .text(function(d) {
            return d.name.substr(0,5)+"...";
        })
        .attr("fill", "black")
        .attr("x", 40)
        .attr("y", defaultSize / 2)
        .attr("dy", ".35em");


    nodes
        .append("line")
        .attr("class","last-vertical-line")
        .attr("id", function(d,i){
            return "svg"+visID+"pointer-arrow-"+i;
        })
        .attr("y1", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            // return 198;
            return 160;
          }else{
            return 50;
          }
        })
        .attr("y2", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return defaultSize / 2;
          }else{
            return 50;
          }
        })
        .attr("x1", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return 145;
          }else{
            return 145;
          }
        })
        .attr("x2", function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return 145;
          }else{
            return 225;
          }
        })
        .attr("stroke","black")
        .attr("stroke-width",5)
        .attr("marker-end",function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            return "url('#Circle')";
          }else{
            return "url('#Triangle')";
          }

        })
        .attr("marker-start",function(d,i){
          if(i % elementsPerRow == (elementsPerRow-1) && (i != Object.keys(data).length-1) ){
            // return "url('#Triangle')";
          }else{
            return "url('#Circle')";
          }

        });

        var data_length = Object.keys(data).length;
        for(var qq = elementsPerRow-1; qq < data_length; qq=qq+ (1*elementsPerRow) ){
            d3.select(d3.select("#svg"+visID+"pointer-arrow-"+qq)[0][0].parentNode)
                .append("line")
                .attr("class","last-horizontal-line")
                .attr("stroke","black")
                .attr("stroke-width",5)
                .attr("y1", function(d,i){
                  // console.log(  );
                  return d3.select(this.parentNode).select(".last-vertical-line").attr("y1");
                })
                .attr("y2", function(d,i){
                  return d3.select(this.parentNode).select(".last-vertical-line").attr("y1");
                })
                .attr("x1", function(d,i){
                  return ( (elementsPerRow-1) * (-1*(spacing + defaultSize)) ) + 15;

                })
                .attr("x2", function(d,i){
                  return d3.select(this.parentNode).select(".last-vertical-line").attr("x1");
                })
                .attr("display",function(d,i){
                    if(Object.keys(data).length-1 == qq){
                        return "none";
                    }
                });
        }

        for(var qq = elementsPerRow-1; qq < data_length; qq=qq+ (1*elementsPerRow) ){
          d3.select(d3.select("#svg"+visID+"pointer-arrow-"+qq)[0][0].parentNode)
              .append("line")
              .attr("stroke","black")
              .attr("stroke-width",5)
              .attr("y1", function(d,i){
                  return parseInt(d3.select(this.parentNode).select(".last-horizontal-line").attr("y1")) - 3;
              })
              .attr("y2", function(d,i){
                  return parseInt( d3.select(this.parentNode).select(".last-horizontal-line").attr("y1") ) + 100;
              })
              .attr("x1", function(d,i){
                return d3.select(this.parentNode).select(".last-horizontal-line").attr("x1");
              })
              .attr("x2", function(d,i){
                return d3.select(this.parentNode).select(".last-horizontal-line").attr("x1");
              })
              .attr("display",function(d,i){
                  if(Object.keys(data).length-1 == qq){
                      return "none";
                  }
              })
              .attr("marker-end","url('#Triangle')");
        }


        for(var qq = 0; qq < Object.keys(data).length; qq++){
            d3.select("#svg"+visID+"g"+qq).moveToBack();
        }

        // var first_g = svgGroup.select("#svg"+visID+"g0");
        var last_g = svgGroup.select("#svg"+visID+"g"+parseInt(Object.keys(data).length-1));

        // first_g.append("line")
        //     .attr("stroke","black")
        //     .attr("class","nullarrowpointer")
        //     .attr("stroke-width",5)
        //     .attr("marker-start","url('#Circle')")
        //     .attr("marker-end","url('#Triangle')")
        //     .attr("x1",15)
        //     .attr("x2",-65)
        //     .attr("y1",50)
        //     .attr("y2",50);

        last_g.select(".last-vertical-line")
            .attr("class","nullarrowpointer")
            .attr("marker-start","url('#Circle')")
            .attr("marker-end","url('#Triangle')")
            .attr("x1",145)
            .attr("x2",225)
            .attr("y1",50)
            .attr("y2",50);

       var squareSize = 60;
      //  first_g.
      //       append("rect")
      //         .attr("height", function(d) {
      //             return squareSize;
      //         })
      //         .attr("width", function(d) {
      //             return squareSize;
      //         })
      //         .attr("x", function(d,i){
      //             return parseFloat( d3.select(this.parentNode).select(".nullarrowpointer").attr("x2") ) - squareSize;
      //         })
      //         .attr("y", function(d,i){
      //             return squareSize - (squareSize/1.5);
      //         })
      //         .style("fill", "transparent")
      //         .attr("stroke","black")
      //         .attr("stroke-width",2);

        last_g
            .append("rect")
              .attr("height", function(d) {
                  return squareSize;
              })
              .attr("width", function(d) {
                  return squareSize;
              })
              .attr("x",function(d,i){
                  return parseFloat( d3.select(this.parentNode).select(".nullarrowpointer").attr("x2") );
              })
              .attr("y", function(d,i){
                return squareSize - (squareSize/1.5);
              })
              .attr("fill","transparent")
              .attr("stroke","black")
              .attr("stroke-width",2);

        last_g
            .append("text")
            .text("X")
            .attr("font-size","83px")
            .attr("x",function(d,i){
                  return parseFloat( d3.select(this.parentNode).select(".nullarrowpointer").attr("x2") ) + 2;
            })
            .attr("y",squareSize+(squareSize/3))
            .attr("width",40)
            .attr("height",40)
            .style("display","block");

        // first_g
        //     .append("text")
        //     .text("X")
        //     .attr("font-size","83px")
        //     .attr("x",-123)
        //     .attr("y",squareSize+(squareSize/3))
        //     .attr("width",40)
        //     .attr("height",40)
        //     .style("display","block");



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

    function mouseover() {
        // scale text size based on zoom factor
        var hoverSize = d3.scale.linear().domain([0,0.7]).range([300, 14]).clamp(true);
        d3.select(this).selectAll(".value-textview").transition()
              .duration(250)
              .style("display","block")
              .style("font-size", function(d,i) {
                if(i > elementsPerRow){
                  d3.select(this.parentNode).moveToFront();
                }
                return hoverSize(zoom.scale());
              });
    }

    function mouseout() {
        d3.select(this).selectAll(".value-textview").transition()
            .duration(750)
            .style("display",function(d,i){
              if(i > elementsPerRow){
                d3.select(this.parentNode).moveToBack();
              }
              return "none";
            })
            .style("font-size", 14);
    }

    //// zoom function
    function zoomHandler() {
        zoom.translate(d3.event.translate);
        zoom.scale(d3.event.scale);
        svgGroup.attr("transform", "translate(" + (d3.event.translate) + ")scale(" + d3.event.scale + ")");
    }

};
