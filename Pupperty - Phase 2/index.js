const http = require('http');
const url = require('url');
const dotenv = require('dotenv');
const fs = require(`fs`);
const express = require(`express`);
const bodyParser = require(`body-parser`);
const db = require('./models/db.js')
const hbs = require(`hbs`);
const multer = require('multer');

const storage = multer.diskStorage({
	destination: function(req, file, callback){
		callback(null, './public/uploads');
	},
	filename: function(req, file, callback){
		callback(null, new Date().getMonth() + "-" + new Date().getDate() + "-" + new Date().getFullYear() + "_" + new Date().getHours() + "-" + new Date().getMinutes() + "_" + file.originalname);
	}
})

const upload = multer({storage: storage});

hbs.registerPartials(__dirname + '/views/partials');

const app = express();
app.set(`view engine`, `hbs`);
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));

dotenv.config();
port = process.env.PORT;
hostname = process.env.HOSTNAME;

// limit an array to a maximum of elements (from the start)
hbs.registerHelper('limit', function (arr, limit) {
  if (!Array.isArray(arr)) { return []; }
  return arr.slice(0, limit);
})

hbs.registerHelper('reverseArray', (array) => array.reverse());

//global variables
var logName;
var logEmail;

app.get(`/`, function(req, res){
	res.render(`Login`);
})

app.get(`/signup`, function(req, res){
	res.render(`Signup`);
})

app.get(`/homepage`, function(req, res){
	var u;
	var postsArray;

	console.log("Email and name of current session: "+ logEmail + " -- " + logName);

	db.findMany(`adoption_posts`, {adoption_status: false}, {
		name: 1,
		path: 1
	}, function(result){
		postsArray = result;
		console.log('result ' + postsArray);

		res.render(`HomePage`, {
			u: {
				posts: postsArray
			}
		})
	})
})

app.get(`/userpage`, function(req, res){

	var u;
	var questionsArray;

	console.log("Email and name of current session: "+ logEmail + " -- " + logName);

	db.findMany(`FAQS`, {author: logName}, {
		author: 1,
		title: 1,
		text: 1,
	}, function(result){questionsArray = result;})

	db.findOne(`users`, {email: logEmail}, function(result2){
		console.log('result' + result2.name);

		res.render(`userpage`, {
			u: {
				email: result2.email,
				name: result2.name,
				bio: result2.bio,
				address: result2.address,
				contact: result2.contact,
				salary: result2.salary,
				status: result2.status,
				certvalid: result2.certvalid,
				adoptcount: result2.homeowner.length,
				rescuecount: result2.rescuer.length,
				questions: questionsArray
			}
		});
	})
})

app.get(`/addpost`, function(req, res){
	res.render(`AddPost`);
})

app.get(`/adoption`, function(req, res){
	res.render(`Adoption`);
})

app.get(`/editpost`, function(req, res){
	res.render(`EditPost`);
})

app.get(`/editquestion`, function(req, res){
	res.render(`EditQuestion`);
})

app.get(`/edituser`, function(req, res){

	var prev;

	db.findOne(`users`, {email: logEmail}, function(result){

		console.log('final result = ' + result);
		
		res.render(`edituserpage`, {
			prev: {
				name: "<input type = 'text' id = 'usernameform' name = 'usernameform' value = '" + result.name + "' size = '58'>",
				bio: result.bio,
				address: "<input type = 'text' id = 'addressform' name = 'addressform' value = '" + result.address + "' size = '58'>",
				contact: "<input type = 'text' id = 'numberform' name = 'numberform' value = '" + result.contact + "' size = '58'>",
				salary: "<input type = 'text' id = 'moneyform' name = 'moneyform' value = '" + result.salary + "' size = '58'>",
			}
		})
	})	
})

app.post(`/submitedit`, function(req, res){

	db.updateOne(`users`, {email: logEmail}, {$set: {
		name: req.body.usernameform,
		bio: req.body.bioform,
		address: req.body.addressform,
		contact: req.body.numberform,
		salary: req.body.moneyform
	}})

	var u;

	db.findOne(`users`, {email: logEmail}, function(result){
		logName = result.name;

		console.log('result' + result);
		res.render(`userpage`, {
			u: {
				email: result.email,
				name: result.name,
				bio: result.bio,
				address: result.address,
				contact: result.contact,
				salary: result.salary,
				status: result.status,
				certvalid: result.certvalid
			}
		});
	})
})

app.get(`/FAQ`, function(req, res){
	var q;

	  db.findMany('FAQS', null,
	  	{author: 1, 
	  	title:1, 
	  	text:1}, function(result){
	  		 res.render('FAQ', {
	  		 	q:result,
	  		 	name: logName
	  		 });
	  	})
})

