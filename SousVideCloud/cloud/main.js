 var express = require('express');
 var app = express();

 app.use(express.bodyParser()); // Populate req.body

 // // basic auth not enabled for this route
 // app.get('/', function(req, res) {
 // 	res.send('Unathorized request made');
 // });
 // // basic auth not enabled for this route
 // app.get('/testget', function(req, res) {
 // 	//res.send('Request made with get to test');
 // 	var Message = Parse.Object.extend("Message");
 // 	var message = new Message();
 // 	message.save({
 // 		text: req.body.text
 // 	}).then(function(message) {
 // 		res.send('Success saving the var' + req.body.text);
 // 	}, function(error) {
 // 		res.status(500);
 // 		res.send('Error');
 // 	});
 // });

 // basic auth is enabled for this route
 app.post('/test',
 	//	express.basicAuth('username', 'password'),

 	function(req, res) {
 		console.log("Body  is: "+req.body);
 		console.log("Body Name is: "+req.param('message'));
 		if (req.body.message == "hello") {
 			var Message = Parse.Object.extend("Message");
 			var message = new Message();
 			message.save({
 				username: req.body.message
 			}).then(function(message) {
 				res.send('Success saving the user: ' +req.body.message);
 			}, function(error) {
 				res.status(500);
 				res.send('Error');
 			});
 		}else{
 			res.status(406);
 			res.send('Bad username');
 		}
 	});

 app.listen();