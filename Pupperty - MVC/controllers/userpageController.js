const db = require(`../models/db.js`);

const controller = {

	userpage: function(req, res){
		var u;
		var questionsArray;
		var postsArray;
		var adoptArray;

		console.log("Email and name of current session: "+ req.session.email + " -- " + req.session.name);

		db.findMany(`FAQS`, {author: req.session.email}, {
			author: 1,
			name: 1,
			title: 1,
			text: 1,
			question_id: 1
		}, function(result){questionsArray = result;})

		db.findMany(`adoption_posts`, {poster_email: req.session.email}, {
			name: 1,
			path: 1,
			adoption_status: 1,
			post_id: 1
		}, function(result){postsArray = result;})

		db.findMany(`adoption_posts`, {owner: req.session.email}, {
			name: 1,
			path: 1,
			adoption_status: 1,
			post_id: 1
		}, function(result){adoptArray = result;})

		db.findOne(`users`, {email: req.session.email}, function(result2){
			console.log('result' + result2.name);

			res.render(`userpage`, {
				u: {
					email: result2.email,
					name: result2.name,
					bio: result2.bio,
					address: result2.address,
					contact: result2.contact,
					salary: result2.salary,
					certvalid: result2.certvalid,
					adoptcount: adoptArray.length,
					rescuecount: result2.rescuer.length,
					path: result2.path,
					questions: questionsArray,
					posts: postsArray,
					adopts: adoptArray,
					certificate: result2.certificate,
					bgpath: result2.bgpath
				}
			});
		})
	},

	submitcertificate: function(req, res){
		db.updateOne(`users`, {email: req.session.email}, {$set: {
			certificate: req.file.filename
		}})

		res.redirect('/userpage');
	},

	deleteuser: function(req, res){
		db.deleteOne(`users`, {email: req.session.email});
		res.redirect(`/`);
	},


	deletepost: function(req, res){
		db.deleteOne(`adoption_posts`, {post_id: req.query.postno});

		res.redirect('/userpage');
	},

	deletequestion: function(req, res){
		db.deleteOne(`FAQS`, {question_id: req.query.questionno});

		res.redirect('/userpage');
	},

	editquestion: function(req, res){
		var user;
		var q;

		db.findOne(`users`, {email: req.session.email}, function(result2){
			user = result2;

			db.findOne(`FAQS`, {question_id: req.query.question}, function(result){
			res.render(`EditQuestion`, {
				q:{
					name: result2.name,
					path: result2.path,
					title:  result.title,
					text: result.text,
					question_id: req.query.question
					}
				});	
			});
		});
	},

	editpost: function(req, res){
		var d;
		var hbsex, hbsize;

		db.findOne(`adoption_posts`, {post_id: req.query.post}, function(result){

		if(result.sex == "Male"){
			hbsex = "<input type='radio' id = 'male' name = 'sex' value = 'Male' checked> <label for = 'male'>Male</label> <input type='radio' id = 'female' name = 'sex' value = 'Female'> <label for = 'female'>Female</label> <br><br>"
		} else{
			hbsex = "<input type='radio' id = 'male' name = 'sex' value = 'Male'> <label for = 'male'>Male</label> <input type='radio' id = 'female' name = 'sex' value = 'Female' checked> <label for = 'female'>Female</label> <br><br>"
		}

		if(result.size == "Small"){
			hbsize = "<input type='radio' id = 'small' name = 'size' value = 'Small' checked> <label for = 'small'>Small</label> <input type='radio' id = 'medium' name = 'size' value = 'Medium'> <label for = 'medium'>Medium</label> <input type='radio' id = 'large' name = 'size' value = 'Large'> <label for = 'large'>Large</label> <br><br>"
		}
		else if(result.size == "Medium"){
			hbsize = "<input type='radio' id = 'small' name = 'size' value = 'Small'> <label for = 'small'>Small</label> <input type='radio' id = 'medium' name = 'size' value = 'Medium' checked> <label for = 'medium'>Medium</label> <input type='radio' id = 'large' name = 'size' value = 'Large'> <label for = 'large'>Large</label> <br><br>"
		}
		else{
			hbsize = "<input type='radio' id = 'small' name = 'size' value = 'Small'> <label for = 'small'>Small</label> <input type='radio' id = 'medium' name = 'size' value = 'Medium'> <label for = 'medium'>Medium</label> <input type='radio' id = 'large' name = 'size' value = 'Large' checked> <label for = 'large'>Large</label> <br><br>"
		}

		res.render(`EditPost`, {
			d:{
				name: result.name,
				path: result.path,
				breed: result.breed,
				sex:  hbsex,
				size: hbsize,
				age: result.age,
				remarks: result.remarks,
				postid : result.post_id
				}
			});	
		});
	}
}

module.exports = controller;
