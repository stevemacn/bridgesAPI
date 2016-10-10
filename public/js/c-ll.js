/*

Circular Linked List visualization for Bridges

*/
d3.array = function(d3, canvasID, w, h, data, transformObject) {


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

    // if(transformObject.transform.translatex != undefined && transformObject.transform.translatey != undefined && transformObject.transform.scale != undefined){
    // console.log(transformObject);
    if(transformObject != undefined && transformObject.hasOwnProperty('translatex') && transformObject.hasOwnProperty('translatey') && transformObject.hasOwnProperty('scale')){
        finalTranslate = [transformObject.translatex, transformObject.translatey];
        finalScale = transformObject.scale;
        console.log("fromDB");
    }else{
        console.log("fromCookie");
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
    var defaultSizeW = 160;  // default width of each element box

    // var myScale = 0.36;
    // if(w > 1200){ myScale = 0.28;}

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
    // var elementsPerRow = data.dimension.rowsCount || Object.keys(data).length;

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
            size = defaultSize;
            //return "translate(" + (marginLeft + i * (spacing + size)) + ")";
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
          .attr("marker-end","url('#Triangle')")
          .attr("display",function(d,i){
            if(Object.keys(data).length-1 == qq){
                return "none";
            }
          });
    }

    for(var qq = 0; qq < Object.keys(data).length; qq++){
        d3.select("#svg"+visID+"g"+qq).moveToBack();
    }

    var last_g = svgGroup.select("#svg"+visID+"g"+parseInt(Object.keys(data).length-1));

    last_g
        .select(".last-vertical-line")
        .attr("marker-start","")
        .attr("marker-end","url('#Circle')")
        .attr("x1",145)
        .attr("x2",145)
        .attr("y1",160)
        .attr("y2",defaultSize / 2);



    last_g
        .append("line")
        .attr("class","last-g-horizontal-line")
        .attr("x1", function(d,i){
                return parseFloat(d3.select(this.parentNode).select(".last-vertical-line").attr("x1"));
        })
        .attr("x2", function(d,i){

              number_of_rows_left = (-1*( parseInt(Object.keys(data).length) % elementsPerRow)) + elementsPerRow;
              // alert(number_of_rows_left);
              if( number_of_rows_left ==  elementsPerRow-1){
                  // console.log("return");
                  // console.log((-1*(spacing + defaultSize)) + 134);
                  // console.log('');
                  return (-1*(spacing + defaultSize)) + 134;
              }

              if( (Object.keys(data).length) % elementsPerRow == 0){
                // console.log("return");
                // console.log(((elementsPerRow-1) * (-1*(spacing + defaultSize))) - 80);
                // console.log('');
                    return ((elementsPerRow-1) * (-1*(spacing + defaultSize))) - 80;
              }


              number_of_rows_left = parseInt(Object.keys(data).length) % elementsPerRow;

              // console.log("return347");
              // console.log( ((number_of_rows_left) * (-1*(spacing + defaultSize))) - 50);
              // console.log("elementsPerRow: "+elementsPerRow);
              // console.log("i: "+i);
              // console.log("");
              return ((number_of_rows_left) * (-1*(spacing + defaultSize))) + 130;

        })
        .attr("y1", function(d,i){
              return parseFloat(d3.select(this.parentNode).select(".last-vertical-line").attr("y1")) - 3;
        })
        .attr("y2", function(d,i){
              return parseFloat(d3.select(this.parentNode).select(".last-vertical-line").attr("y1")) - 3;
        })
        .attr("stroke","black")
        // .attr("stroke","red")
        .attr("stroke-width",5);

      last_g
          .append("line")
          .attr("class","last-g-vertical-line")
          .attr("x1", function(d,i){
                return parseFloat(d3.select(this.parentNode).select(".last-g-horizontal-line").attr("x2"));
          })
          .attr("x2", function(d,i){
                return parseFloat(d3.select(this.parentNode).select(".last-g-horizontal-line").attr("x2"));
          })
          .attr("y1", function(d,i){
                number_of_rows_left = parseInt(Object.keys(data).length / elementsPerRow);
                if( (Object.keys(data).length) % elementsPerRow == 0){
                  number_of_rows_left = parseInt(Object.keys(data).length / elementsPerRow) - 1;
                  return (-1 * ((number_of_rows_left * (defaultSize + spacing) )) ) + 50;
                }
                return (-1 * ((number_of_rows_left * (defaultSize + spacing) )) ) + 50;
          })
          .attr("y2", function(d,i){
                // number_of_rows_left = ( parseInt(Object.keys(data).length) / elementsPerRow) + elementsPerRow;
                return parseFloat(d3.select(this.parentNode).select(".last-g-horizontal-line").attr("y1"));
          })
          // .attr("stroke","blue")
          .attr("stroke","black")
          .attr("stroke-width",5);


      last_g
          .append("line")
          .attr("x2", function(d,i){
              return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line").attr("x2"));
          })
          .attr("x1", function(d,i){
              return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line").attr("x2")) + 60;
          })
          .attr("y1", function(d,i){
                return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line").attr("y1"));
          })
          .attr("y2", function(d,i){
                return parseInt(d3.select(this.parentNode).select(".last-g-vertical-line").attr("y1"));
          })
          .attr("stroke","black")
          // .attr("stroke","yellow")
          .attr("stroke-width",5)
          .attr("marker-start","url('#Triangle')");

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
