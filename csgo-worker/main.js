const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
const PORT = 3000;
const Steam = require("steam"),
	steamClient = new Steam.SteamClient(),
	steamUser = new Steam.SteamUser(steamClient),
	steamFriends = new Steam.SteamFriends(steamClient),
	steamGC = new Steam.SteamGameCoordinator(steamClient, 730),
	csgo = require("csgo"),
	CSGO = new csgo.CSGOClient(steamUser, steamGC, true);

steamClient.connect();
steamClient.on("connected", function() {
	steamUser.logOn({
		account_name: "nextinen",
		password: "Paskanakki123",
	});
});
steamClient.on("logOnResponse", function() {
	console.log("Logged in!");
	CSGO.launch();
});
CSGO.on("ready", function handler() {
	console.log("Ready!");
});
app.get("/api/gamedata", async (req, res) => {
	if (!req.body.id) {
		return res.status(400).json({
			status: "error",
			error: "req body can't be empty",
		});
	}
	CSGO.matchmakingStatsRequest();
	try {
		CSGO.on("matchmakingStatsData", function helou(data) {
			res.send(data);
		});
	}
	catch (error) {
		console.log(error);
		res.send("Failed.");
	}
});


app.listen(PORT, () => {
	console.log(`App listening at .${PORT}`);
});