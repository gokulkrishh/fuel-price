import { h, Component } from "preact";
import { Router } from "preact-router";
import localForage from "localforage";

// Custom components
import {toast} from "../lib/toast";
import Intro from "async!./Intro";
import Header from "async!./header";
import BottomBar from "async!./bottombar";
import MyList from "../routes/mylist";
import All from "../routes/all";
import Settings from "../routes/settings";

//localForage config
localForage.config({name: "fuelPrice"});

export default class App extends Component {
	constructor(props) {
		super(props);
		this.listenToEvents = this.listenToEvents.bind(this);
		this.updateNetworkStatus = this.updateNetworkStatus.bind(this);
	}

	componentDidMount() {
		this.listenToEvents();
		const font = document.createElement("link");
		font.rel = "stylesheet";
		font.href = "//fonts.googleapis.com/css?family=Roboto:300,400,500,600";
		document.head.appendChild(font);
	}

	listenToEvents() {
		document.addEventListener("DOMContentLoaded", () => {
      if (!navigator.onLine) {
	      this.updateNetworkStatus(true);
	    }
  	});

		window.addEventListener("offline", () => {
			this.updateNetworkStatus(true);
		});

		window.addEventListener("online", () => {
			this.updateNetworkStatus();
		});
	}

	updateNetworkStatus(offline) {
		if (offline) {
			document.head.querySelector("meta[name=theme-color]").content = "#ccc";
			document.body.classList.add("offline");
			toast("Offline");
		}
		else {
			document.head.querySelector("meta[name=theme-color]").content = "#228de2";
			document.body.classList.remove("offline");
		}
	}

	handleRoute = e => {
		this.currentUrl = e.url;
	};

	render() {
		return (
			<div id="app">
				<Intro />
				<Header />
				<Router onChange={this.handleRoute}>
					<MyList path="/" />
					<All path="/all" />
					<Settings path="/settings" />
				</Router>
				<BottomBar />
				<div class="toast"></div>
			</div>
		);
	}
}
