import { h, Component } from "preact";
import localForage from "localforage";
import {isPushSupported, isPushSubscribed, subscribePush, unsubscribePush} from "../../lib/push";
import style from "./style";

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isPushSupported: isPushSupported(),
      isPushSubscribed: false
    };

    this.pushToggleBtn = null;
    this.togglePushSubscription = this.togglePushSubscription.bind(this);
    this.checkForPushSubscription = this.checkForPushSubscription.bind(this);
  }

  componentDidMount() {
    this.pushToggleBtn = document.getElementById("push-settings");
    this.checkForPushSubscription();
  }

  checkForPushSubscription() {
    const {isPushSubscribed} = this.state;
    if ("serviceWorker" in navigator && !isPushSubscribed) {
      navigator.serviceWorker.ready
        .then(registration => registration.pushManager.getSubscription()
          .then(subscription => {
            if (subscription) {
              this.setState({isPushSubscribed: true});
            }
          })
          .catch(error => {
            console.error("Error occurred while enabling push notification", error);
          })
        );
    }
    else {
      this.setState({isPushSubscribed: false});
    }
  }

  htmlSwitchInput() {
    const {isPushSubscribed} = this.state;
    return (
      <div class="toggle__container">
        <input type="checkbox" id="push-settings" checked={isPushSubscribed}/>
        <label for="push-settings" onClick={this.togglePushSubscription}></label>
      </div>
    );
  }

  togglePushSubscription() {
    const {isPushSupported, isPushSubscribed} = this.state;
    if (isPushSupported) {
      new Promise((resolve, reject) => {
        if (!isPushSubscribed) {
          subscribePush(resolve, reject);
        }
        else {
          unsubscribePush(resolve, reject);
        }
      }).then(subscriptionId => {
        if (subscriptionId) {
          localForage.setItem("notifications", {subscriptionId: subscriptionId});
          this.setState({
            isPushSubscribed: true,
            subscriptionId
          });
        }
        else {
          this.removeSubscription();
        }
      }).catch(error => {
        this.removeSubscription();
      });
    }
  }

  removeSubscription() {
    this.setState({
      isPushSubscribed: false
    });
  }

  htmlPushSettings() {
    const {isPushSupported} = this.state;
    if (!isPushSupported) return <div/>;
    return (
      <div class={style.settings__container} id="push-settings-container">
        <h3>Notification settings</h3>
        <div class="push__container">
          <p>Push notifications</p>
          {this.htmlSwitchInput()}
        </div>
      </div>
    );
  }

	render() {
    return (
    	<div class={style.settings}>
				{this.htmlPushSettings()}
        <div class={style.settings__container}>
          <h3>About</h3>
          <div>
            <a href="https://github.com/gokulkrishh/fuel-price" target="_blank">Source</a>
          </div>
          <div>
            <a href="https://github.com/gokulkrishh" target="_blank">Author</a>
          </div>
        </div>
      </div>
		);
	}
}
