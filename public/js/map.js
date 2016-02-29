var width = d3.select("#mapContainer").style("width").substr(0, d3.select("#mapContainer").style("width").indexOf('p')) - 20,
    height = d3.select("#mapContainer").style("width").substr(0, d3.select("#mapContainer").style("height").indexOf('p')),
    scale0 = (width - 1) / 2 / Math.PI;


var projection = d3.geo.mercator()
  .translate([width / 2, height / 2])
  .scale((width - 1) / 2 / Math.PI);
// var projection = d3.geo.equirectangular();
    // .scale(153)
    // .translate([width / 2, height / 2])
    // .precision(0.1);

// var zoom = d3.behavior.zoom()
//     .translate([width / 2, height / 2])
//     .scale(scale0)
//     .scaleExtent([scale0, 8 * scale0])
//     .on("zoom", zoomed);

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

var path = d3.geo.path()
    .projection(projection);

var graticule = d3.geo.graticule();

var svg = d3.select("#mapContainer").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");

var g = svg.append("g");

svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height);

svg
    .call(zoom)
    .call(zoom.event);


d3.json("/geoJSON/world-50m.json", function(error, world) {
  if (error) throw error;

  // g.append("path")
  //     .datum(graticule)
  //     .attr("class", "graticule")
  //     .attr("d", path);

  g.insert("path", ".graticule")
        .datum(topojson.feature(world, world.objects.land))
        .attr("class", "land")
        .attr("d", path);

  g.insert("path", ".graticule")
        .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
        .attr("class", "boundary")
        .attr("d", path);
});

// function zoomed() {
//   console.log('zoom');
//   projection
//       .translate(zoom.translate())
//       .scale(zoom.scale());
//
//   g.selectAll("path")
//       .attr("d", path);
// }
function zoomed() {
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

d3.select(self.frameElement).style("height", height + "px");
