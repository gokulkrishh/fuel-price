const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NotificationsSchema = new Schema({
  subscriptionId: {
    type: String,
  },
  stateCodes: {
    type: Object,
  },
  subscribed: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("notifications", NotificationsSchema);
