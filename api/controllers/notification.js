const mongoose = require("mongoose");
const config = require("../config.json");
const gcm = require("node-gcm");
const schedule = require("node-schedule");
const isEmpty = require("is-empty");

const Notifications = mongoose.model("notifications");
const FuelPrice = mongoose.model("fuelPrice");

var scheduled = false;

function schedulePushNotification() {
  schedule.scheduleJob("* 40 15 * * *", () => {
    Notifications.find({}, (err, notifications) => {
      notifications.forEach((notification) => {
        if (notification && notification.subscribed && !isEmpty(notification.stateCodes)) {
          FuelPrice.find({ stateCode: Object.keys(notification.stateCodes)[0] }, () => {
            const sender = new gcm.Sender(`${config.gcmApiKey}`); // Add your GCM API key
            const message = new gcm.Message();
            const options = { registrationTokens: [notification.subscriptionId] };
            sender.send(message, options, (error, response) => {
              if (response) {
                scheduled = true;
                console.log("Message sent");
              }
            });
          });
        }
      });
    });
  });
}

exports.subscribePush = (req, res) => {
  if (!req.body || !req.body.endpoint) {
    res.status(400).send({ error: "GCM push endpoint is missing", success: false });
  }

  const temp = req.body.endpoint.split("/send/");
  const registrationTokens = temp[1];
  const sender = new gcm.Sender(`${config.gcmApiKey}`); // Add your GCM API key
  const message = new gcm.Message();

  sender.send(message, { registrationTokens: [registrationTokens] }, (error) => {
    if (error) {
      res.status(400).send({ success: false, error });
    }
    
    const newSubscription = new Notifications({
      subscriptionId: registrationTokens.toString(),
      subscribed: true,
    });

    newSubscription.save((err) => {
      if (err) console.log("Error occurred while saving new subscription", err);
      res.status(200).send({ success: true });
    });
  });
};

exports.unsubscribePush = (req, res) => {
  if (!req.body.subscriptionId) {
    res.status(400).send({ error: "subscriptionId is missing", success: false });
  }

  Notifications.findOneAndRemove({ subscriptionId: req.body.subscriptionId }, (err, state) => {
    if (err) res.send(err);
    res.json({ success: true, subscriptionId: state.subscriptionId });
  });
};

exports.subscribeFuelPush = (req, res) => {
  if (!req.body || !req.body.subscriptionId || !req.body.stateCode) {
    res.status(400).send({ success: false });
  }
  const options = {
    stateCodes: {},
  };
  options.stateCodes[req.body.stateCode] = {
    subscribed: true,
  };
  
  const filter = { subscriptionId: req.body.subscriptionId };
  Notifications.findOneAndUpdate(filter, options, (err, data) => {
    if (err) res.send(err);
    if (data) {
      res.json({ success: true, subscribed: true });
      if (!scheduled) schedulePushNotification();
    } else {
      res.json({ success: false, subscribed: false });
    }
  });
};

exports.unSubscribeFuelPush = (req, res) => {
  if (!req.body || !req.body.subscriptionId || !req.body.stateCode) {
    res.status(400).send({ success: false });
  }
  const options = {
    stateCodes: {},
  };
  options.stateCodes[req.body.stateCode] = {
    subscribed: false,
  };
  const filter = { subscriptionId: req.body.subscriptionId };
  Notifications.findOneAndUpdate(filter, options, (err, data) => {
    if (err) res.send(err);
    if (data) {
      res.json({ success: true, subscribed: false });
    } else {
      res.json({ success: false, subscribed: false });
    }
  });
};

exports.getPushPayload = (req, res) => {
  if (!req.params || !req.query.endpoint) {
    res.status(400).send({ success: false });
  }
  const temp = req.query.endpoint.split("/send/");
  const registrationTokens = temp[temp.length - 1];
  Notifications.find({ subscriptionId: registrationTokens }, (err, data) => {
    if (err) res.send(err);
    if (data && !isEmpty(data) && (!isEmpty(data[0].stateCodes))) {
      FuelPrice.find({ stateCode: Object.keys(data[0].stateCodes)[0] }, (errr, state) => {
        if (errr) res.send(errr);
        if (!isEmpty(state)) {
          const payload = {
            stateName: state[0].state,
            result: state[0].result,
            notification: state[0].notification,
            updated: state[0].updated,
          };
          res.json({ success: true, payload });
        }
      });
    } else {
      res.json({ success: false });
    }
  });
};
