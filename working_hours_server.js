var fs = require('fs');
var filename = "working_hours.csv";

function getFormatedLine(query) {
    return query.op + "," +
        query.type + "," +  
        query.day + "/" + query.month + "/" + query.year + "," +
        query.hour + ":" + query.minutes + ",\n";
}

function report(res, query) { 
    var op = query.op;
    if (op == "entry" || op == "exit") {
    fs.exists(filename, function(exists) {
        // TODO(Orit): add non sync methods.
        var fd = fs.openSync(filename, 'a');
        
        // TODO(orit): add time, date and format as csv
        var formatedLine = getFormatedLine(query);
        console.log(formatedLine);
        fs.appendFile(filename, formatedLine, function(err) {
            if(err) {
                res.end("Failed to write to file<br>");
            } else {
                res.end(op + " written successfully: " + formatedLine);
            }
        });
        // TODO(orit): close the file and use only non sync methods.
        fs.closeSync(fd);
        }); 
    } else {
        res.end("bad request, don't know what to do");
    }
}

function showMainPage(res) {
    var mainPage = fs.readFileSync('index.html');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(mainPage);
}

function downloadCsvFile(res) {
    fs.readFile(filename, "utf-8", function (err, data) {
    if (err) {
        res.write("failed to fetch file<br>");
        throw err;
    } 
    res.setHeader('Content-disposition', 'attachment; filename=hour_report.csv');
    res.writeHead(200, {
        'Content-Type': 'text/csv'
        });
    res.end(data);
    });
}

// reference the http module so we can create a webserver
var http = require("http");
var url = require("url");

var port = process.env.PORT || 5000;

// create a server
http.createServer(function(req, res) {
    // on every request, we'll output 'Hello world'
    var url_parts = url.parse(req.url, true);
        
    switch (url_parts.pathname) {
        case "/report":
            if (url_parts.query.op) {
                report(res, url_parts.query);
            } else {
                res.end("Don't know what to do, you didn't send a valid op type");
            }
            break;
        case "/fetch":
            downloadCsvFile(res);
            break;
        case "/":
            showMainPage(res);
            break;
        default:
            res.write(url_parts.query["op"] + "<br>");
            res.end("unknown url:" + url.format(url_parts) + "<br>");
    }
//}).listen(process.env.PORT, process.env.IP);
}).listen(port);
