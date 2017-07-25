
function getEndpoint() {
  return self.registration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.endpoint;
    }

    throw new Error('User not subscribed');
  });
}

self.addEventListener("push", (event) => {
  console.log("Event: Push", event);
  event.waitUntil(
    getEndpoint().then(endpoint => {
      return fetch(`https://worried-food.glitch.me//getpayload?endpoint=${endpoint}`, {cache: "no-cache"})
    })
    .then(response => response.json())
    .then(response => {
      if (response && !!response.success) {
        var title = "Fuel Price";
        var body = {
          "body": `Fuel price for ${response.payload.stateName} is updated` || "click to return to application",
          "tag": "Today's Fuel Price",
          "icon": "./assets/notification/notification-icon.png",
          "badge": "./assets/notification/notification-badge-icon.png",
          "vibrate": 1,
          "actions": [
            { "action": "yes", "title": "Useful 👍"},
            { "action": "no", "title": "Not Useful 👎"}
          ]
        };
        self.clients.matchAll().then((all) => {
          return all.map((client) => {
            return client.postMessage("fromPush");
          })
        })
        .catch((error) => {
          console.error(error);
        });
        self.registration.showNotification(title, body);
      }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  var url = "http://localhost:8080";
  var url = "https://fp.surge.sh";

  //Listen to custom action buttons in push notification
  if (event.action === 'yes') {
    console.log('Useful 👍');
  }
  else if (event.action === 'no') {
    console.warn('Not Useful 👎');
  }

  event.notification.close(); //Close the notification

  //To open the app after clicking notification
  event.waitUntil(
    clients.openWindow(url)
  );
});
