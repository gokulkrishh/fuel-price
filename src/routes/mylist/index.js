import { h, Component } from "preact";
import localForage from "localforage";
import { formateDate, isEmpty, sort } from "../../lib/util";
import { isPushSupported, subscribePush } from "../../lib/push";
import { toast } from "../../lib/toast";
import noListImg from "../../assets/no-list.svg";
import style from "./style";
import config from "../../config.json";

export default class MyList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isPushSupported: isPushSupported(),
			firstTimeVisit: localStorage.getItem("firstTimeVisit"),
			showEmptyMsg: false,
			myList: {}
		};
		this.mounted = false;
		this.removeCityFromMyList = this.removeCityFromMyList.bind(this);
		this.togglePushSubscription = this.togglePushSubscription.bind(this);
		this.getMyListFuelPrices = this.getMyListFuelPrices.bind(this);
		this.removeMsgChannelListener();
	}

	componentDidMount() {
		const { myList, firstTimeVisit } = this.state;
		if (isEmpty(myList) && !firstTimeVisit) {
			this.fetchCurrentLocation();
		}
		this.getMyFavList();
		this.addMsgChannelListener();
	}

	componentWillUnmount() {
		this.removeMsgChannelListener();
	}

	removeMsgChannelListener() {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.removeEventListener("message", this.getMyListFuelPrices);
		}
	}

	addMsgChannelListener() {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.addEventListener("message", this.getMyListFuelPrices);
		}
	}

	getMyFavList() {
		let { myList } = this.state;
		var showEmptyMsg = false;
		localForage.getItem("myList").then(myList => {
			if (!myList || isEmpty(myList)) {
				myList = {};
				showEmptyMsg = true;
			} else {
				this.getMyListFuelPrices();
			}
			this.setState({ myList, showEmptyMsg });
		});
	}

	getMyListFuelPrices() {
		const { myList } = this.state;
		if (!isEmpty(myList)) {
			Object.keys(myList).map(stateCode => {
				this.fetchCurrentStateFuel(stateCode, true);
			});
		}
	}

	fetchCurrentLocation() {
		fetch(`${config.geoApiUrl}`)
			.then(response => response.json())
			.then(data => {
				if (!isEmpty(data)) {
					let { country_name, region_name } = data;
					if (country_name === "India" && region_name !== "") {
						this.fetchCurrentStateFuel(region_name, false);
					} else {
						this.setState({
							myList: {},
							showEmptyMsg: true
						});
					}
				}
			});
	}

	fetchCurrentStateFuel(regionName, fromPush) {
		let { myList } = this.state;
		if (!myList) {
			myList = {};
		}
		const options = {};
		if (fromPush) {
			options.headers = {
				"cache-control": "no-cache"
			};
			toast(`Fetching data please wait...`, 3000);
		}

		fetch(`${config.apiUrl}/fuelprice/${regionName}`, options)
			.then(response => response.json())
			.then(response => {
				const [newResponse] = response;
				if (newResponse && !isEmpty(newResponse)) {
					if (!myList[newResponse.location]) {
						myList[newResponse.location] = newResponse;
						this.setState({ myList, showEmptyMsg: false }, () => {
							localForage.setItem("myList", myList);
							toast(`${newResponse.state} is added to your list`, 3000);
						});
					} else {
						this.updateMyList(myList, newResponse);
					}
				}
			})
			.catch(error => {
				toast(`Error occurred while adding to your list`, 3000);
				console.error(error);
			});
	}

	updateMyList(myList, response) {
		if (myList[response.stateCode]) {
			const existingList = myList[response.stateCode];
			existingList.updated = response.updated;
			response.result.filter(place => {
				existingList.result.forEach(existingPlace => {
					if (existingPlace.townname === place.townname) {
						if (existingPlace.hsd !== place.hsd || existingPlace.ms !== place.ms) {
							existingPlace.hsd = place.hsd;
							existingPlace.ms = place.ms;
						}
					}
				});
			});
			this.setState({ myList }, () => {
				localForage.setItem("myList", myList);
				toast(`Fuel prices are updated`, 4000);
			});
		}
	}

	htmlCards(data, stateCode) {
		return (
			<div class="cards">
				<h3>
					{data.district.toLowerCase()} {this.htmlRemoveIcon(data.district, data.stateCode)}
				</h3>
				<div>
					<b>Petrol</b>: ₹ <span>{data.petrol}</span>
				</div>
				<div>
					<b>Diesel</b>: ₹ <span>{data.diesel}</span>
				</div>
			</div>
		);
	}

	htmlRemoveIcon(district, stateCode) {
		return (
			<span class="cards__actions">
				<i onClick={this.removeCityFromMyList.bind(this, district, stateCode)} />
			</span>
		);
	}

	removeCityFromMyList(district, stateCode) {
		const { myList } = this.state;
		if (!isEmpty(myList) && (district && stateCode)) {
			const currentState = myList[stateCode];
			currentState.result = currentState.result.filter(state => state.district !== district);
			if (currentState.result.length === 0) {
				this.removeFromMyList(stateCode);
			} else {
				this.setState({ myList }, () => {
					localForage.setItem("myList", myList);
					toast(`${district} is removed from your list`);
				});
			}
		}
	}

	removeFromMyList(stateCode) {
		const { myList } = this.state;
		if (!isEmpty(myList)) {
			if (myList[stateCode] && myList[stateCode].pushNotification) {
				this.togglePushSubscription("", stateCode, true);
			} else {
				this.removeDataFromList(stateCode);
			}
		}
	}

	removeDataFromList(stateCode) {
		const { myList } = this.state;
		var showEmptyMsg = false;
		var deletedState = myList[stateCode];
		delete myList[stateCode];
		if (isEmpty(myList)) showEmptyMsg = true;
		this.setState({ myList, showEmptyMsg }, () => {
			localForage.setItem("myList", myList);
			toast(`${deletedState.state} is removed from your list`);
		});
	}

	togglePushSubscription(type, stateCode, removeData) {
		const { myList } = this.state;
		localForage.getItem("notifications").then(notificationToken => {
			if (!isEmpty(myList) && (notificationToken && !isEmpty(notificationToken))) {
				toast(`Loading...`);
				const currentState = myList[stateCode];
				var url = `${config.apiUrl}/fuel`;
				if (type === "Subscribe") {
					url += "/subscribe";
				} else {
					url += "/unsubscribe";
				}

				var data = {
					stateCode,
					subscriptionId: notificationToken.subscriptionId
				};

				const options = {
					method: "post",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(data)
				};
				fetch(`${url}/`, options)
					.then(response => response.json())
					.then(response => {
						if (response && !!response.success && !!response.subscribed) {
							currentState.pushNotification = true;
						} else {
							currentState.pushNotification = false;
						}

						if (type === "" && removeData) {
							this.removeDataFromList(currentState.stateCode);
						} else {
							this.setState({ myList }, () => {
								localForage.setItem("myList", myList);
								toast(`${type}d notification for ${currentState.state}`);
							});
						}
					})
					.catch(error => {
						toast(`Failed to ${type} notification for ${currentState.state}`);
					});
			} else {
				new Promise((resolve, reject) => {
					subscribePush(resolve, reject);
				})
					.then(subscriptionId => {
						if (subscriptionId) {
							localForage.setItem("notifications", { subscriptionId: subscriptionId });
							this.setState(
								{
									isPushSubscribed: true,
									subscriptionId
								},
								() => {
									this.togglePushSubscription(type, stateCode, removeData);
								}
							);
						}
					})
					.catch(error => {
						console.error(error);
					});
			}
		});
	}

	htmlPushSubIcon(data) {
		return (
			<span class="add-to-card push">
				{data.pushNotification ? (
					<svg
						fill="#4A4A4A"
						height="24"
						viewBox="0 0 24 24"
						width="24"
						onClick={this.togglePushSubscription.bind(this, "Unsubscribe", data.state)}
					>
						<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
					</svg>
				) : (
					<svg
						title="Click to subscribe push notification"
						fill="#ccc"
						height="24"
						viewBox="0 0 24 24"
						width="24"
						onClick={this.togglePushSubscription.bind(this, "Subscribe", data.state)}
					>
						<path d="M20 18.69L7.84 6.14 5.27 3.49 4 4.76l2.8 2.8v.01c-.52.99-.8 2.16-.8 3.42v5l-2 2v1h13.73l2 2L21 19.72l-1-1.03zM12 22c1.11 0 2-.89 2-2h-4c0 1.11.89 2 2 2zm6-7.32V11c0-3.08-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-.15.03-.29.08-.42.12-.1.03-.2.07-.3.11h-.01c-.01 0-.01 0-.02.01-.23.09-.46.2-.68.31 0 0-.01 0-.01.01L18 14.68z" />
					</svg>
				)}
			</span>
		);
	}

	htmlFavIcon(data) {
		return (
			<div class="add-to-card" onClick={this.removeFromMyList.bind(this, data.state.toLowerCase())}>
				<svg fill="#4A4A4A" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
					<path d="M0 0h24v24H0z" fill="none" />
					<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
				</svg>
			</div>
		);
	}

	htmlRefreshButton() {
		return (
			<div class="add-to-card refresh--btn" onClick={this.getMyListFuelPrices}>
				<svg fill="#fff" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
					<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
					<path d="M0 0h24v24H0z" fill="none" />
				</svg>
			</div>
		);
	}

	htmlCardContainer(data) {
		const { isPushSupported } = this.state;
		if (!data) return;
		return Object.keys(data)
			.sort()
			.map(state => {
				data[state].result = sort(data[state].result, "district");
				return (
					<div class="cards__container">
						<div class="cards__header">
							<h3>{data[state].state}</h3>
							{this.htmlFavIcon(data[state])}
							{isPushSupported && this.htmlPushSubIcon(data[state])}
							<div class="cards__info">
								<p>{formateDate(data[state].updated)}</p>
							</div>
						</div>
						<div class="cards__list">
							{data[state].result.map(result => {
								return this.htmlCards(result, data[state].stateCode);
							})}
						</div>
					</div>
				);
			});
	}

	render() {
		const { myList, showEmptyMsg } = this.state;
		if (isEmpty(myList) && showEmptyMsg) {
			return (
				<div class={style.mylist__empty}>
					<i />
					<h4>Your list is empty</h4>
					<p>Go to all list page to add some.</p>
				</div>
			);
		}
		return (
			<div class={style.mylist}>
				{this.htmlCardContainer(myList)}
				{this.htmlRefreshButton()}
			</div>
		);
	}
}
