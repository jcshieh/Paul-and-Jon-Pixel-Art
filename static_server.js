// Require the functionality we need to use:
var http = require('http'),
	url = require('url'),
	path = require('path'),
	mime = require('mime'),
	path = require('path'),
	fs = require('fs'),
	socketio = require('socket.io');
	//lets require/import the mongodb native drivers.
	var mongodb = require('mongodb');
	
	//We need to work with "MongoClient" interface in order to connect to a mongodb server.
	var MongoClient = mongodb.MongoClient;
	
	// Other stuff we might need
	var assert = require('assert');
	var ObjectId = require('mongodb').ObjectID;
	
	// Connection URL. This is where your mongodb server is running.
	var mongoUrl = 'mongodb://jonathan:shieh@ds057944.mongolab.com:57944/pj-pixel-art';
 
// Make a simple fileserver for all of our static content.
// Everything underneath <STATIC DIRECTORY NAME> will be served.
var app = http.createServer(function(req, resp){
	
	var filename = path.join(__dirname, "pixel", url.parse(req.url).pathname);
	(fs.exists || path.exists)(filename, function(exists){
		if (exists) {
			fs.readFile(filename, function(err, data){
				if (err) {
					// File exists but is not readable (permissions issue?)
					resp.writeHead(500, {
						"Content-Type": "text/plain"
					});
					resp.write("Internal server error: could not read file");
					resp.end();
					return;
				}
 
				// File exists and is readable
				var mimetype = mime.lookup(filename);
				resp.writeHead(200, {
					"Content-Type": mimetype
				});
				resp.write(data);
				resp.end();
				return;
			});
		}else{
			// File does not exist
			resp.writeHead(404, {
				"Content-Type": "text/plain"
			});
			resp.write("Requested file not found: "+filename);
			resp.end();
			return;
		}
	});
});
app.listen(3456);

// Do the Socket.IO magic:
var io = socketio.listen(app);
io.sockets.on("connection", function(socket){
	
	socket.on('save_image', function(data){
		// Use connect method to connect to the Server
		MongoClient.connect(mongoUrl, function (err, db) {
		  if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
			//HURRAY!! We are connected. :)
			console.log('Connection established to', mongoUrl);
		
			// DO STUFF HERE
			db.collection('images').insertOne( {
				"title" : data['title'],
				"description" : data['description'],
				"pixelArray" : data['pixelArray'],
				"responses" : {"up":0, "down":0},
				"concentration" : {"red":data['red'], "green":data['green'], "blue":data['blue']}
			 }, function(err, result) {
				assert.equal(err, null);
				console.log("Inserted a document into the images collection.");
				//Close connection
				db.close();
			 });
		  }
		});
	});
	
	socket.on('load_images', function(data){
		//Use connect method to connect to the Server
		MongoClient.connect(mongoUrl, function (err, db) {
		  if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
			//HURRAY!! We are connected. :)
			console.log('Connection established to', mongoUrl);
		
			// DO STUFF HERE
			var cursor = db.collection('images').find( ).toArray(function (err, result) {
				if (err) {
				  console.log(err);
				} else if (result.length) {
				  console.log('Found:', result);
				} else {
				  console.log('No document(s) found with defined "find" criteria!');
				}
				//Close connection
				db.close();
				console.log(cursor);
				io.sockets.emit("images_to_client",result);
			  });
			}
		  });
	});
	
	socket.on('up_rating', function(data){
		// Use connect method to connect to the Server
		MongoClient.connect(mongoUrl, function (err, db) {
		  if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
			//HURRAY!! We are connected. :)
			console.log('Connection established to', mongoUrl);
		
			// DO STUFF HERE
			db.collection('images').updateOne( {
				"title" : data['title'] },
				{
					$inc: {"responses.up": 1}
				}, function(err, result) {
				assert.equal(err, null);
				console.log("Updated a document into the images collection.");
				//Close connection
				db.close();
			 });
		  }
		});
	});
	
	socket.on('down_rating', function(data){
		// Use connect method to connect to the Server
		MongoClient.connect(mongoUrl, function (err, db) {
		  if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		  } else {
			//HURRAY!! We are connected. :)
			console.log('Connection established to', mongoUrl);
		
			// DO STUFF HERE
			db.collection('images').updateOne( {
				"title" : data['title'] },
				{
					$inc: {"responses.down": 1}
				}, function(err, result) {
				assert.equal(err, null);
				console.log("Updated a document into the images collection.");
				//Close connection
				db.close();
			 });
		  }
		});
	});
	
});
