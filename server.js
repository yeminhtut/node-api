var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var port = process.env.PORT || 8080; // set the port for our app
var User = require('./app/models/user');

// APP CONFIGURATION ---------------------
// use body parser so we can grab information from POST requests
 app.use(bodyParser.urlencoded({ extended: true }));
 app.use(bodyParser.json());

// configure our app to handle CORS requests
 app.use(function(req, res, next) {
	 res.setHeader('Access-Control-Allow-Origin', '*');
	 res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	 res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
	 next();
 });

app.use(morgan('dev'));

// connect to our database (hosted on modulus.io)
	mongoose.connect('mongodb://yemin:yemin123@apollo.modulusmongo.net:27017/toBa8nuq');


	app.get('/',function(req,res){
		res.send("Welcome to the home page");
	});

	var apiRouter = express.Router();
	//middleware
	apiRouter.use(function(req,res,next){
		console.log('somebody come to our app');
		next();
	});

	apiRouter.get('/',function(req,res){
		res.json({message:'Welcome to our api'});
	});

	apiRouter.route('/user')
 		.post(function(req, res) {
			// create a new instance of the User model
			var user = new User();
			// set the users information (comes from the request)
			user.name = req.body.name;
			user.username = req.body.username;
			user.password = req.body.password;
			// save the user and check for errors
			user.save(function(err) {
				if (err) {
				// duplicate entry
				if (err.code == 11000)
					return res.json({ success: false, message: 'A user with thatusername already exists. '});
				else
					return res.send(err);
				}
				res.json({ message: 'User created!' });
			});
		})
		.get(function(req,res){
			User.find(function(err,users){
				if(err) res.send(err);
				res.json(users);
			});
		});

	apiRouter.route('/user/:user_id')
		.get(function(req,res){
			User.findById(req.params.user_id,function(err,user){
				if(err) res.send(err);
				res.json(user);
			})
		})

		.put(function(req,res){
			User.findById(req.params.user_id,function(err,user){
				if(err) res.send(err);
				if(req.body.name) user.name = req.body.name;
				if(req.body.username) user.username = req.body.username;
				if(req.body.password) user.password = req.body.password;

				user.save(function(err){
					if(err) res.send(err);
					res.json({message: "User updated"});
				})
			})
		})

		.delete(function(req,res){
			User.remove({
				_id:req.params.user_id
			},function(err,user){
				if(err) res.send(err);
				res.json({message:'Successfully deleted'});
			});
		})


app.use('/api',apiRouter);

app.listen(port);
console.log("8080 is magic port");