/* Scripts related to the Bridges user gallery */

var galleryImages = d3.selectAll('.visimg');

// on mouseover of gallery image, display date info
galleryImages.on('mouseover', function(d, i) {
  d3.selectAll(".dateCreated").style("display", function(d, j) {
    if(i == j) return "block";
  });
});

// on mouseout, hide date info
galleryImages.on('mouseout', function(d, i) {
  d3.selectAll(".dateCreated").style("display", "none");
});
