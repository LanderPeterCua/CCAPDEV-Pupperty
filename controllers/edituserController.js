const db = require(`../models/db.js`);

const controller = {

	edituser: function(req, res){
		var prev;

		db.findOne(`users`, {email: req.session.email}, function(result){
			
			res.render(`edituserpage`, {
				prev: {
					name: "<input type = 'text' id = 'usernameform' name = 'usernameform' value = '" + result.name + "' size = '58' style = 'max-width: 99%; width: 200%;'>",
					bio: result.bio,
					address: "<input type = 'text' id = 'addressform' name = 'addressform' value = '" + result.address + "' size = '58' style = 'max-width: 99%; width: 200%;'>",
					contact: "<input type = 'number' id = 'numberform' name = 'numberform' value = '" + result.contact + "' size = '58'>",
					salary: "<input type = 'number' id = 'moneyform' name = 'moneyform' value = '" + result.salary + "' size = '58'>",
					image: result.path,
					bgpath: result.bgpath
				}
			});
		})	
	},

	submitedit: function(req, res){

		var image;
		var background;

		switch(req.body.bg){
			case '1':
				background = "images/backgrounds/bg1.jpg";
				break;
			case '2':
				background = "images/backgrounds/bg2.jpg";
				break;
			case '3':
				background = "images/backgrounds/bg3.jpg";
				break;
			case '4':
				background = "images/backgrounds/bg4.jpg";
				break;
			case '5':
				background = "images/backgrounds/bg5.jpg";
				break;
			case '6':
				background = "images/backgrounds/bg6.jpg";
				break;
			case '7':
				background = "images/backgrounds/bg7.jpg";
				break;
			case '8':
				background = "images/backgrounds/bg8.jpg";
				break;
			case '9':
				background = "images/backgrounds/bg9.jpg";
				break;
		}

		db.updateMany(`adoption_posts`, {poster_email: req.session.email}, {$set: {
			poster: req.body.usernameform,
			poster_contact: req.body.numberform
		}})

		db.updateMany(`FAQS`, {author: req.session.email}, {$set: {
			name: req.body.usernameform
		}})

		if(background != undefined){
			db.updateOne(`users`, {email: req.session.email}, {$set: {
				bgpath: background
			}}, function(result){})
		}

		if(req.file != undefined){
			db.updateOne(`users`, {email: req.session.email}, {$set: {
				image: req.file,
				path: req.file.filename
			}}, function(result){})

			db.updateMany(`adoption_posts`, {poster_email: req.session.email}, {$set: {
				poster_picture: req.file.filename
			}})
		}

		req.session.name = req.body.usernameform;

		db.updateOne(`users`, {email: req.session.email}, {$set: {
			name: req.body.usernameform,
			bio: req.body.bioform,
			address: req.body.addressform,
			contact: req.body.numberform,
			salary: req.body.moneyform,
			test: req.body.savechanges
		}}, function(result){
			res.redirect('/userpage');
		})

	}
}

module.exports = controller;

