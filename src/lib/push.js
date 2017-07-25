/*
  Library: push.js
  Source: https://github.com/gokulkrishh/demo-progressive-web-app
  Author: https://github.com/gokulkrishh
*/

import localForage from "localforage";
import {toast} from "./toast";
import config from "../config.json";

export function isPushSupported() {
  // To check push notification is denied by user or not
  if ("Notification" in window && Notification && Notification.permission === "denied") {
    console.error("User has blocked the push notifications.");
    return false;
  }

  // Check push notification is supported?
  if (!("PushManager" in window)) {
    console.error("Push notifications is not supported in your browser.");
    return false;
  }

  return true;
}

export function isPushSubscribed() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
    .then(registration => registration.pushManager.getSubscription()
      .then(subscription => {
        if (subscription) {
          return true
        }
      })
      .catch(error => {
				console.error("Error occurred while enabling push notification", error);
				toast("Unable to register push notification");
      })
    );
  }
  else {
    return false;
  }
}

//To subscribe push notification
export function subscribePush(promiseResolve, promiseReject) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      if (!registration.pushManager) {
        console.error("Your browser doesn\'t support push notification");
        promiseReject();
        return false;
			}

			toast(`Loading...`, 3000);

      //To subscribe push notification from push manager
      registration.pushManager.subscribe({userVisibleOnly: true}).then((subscription) => {
        let subscriptionId = subscription.endpoint.split("/send/")[1];
        fetch(`${config.apiUrl}/subscribe`, {
					method: "post",
					mode: "cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(subscription)
        })
        .then(response => response.json())
        .then(function(response) {
          if (response && !!response.success) {
            promiseResolve(subscriptionId);
            toast("Push notifications is turned on");
          }
          else {
            promiseReject();
          }
        })
        .catch((error) => {
          console.error("Push notification subscription error ", error);
          toast("Unable to register push notification");
          promiseReject();
        });
      })
      .catch((error) => {
        console.error("Push notification subscription error ", error);
        toast("Unable to register push notification");
        promiseReject();
      });
    })
  }
}

//To unsubscribe push notification
export function unsubscribePush(promiseResolve, promiseReject) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(registration => {
        //Get push subscription
        registration.pushManager.getSubscription().then(subscription => {
          //If no push subscription, then return
          if(!subscription) {
            promiseReject();
            return false;
					}

          //Unsubscribe push notification
          subscription.unsubscribe()
            .then(subscription => {
              const formData = new FormData();
              localForage.getItem("notifications").then(notification => {
                fetch(`${config.apiUrl}/unsubscribe`, {
                  method: "post",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(notification)
                })
                .then(response => response.json())
                .then(function(response) {
                  if (response && !!response.success) {
                    localForage.getItem("myList").then(myList => {
                      for (let state in myList) {
                        myList[state].pushNotification = false;
                      }
                      localForage.setItem("myList", myList);
                    });
                    promiseResolve();
                    localForage.removeItem("notifications");
                  }
                })
              }).catch((error) => {
                console.error(error);
                promiseReject();
              });
            })
            .catch((error) => {
              promiseReject();
            });
        })
        .catch(error => {
          promiseReject();
          toast("Failed to unsubscribe push notifications");
        });
    })
  }
}
