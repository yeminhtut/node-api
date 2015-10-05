var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var port = process.env.PORT || 8080; // set the port for our app
var User = require('./app/models/user');
var jwt = require('jsonwebtoken');
var superSecret = 'iamsuperscret';

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

	apiRouter.post('/authenticate',function(req,res){
		User.findOne({username:req.body.username}).select('name username password').exec(function(err,user){
			if(err) throw err;
			if(!user){
				res.json({success:false,message:"Authentication failed, user not found"});
			}
			else if(user){
				var validPassword = user.comparePassword(req.body.password);
				if(!validPassword){
					res.json({success:false,message:"Authentication failed, invalid password"});
				}
				else{
					// create a token
					var token = jwt.sign(
										{name: user.name,username: user.username},
										superSecret, 
										{expiresIn: "10h" });
					res.json({success:true,message:'Enjoy your token',token:token});
				}				
			}			
		})
	})
	//middleware
	apiRouter.use(function(req,res,next){
		var token = req.body.token || req.param('token') || req.headers['x-access-token'];
		if(token){
			jwt.verify(token,superSecret,function(err,decoded){
				if(err){
					return res.status(403).send({
						success:false,
						message:'failed to authenticate token'
					});
				}
				else{
					// if everything is good, save to request for use in other routes
					req.decoded = decoded;
					next();
				}
			});
		}
		else {	
			// if there is no token
			// return an HTTP response of 403 (access forbidden) and an error message
			return res.status(403).send({
				success: false,
				message: 'No token provided.'
			});
		}
		console.log('somebody come to our app');
	});

	apiRouter.get('/',function(req,res){
		res.json({message:'Welcome to our api'});
	});

	apiRouter.get('/me',function(req,res){
		res.send(req.decoded);
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
					return res.json({ success: false, message: 'A user with that username already exists. '});
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