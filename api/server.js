const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const schedule = require("node-schedule");
const compression = require("compression");
const url = require("url");

const port = process.env.PORT || 8000;
const app = express();

// Changing timezone in app level
process.env.TZ = "Asia/Kolkata";

// Get config
const config = require("./config.json");

// Require models
const fuelPriceModel = require("./models/fuelPrice"); /* eslint no-unused-vars:0 */
const notificationsModel = require("./models/notifications"); /* eslint no-unused-vars:0 */
const fuelPriceCrawler = require("./crawler/fuelPrice");

// Connect with mongodb client
mongoose.Promise = global.Promise; // To avoid mongoose promise deprecation msg
mongoose.connect(`${config.mongoDBClientUrl}`, { useMongoClient: true });
const db = mongoose.connection;
db.on("error", console.error.bind("console", "DB connection error:"));

// Get API routes
const routes = require("./routes/index");

// To tell server that use json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// To use compression
app.use(compression());

// Allowing access to all origin
app.use((req, res, next) => {
	if (req.method === "GET") {
		if (url.parse(req.originalUrl).pathname === "/getpayload") {
			res.setHeader("Cache-Control", "no-cache");
		} else {
			res.setHeader("Cache-Control", "public, max-age=21600");
		}
	} else {
		res.setHeader("Cache-Control", "public, max-age=86400");
	}

	if (req.method === "OPTIONS") {
		res.setHeader("Access-Control-Max-Age", "1728000"); // To avoid preflight request everytime
	}

	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Cache-Control");
	next();
});

// Adding the routes
routes(app);

// Listening to port
const server = app.listen(port, () => {
	console.log(`Server is running..`);
	// Fetch fuel price daily at 6AM and store in DB
	schedule.scheduleJob("* 30 8 * * *", () => {
		fuelPriceCrawler.saveToDB();
	});
});

module.exports = server;
