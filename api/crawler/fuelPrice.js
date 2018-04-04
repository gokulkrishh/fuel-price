const mongoose = require("mongoose");
const fetch = require("node-fetch");
const xml2json = require("xml2json");
const config = require("../config.json");

const FuelPrice = mongoose.model("fuelPrice");

exports.saveToDB = () => {
	// const states = [{ value: "ap1", name: "Andhra Pradesh" }, { value: "as", name: "Assam" }, { value: "br", name: "Bihar" }, { value: "ct", name: "Chhattisgarh" }, { value: "ch", name: "Chandigarh" }, { value: "dl", name: "New Delhi" }, { value: "ga", name: "Goa" }, { value: "gj", name: "Gujarat" }, { value: "hr", name: "Haryana" }, { value: "hp", name: "Himachal Pradesh" }, { value: "jk", name: "Jammu & Kashmir" }, { value: "jh", name: "Jharkhand" }, { value: "ka", name: "Karnataka" }, { value: "kl", name: "Kerala" }, { value: "mp", name: "Madhya Pradesh" }, { value: "mh", name: "Maharashtra" }, { value: "mn", name: "Manipur" }, { value: "ml", name: "Meghalaya" }, { value: "mz", name: "Mizoram" }, { value: "nl", name: "Nagaland" }, { value: "or", name: "Orissa" }, { value: "pb", name: "Punjab" }, { value: "py", name: "Pondicherry" }, { value: "rj", name: "Rajasthan" }, { value: "sk", name: "Sikkim" }, { value: "tn", name: "Tamil Nadu" }, { value: "tg", name: "Telangana" }, { value: "tr", name: "Tripura" }, { value: "up", name: "Uttar Pradesh" }, { value: "ut", name: "Uttarakhand" }, { value: "wb", name: "West Bengal" }];
	const states = [
		{ value: "Andhra Pradesh", name: "Andhra Pradesh" },
		{ value: "Assam", name: "Assam" },
		{ value: "Bihar", name: "Bihar" },
		{ value: "Chhattisgarh", name: "Chhattisgarh" },
		{ value: "Chandigarh", name: "Chandigarh" },
		{ value: "New Delhi", name: "New Delhi" },
		{ value: "Goa", name: "Goa" },
		{ value: "Gujarat", name: "Gujarat" },
		{ value: "Haryana", name: "Haryana" },
		{ value: "Himachal Pradesh", name: "Himachal Pradesh" },
		{ value: "Jammu & Kashmir", name: "Jammu & Kashmir" },
		{ value: "Jharkhand", name: "Jharkhand" },
		{ value: "Karnataka", name: "Karnataka" },
		{ value: "Kerala", name: "Kerala" },
		{ value: "Madhya Pradesh", name: "Madhya Pradesh" },
		{ value: "Maharashtra", name: "Maharashtra" },
		{ value: "Manipur", name: "Manipur" },
		{ value: "Meghalaya", name: "Meghalaya" },
		{ value: "Mizoram", name: "Mizoram" },
		{ value: "Nagaland", name: "Nagaland" },
		{ value: "Odisha", name: "Odisha" },
		{ value: "Punjab", name: "Punjab" },
		{ value: "Pondicherry", name: "Pondicherry" },
		{ value: "Rajasthan", name: "Rajasthan" },
		{ value: "Sikkim", name: "Sikkim" },
		{ value: "Tamil Nadu", name: "Tamil Nadu" },
		{ value: "Telangana", name: "Telangana" },
		{ value: "Tripura", name: "Tripura" },
		{ value: "Uttar Pradesh", name: "Uttar Pradesh" },
		{ value: "Uttarakhand", name: "Uttarakhand" },
		{ value: "West Benga", name: "West Bengal" }
	];

	const options = {
		method: "PUT",
		body: JSON.stringify([]),
		headers: {
			"content-type": "application/json"
		}
	};

	const optionsForFuelAPI = {
		method: "GET",
		headers: {
			"X-Mashape-Key": config.fuelApiKey
		}
	};

	fetch(`${config.mongoDBAjaxUrl}`, options)
		.then(response => response.json())
		.then(() => {
			states.forEach(stateObj => {
				const stateName = stateObj.value.toLowerCase();
				fetch(`${config.crawlerUrl}${stateName}`, optionsForFuelAPI)
					.then(response => response.json())
					.then(response => {
						if (response && response.location && response.districts.length > 0) {
							const newFuelPrice = new FuelPrice({
								state: response.location,
								result: response.districts.map(district => {
									district.stateCode = stateName;
									return district;
								})
							});
							newFuelPrice.save(error => {
								if (error) console.log("Error occurred while saving fuel price data", error);
								console.log(`Fuel prices for ${stateObj.name} is saved.`);
							});
						}
					});
			});
		});
};
