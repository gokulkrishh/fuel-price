import { h, Component } from "preact";
import localForage from "localforage";
import { isPushSupported } from "../../lib/push";
import { toast } from "../../lib/toast";
import { sort, formateDate } from "../../lib/util";
import style from "./style";
import config from "../../config.json";

export default class All extends Component {
	constructor(props) {
		super(props);
		const isAddedToMyFav = [];
		this.state = {
			allList: [],
			isAddedToMyFav: []
		};
		this.addToFav = this.addToFav.bind(this);
		this.getAllFuelPrices = this.getAllFuelPrices.bind(this);
		this.removeMsgChannelListener();
	}

	componentDidMount() {
		isPushSupported();
		this.getAllFuelPrices();
		this.addMsgChannelListener();
	}

	componentWillUnMount() {
		this.removeMsgChannelListener();
	}

	removeMsgChannelListener() {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.removeEventListener("message", this.getAllFuelPrices.bind(this, true));
		}
	}

	addMsgChannelListener() {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.addEventListener("message", this.getAllFuelPrices.bind(this, true));
		}
	}

	getAllFuelPrices(fromPush) {
		const options = {};
		if (fromPush) {
			options.headers = {
				"cache-control": "no-cache"
			};
			toast(`Fetching data please wait...`, 3000);
		}
		fetch(`${config.apiUrl}/fuelprice/all`, options)
			.then(response => response.json())
			.then(data => {
				const sortedData = sort(data, "state");
				if (sortedData && sortedData.length > 0) {
					this.setState({ allList: sortedData }, () => {
						if (fromPush) toast(`Fuel prices are updated`, 3000);
						this.getMyFavList();
					});
				}
			});
	}

	getMyFavList() {
		localForage.getItem("myList").then(myList => {
			const isAddedToMyFav = [];
			for (let myFav in myList) {
				isAddedToMyFav.push(myFav);
			}
			this.setState({ isAddedToMyFav });
		});
	}

	addToFav(data) {
		const { isAddedToMyFav } = this.state;
		localForage.getItem("myList").then(myList => {
			const stateName = data.state.toLowerCase();
			if (!myList) {
				const obj = {};
				obj[stateName] = data;
				localForage.setItem("myList", obj);
				isAddedToMyFav.push(stateName);
				this.setState({ isAddedToMyFav }, () => {
					toast(`${data.state} is added to your list`);
				});
			} else if (myList[stateName]) {
				delete myList[stateName];
				localForage.setItem("myList", myList);
				isAddedToMyFav.splice(isAddedToMyFav.indexOf(stateName), 1);
				this.setState({ isAddedToMyFav }, () => {
					toast(`${data.state} is removed from your list`);
				});
			} else {
				myList[stateName] = data;
				localForage.setItem("myList", myList);
				isAddedToMyFav.push(stateName);
				this.setState({ isAddedToMyFav }, () => {
					toast(`${data.state} is added to your list`);
				});
			}
		});
	}

	htmlSwitchInput(data) {
		const { isAddedToMyFav } = this.state;
		const stateName = data && data.state.toLowerCase();
		return (
			<div class="add-to-card">
				{isAddedToMyFav.indexOf(stateName) > -1 ? (
					<div data-state={data.state} onClick={this.addToFav.bind(this, data)}>
						<svg fill="#4A4A4A" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
							<path d="M0 0h24v24H0z" fill="none" />
							<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
						</svg>
					</div>
				) : (
					<div data-state={data.state} onClick={this.addToFav.bind(this, data)}>
						<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
							<path d="M0 0h24v24H0z" fill="none" />
							<path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
						</svg>
					</div>
				)}
			</div>
		);
	}

	htmlRefreshButton() {
		return (
			<div class="add-to-card refresh--btn" onClick={this.getAllFuelPrices.bind(this, true)}>
				<svg fill="#fff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
					<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
					<path d="M0 0h24v24H0z" fill="none" />
				</svg>
			</div>
		);
	}

	htmlCards(result) {
		return (
			<div class="cards">
				<h3>{result.district.toLowerCase()}</h3>
				<div>
					<b>Petrol</b>: ₹ <span>{result.petrol}</span>
				</div>
				<div>
					<b>Diesel</b>: ₹ <span>{result.diesel}</span>
				</div>
			</div>
		);
	}

	htmlCardsContainer(data) {
		return data.map(state => {
			state.result = sort(state.result, "district");
			return (
				<div class="cards__container">
					<div class="cards__header">
						<h3>{state.state}</h3>
						{this.htmlSwitchInput(state)}
						<div class="cards__info">
							<p>{formateDate(state.updated)}</p>
						</div>
					</div>
					<div class="cards__list">
						{state.result.map(result => {
							return this.htmlCards(result);
						})}
					</div>
				</div>
			);
		});
	}

	render() {
		const { allList } = this.state;
		if (allList && allList.length === 0) {
			return (
				<div class={style.all}>
					<div class="cards__container loading__container">
						<h3>Loading...</h3>
						<div class="cards__list">
							<div class="cards loading" />
							<div class="cards loading" />
						</div>
					</div>
				</div>
			);
		}

		return (
			<div class={style.all}>
				{this.htmlCardsContainer(allList)}
				{this.htmlRefreshButton()}
			</div>
		);
	}
}
