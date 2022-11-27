const path = require('path');

const axios = require('axios');
const querystring = require('querystring');

const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

const config = require('./config');
const Person = require('./models/Person');

let db = mongoose.connect(config.mongo.uri, config.mongo.connectionOptions);
const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());


app.post('/auth/getToken', async (req, res) => {
	let data = req.body;
	let ig_access_token_URI = 'https://api.instagram.com/oauth/access_token';

	const json = {
		client_id: config.ig.client_id,
		client_secret: config.ig.client_secret,
		grant_type: "authorization_code", 
		redirect_uri: data.redirect_uri,
		code: data.code
	}
	const auth_resp = await axios.post(ig_access_token_URI, querystring.stringify(json))
		.then(proxy_res => {
			return proxy_res;
		})
		.catch(error => {
			console.log('Error: ', error.message);
			console.log(error.request.data);
			console.log(error.response.data);
			return {error: "There was an error in querying Instagram."}
		});

	res.json(auth_resp.data);
});

app.post('/submit', (req, res) => {
	let data = req.body;
	let person = {
		igName: "", 
		village: {
			name: "",
			long: "",
			lat: ""
		}
	};

	for (const key in data) {
		switch(key){
			case "igName":
				if (data[key] !== ""){
					person[key] = data[key];
				}
				break;
			case "pos":
			case "villageName":
				if (data[key] !== ""){
					if(key == "villageName"){
						person["village"]["name"] = data[key];
					}
					else if(key == "pos"){
						[long, lat] = data[key];

						person["village"]["long"] = long;
						person["village"]["lat"] = lat;
					}
				}
				break;
		}
	}
		
	Person.create(person, function(err, person){
		if(err){ 
			console.log(err);
			res.sendStatus(400);
		} else {
			res.json(person);
		}
	});
});

app.post('/deleteMarker', (req, res) => {
	let data = req.body;
	let person = {
		igName: data.igName, 
		village: {
			name: data.villageName,
			long: (data.pos[0]).toString(),
			lat: (data.pos[1]).toString()
		}
	};
	
	Person.deleteOne(person, function(err){
		if(err){ 
			console.log(err);
			res.sendStatus(400);
		} else {
			res.sendStatus(200);
		}
	});
});

app.get('/myvillage', (req, res) => {
	//retrieve locations stored from mongo
	Person.findOne({ igName: req.query.igName }, "village", function(err, village){
		if(err){ 
			console.log(err);
			res.sendStatus(400);
		} else {
			res.json(village);
		}
	});
});

app.get('/features', (req, res) => {
	//retrieve locations stored from mongo
	Person.find({ igName: { $nin: [req.query.igName]} }, "village", function(err, villages){
		if(err){ 
			console.log(err);
			res.sendStatus(400);
		} else {
			var geojson = {
				"type": "FeatureCollection",
				"features": []
			};

			villages.forEach(function(village, i, a){
				geojson.features.push({
					"type": "Feature",
					"geometry": {
						"type": "Point",
						"coordinates": [parseFloat(village.village.long), parseFloat(village.village.lat)]
					},
					"properties": {
						"name": village.village.name
					}
				});
			});
			res.json(geojson);
		}
	});
});

app.get('*', (req, res) => {
	res.redirect('/');
});
/*
app.get('*', (req, res) => {
	console.log();
	Person.find({ igName: {$nin: [req.body.igName]} }, 'village', function (err, villages) {
		if(err){
			res.sendStatus(400);
		} else {
			res.render('index.pug', {
				appname: config.APPNAME,
				villages: villages
			});
		}
	});
});
*/
app.listen(config.PORT, function () {
  console.log(`App currently running; navigate to localhost:${config.PORT} in a web browser.`);
});