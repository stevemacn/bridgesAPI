
function snapImage() {
  $("#saveButton").click(function() {
                      html2canvas($("#vis"), {
                                  onrendered: function(canvas) {
                                  var theCanvas = canvas;
                                 // document.body.appendChild(canvas);
                                  window.open(canvas.toDataURL());
                                  
                                 //theCanvas.toBlob(function(blob) {
                                                //document.body.appendChild(blob);
                                  //             saveAs(blob,
                                  //                     "1asdfdf.png");
                                  //          }, "image/png");
                                  }
                                  });
                      });
  }