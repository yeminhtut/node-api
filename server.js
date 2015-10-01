var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var port = process.env.PORT || 8080; // set the port for our app

app.get('/',function(req,res){
	res.send("Let's do it");
});

app.listen(port);
console.log("8080 is magic port");