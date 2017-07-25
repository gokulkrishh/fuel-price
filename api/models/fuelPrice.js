const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FuelPriceSchema = new Schema({
  state: {
    type: String,
  },
  stateCode: {
    type: String,
  },
  result: {
    type: Array,
  },
  notification: {
    type: Boolean,
    default: false,
  },
  updated: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("fuelPrice", FuelPriceSchema);
