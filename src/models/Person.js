const mongoose = require('mongoose');

const Schema = mongoose.Schema;

PersonSchema = Schema({
  igName: String,
  village: {
		name: {type: String},
		lat: {type: String},
		long: {type: String}
	}
});

const Person = mongoose.model('Person', PersonSchema);

module.exports = Person;