app.get(`/browse`, function(req, res){
	var u;
	var postsArray;

	console.log("Email and name of current session: "+ logEmail + " -- " + logName);

	db.findMany(`adoption_posts`, {adoption_status: false}, {
		poster: 1,
		path: 1,
		remarks: 1,
		post_date: 1,
		post_time: 1
	}, function(result){
		postsArray = result;
		console.log('result ' + postsArray);
		console.log('user: ' + logName);

		res.render(`Browse`, {
			u: {
				currentUser: logName,
				posts: postsArray
			}
		})
	})
})

app.post(`/login`, function(req, res){
	// retrieve the data from the form / request
	var email = req.body.email;
	var password = req.body.password;

	// access the database, then save the data
	db.findOne(`users`, {email: email, password: password}, function(result){
		if(result == null){
			res.render(`Login`);
			console.log(`Login unsuccessful. User does not exist in the databse.`);
		}
		else{

			db.findMany(`adoption_posts`, {adoption_status: false}, {
				name: 1,
				path: 1
			}, function(result){
				postsArray = result;
				console.log('result ' + postsArray);

				res.render(`HomePage`, {
					u: {
						posts: postsArray
					}
				})
			})

			logEmail = result.email;
			logName = result.name;
			console.log(`Login successful. User ` + logName + ` ` + logEmail);
		}
	});


})

app.post(`/register`, function(req, res){

	var email = req.body.email;
	var password = req.body.password;

	db.findOne(`users`, {email: email}, function(result){
		if(result != null){
			console.log(`Email already registered.`);
			//alert("Email already registered, please try logging in with your email.");
			res.render(`Login`);
		} else{
			var person = {
				email: email,
				password: password,
				name: "",
				bio: "",
				address: "",
				contact: "",
				salary: "",
				status: "Not Certified",
				certvalid: "",
				homeowner: [],
				rescuer: []
			}

			db.insertOne(`users`, person);
			logEmail = email;

			console.log('Email: ' + logEmail + ' successfully registered.');

			var prev;

			db.findOne(`users`, {email: logEmail}, function(result){

				console.log('final result = ' + result);
				
				res.render(`edituserpage`, {
					prev: {
						name: "<input type = 'text' id = 'usernameform' name = 'usernameform' value = '" + result.name + "' size = '58'>",
						bio: result.bio,
						address: "<input type = 'text' id = 'addressform' name = 'addressform' value = '" + result.address + "' size = '58'>",
						contact: "<input type = 'text' id = 'numberform' name = 'numberform' value = '" + result.contact + "' size = '58'>",
						salary: "<input type = 'text' id = 'moneyform' name = 'moneyform' value = '" + result.salary + "' size = '58'>",
					}
				})
			})	
		}
	})
})

app.post(`/submitadoptionpost`, upload.single('image'), function(req, res){

	console.log(req.file);
	db.countDocuments('adoption_posts', function(result){
		var dog = {
		poster: logName,
		poster_email: logEmail,
		name: req.body.name,
		breed: req.body.breed,
		sex: req.body.sex,
		size: req.body.size,
		age: req.body.age,
		remarks: req.body.remarks,
		image: req.file,
		path: req.file.filename,
		owner: "N/A",
		adoption_status: false,
		post_id: "post_" + result,
		post_date: new Date().getMonth() + "-" + new Date().getDate() + "-" + new Date().getFullYear(),
		post_time: new Date().getHours() + ":" + new Date().getMinutes()
	}
		db.insertOne(`adoption_posts`, dog);

		var u;
		var postsArray;

		console.log("Email and name of current session: "+ logEmail + " -- " + logName);

		db.findMany(`adoption_posts`, {adoption_status: false}, {
			poster: 1,
			path: 1,
			remarks: 1,
			post_date: 1,
			post_time: 1
		}, function(result){
			postsArray = result;
			console.log('result ' + postsArray);
			console.log('user: ' + logName);

			res.render(`Browse`, {
				u: {
					currentUser: logName,
					posts: postsArray
				}
			})
		})
	});
})

app.post(`/submitFAQ`, function(req, res){
	var q;
	var faq = {
        author: logName,
        title: req.body.questiontitle,
        text: req.body.questiontext,
        comments: []
    }

	db.insertOne(`FAQS`, faq);

	db.findMany('FAQS', {author : logName}, 
	  	{author: 1, 
	  	title:1, 
	  	text:1}, function(result){
	  		q = result;
	  		 res.render('FAQ', q);
	  	})
})

app.get(`/deleteuser`, function(req, res){

	db.deleteOne(`users`, {email: logEmail});
	res.render(`Login`);
})

app.listen(port, hostname, function(){
	console.log(`Server running at: `);
	console.log(`http://` + hostname + ':' + port);
})