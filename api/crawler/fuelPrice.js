const mongoose = require("mongoose");
const fetch = require("node-fetch");
const xml2json = require("xml2json");
const config = require("../config.json");

const FuelPrice = mongoose.model("fuelPrice");

exports.saveToDB = () => {
  const states = [{ value: "ap1", name: "Andhra Pradesh" }, { value: "as", name: "Assam" }, { value: "br", name: "Bihar" }, { value: "ct", name: "Chhattisgarh" }, { value: "ch", name: "Chandigarh" }, { value: "dl", name: "New Delhi" }, { value: "ga", name: "Goa" }, { value: "gj", name: "Gujarat" }, { value: "hr", name: "Haryana" }, { value: "hp", name: "Himachal Pradesh" }, { value: "jk", name: "Jammu & Kashmir" }, { value: "jh", name: "Jharkhand" }, { value: "ka", name: "Karnataka" }, { value: "kl", name: "Kerala" }, { value: "mp", name: "Madhya Pradesh" }, { value: "mh", name: "Maharashtra" }, { value: "mn", name: "Manipur" }, { value: "ml", name: "Meghalaya" }, { value: "mz", name: "Mizoram" }, { value: "nl", name: "Nagaland" }, { value: "or", name: "Orissa" }, { value: "pb", name: "Punjab" }, { value: "py", name: "Pondicherry" }, { value: "rj", name: "Rajasthan" }, { value: "sk", name: "Sikkim" }, { value: "tn", name: "Tamil Nadu" }, { value: "tg", name: "Telangana" }, { value: "tr", name: "Tripura" }, { value: "up", name: "Uttar Pradesh" }, { value: "ut", name: "Uttarakhand" }, { value: "wb", name: "West Bengal" }];

  const options = {
    method: "PUT",
    body: JSON.stringify([]),
    headers: {
      "content-type": "application/json",
    },
  };

  fetch(`${config.mongoDBAjaxUrl}`, options)
    .then(response => response.json())
    .then(() => {
      states.forEach((stateObj) => {
        const stateName = stateObj.value.toUpperCase();
        fetch(`${config.crawlerUrl}&statecode=${stateName}?1418105765`)
          .then(response => response.text())
          .then((response) => {
            const responseInJson = JSON.parse(xml2json.toJson(response));
            const hasMarkers = (responseInJson && responseInJson.markers.marker.length > 0);
            if ((responseInJson && responseInJson.markers) && hasMarkers) {
              const marker = responseInJson.markers.marker;
              const newFuelPrice = new FuelPrice({
                state: stateObj.name,
                stateCode: stateObj.value,
                result: marker.filter(state => delete state.$t), /* eslint no-param-reassign: 0 */
              });
              newFuelPrice.save((error) => {
                if (error) console.log("Error occurred while saving fuel price data", error);
                console.log(`Fuel prices for ${stateObj.name} is saved.`);
              });
            }
          });
      });
    });
};
