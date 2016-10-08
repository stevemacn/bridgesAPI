var express = require("express"),
app = express();

// tell express to use the bodyParser middleware
// and set upload directory
app.use(express.bodyParser({ keepExtensions: true, uploadDir: "uploads" }));
app.engine('jade', require('jade').__express);

app.post("/upload", function (request, response) {
         // request.files will contain the uploaded file(s),
         // keyed by the input name (in this case, "file")
         
         // show the uploaded file name
         console.log("file name", request.files.file.name);
         console.log("file path", request.files.file.path);
         
         response.end("upload complete");
         });

// render file upload form
app.get("/", function (request, response) {
        response.render("upload_form.jade");
        });

app.listen(3000);