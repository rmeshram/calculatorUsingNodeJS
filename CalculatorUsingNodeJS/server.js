var http = require("http"),
	fs = require("fs"),
	url = require("url"),
	calculator = require("./calculator"),
	path = require("path");

var extractData = function(req, res) {
	if (req.method === "GET") {
		console.log("req" + req)
		console.log("url.parse(req.url,true).query" + url.parse(req.url, true).query)
		req.params = url.parse(req.url, true).query;
	}
}

var staticResourceExts = [".html", ".css", ".js", ".jpg", ".png", ".ico"];
var isStaticResource = function(pathName) {
	return staticResourceExts.some(function(ext) {
		return path.extname(pathName) === ext;
	});
}
var serveStatic = function(req, res) {
	console.log(req.url)
	console.log(__dirname)
	var filePath = path.join(__dirname, req.url);
	fs.exists(filePath, function(exists) {
		console.log("exists:" + exists)
		if (!exists) {
			res.statusCode = 404;
			res.end();
		} else {
			fs.createReadStream(filePath, {
				encoding: "utf8"
			}).pipe(res);
			console.log(res)
		}
	});
}
var processCalculator = function(req, res) {
	var n1 = parseInt(req.params.number1, 10),
		n2 = parseInt(req.params.number2, 10),
		oper = req.params.operation;
	console.log(typeof oper)
	var result = calculator[oper](n1, n2);
	res.write("Result = " + result.toString());
	res.end();
}
var onConnection = function(req, res) {
	console.log("res:" + res)
	console.log("resq:" + req)
	req.pathName = req.url === "/" ? "index.html" : url.parse(req.url).pathname;

	if (isStaticResource(req.pathName)) {
		serveStatic(req, res);
	} else {
		extractData(req, res);
		if (req.pathName === "/calculate") {
			processCalculator(req, res);
		} else {
			res.statusCode = 404;
			res.end();
		}
	}
}
var server = http.createServer(onConnection);
server.listen(8888);
console.log("server listening on port 8888");

///calculate?operation=add&number1=100&number=200