const db = require(`../models/db.js`);

const controller = {

	FAQ: function(req, res){
		var q;

		  db.findMany('FAQS', null,
		  	{
		  		OPpath: 1,
		  		author: 1,
		  		name: 1,
		  		title: 1, 
		  		text: 1,
		  		question_id: 1,
		  		comment: 1,
		  		asker_id: 1
		  	}, function(result){
		  		db.findOne(`users`, {email: req.session.email}, function(result2){
			  		 res.render('FAQ', {
			  		 	q: result,
			  		 	name: req.session.name,
			  		 	path: result2.path
			  		 });
			  	});
		  })
	},

	submitFAQ: function(req, res){

		var questionidstring;
		var questionidvalue;
		var commentObj = 
		{
			COPpath: "",
			comment_name: "",
			comment_text:"",
			status: "Submit Comment",
			answered: false
		}
		db.findMany('FAQS', null, {
				question_id: 1
			}, 
			function(result2){

	  			db.countDocuments('FAQS', function(result){

	  				if(result == 0){
	  					questionidvalue = 0;
	  				} else{
	  					questionidstring = result2[(result2.length - 1)].question_id;
			  			questionidstring = questionidstring.split("_");
			  			questionidvalue = parseInt(questionidstring[1]) + 1;
	  				}

	  				db.findOne('users', {email: req.session.email}, function(result3)
	  				{
	  					var faq = {
	  					OPpath: result3.path,
				        author: req.session.email,
				        name: req.session.name,
				        title: req.query.questiontitle,
				        text: req.query.questiontext,
				        question_id: "question_" + questionidvalue,
				        asker_id: result3.user_id,
				        comment: commentObj
			   	 		}

				   	 	db.insertOne(`FAQS`, faq, function(result){
								res.render('partials\\post', {OPpath:result3.path, name:req.session.name, question_id:faq.question_id, title:req.query.questiontitle, text:req.query.questiontext, comment: faq.comment}, function(err, result)
									{
										res.send(result);
									});
						});
	  				})
			});
		});
	},

	indivFAQ: function(req, res)
	{
		var question_id = req.query.question_id;
	  	db.findOne('FAQS', {question_id:question_id}, function(result)
	  	{
	  	
	  		res.render('indivFAQ', 
	  			{
	  				path: result.OPpath,
		  			name: result.name,
					title: result.title,
					text: result.text,
					comment: result.comment,
					question_id: result.question_id,
					asker_id: result.asker_id
	  			}	
	  		);
	  	});
	},

	submitcomment: function(req,res)
	{
		var question_id = req.query.question_id;
		var comment = req.query.comment_text;

		db.findOne('users', {email: req.session.email}, function(result)
		{
			var commentObj = 
			{
				COPpath : result.path,
				comment_name: result.name,
				comment_text: comment,
				status: "Edit Comment",
				answered: true,
				question_id: question_id
			}

			db.updateOne('FAQS', {question_id: question_id}, 
			{
				$set : {comment: commentObj}  
			}, function(result){
				res.render('partials\\comment', {comment:commentObj}, function(err, result)
				{
					res.send(result);
				});
			});
		});

	},

	checkuser: function(req, res){
		db.findOne('users', {email: req.session.email}, function(result){
			res.send(result.user_id);
		})
	}
}

module.exports = controller;

