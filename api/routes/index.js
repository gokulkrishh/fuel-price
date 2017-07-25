const fuelPrice = require("../controllers/fuelPrice");
const notification = require("../controllers/notification");
  
module.exports = (app) => {
  app.get("/", (req, res) => {
    res.send("Welcome to fuel price API.");
  });

  app.route("/fuelprice/all")
    .get(fuelPrice.getAll);

  app.route("/fuelprice/:stateCode")
    .get(fuelPrice.getByState);

  app.route("/location")
    .get(fuelPrice.getCurrentCity);

  app.route("/subscribe")
    .post(notification.subscribePush);

  app.route("/unsubscribe")
    .post(notification.unsubscribePush);

  app.route("/getpayload")
    .get(notification.getPushPayload);

  app.route("/fuel/subscribe")
    .post(notification.subscribeFuelPush);

  app.route("/fuel/unsubscribe")
    .post(notification.unSubscribeFuelPush);
};
