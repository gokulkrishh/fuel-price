const mongoose = require("mongoose");

const FuelPrice = mongoose.model("fuelPrice");
const fetch = require("node-fetch");

exports.getAll = (req, res) => {
	FuelPrice.find({}, (err, data) => {
		if (err) res.send(err);
		res.json(data);
	});
};

exports.getByState = (req, res) => {
	FuelPrice.find({ state: req.params.stateCode }, (err, data) => {
		if (err) res.send(err);
		res.json(data);
	});
};

exports.getCurrentCity = (req, res) => {
	fetch("http://ip-api.com/json")
		.then(response => response.json())
		.then(response => {
			res.send(response);
		})
		.catch(error => {
			res.send(error);
		});
};
