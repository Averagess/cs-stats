/* eslint-disable indent */
const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const app = express();

const uri = "mongodb+srv://Ricksaw:CSGObotti123@ricksaw.w550y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
const PORT = 3000;
mongoClient.connect().catch(reason => `MongoDB ERROR: ${reason} `);

const Steam = require("steam"),
	steamClient = new Steam.SteamClient(),
	steamUser = new Steam.SteamUser(steamClient),
	steamGC = new Steam.SteamGameCoordinator(steamClient, 730),
	// steamFriends = new Steam.SteamFriends(steamClient),

	csgo = require("csgo"),
	CSGO = new csgo.CSGOClient(steamUser, steamGC, true);


steamClient.connect();
steamClient.on("connected", function() {
	steamUser.logOn({
		account_name: "nextinen",
		password: "Paskanakki123",
		// two_factor_code: process.argv[2],
	});
});

steamClient.on("error", (err) => {
	console.log(err);
});

// steamClient.once("logOnResponse", function onSteamLogOn(res) {
// 	if(res.eresult == Steam.EResult.OK) {
// 		steamFriends.setPersonaState(Steam.EPersonaState.Online);
// 	}
// 	// CSGO.launch();
// });

steamClient.on("logOnResponse", function(res) {
	if (res.eresult == Steam.EResult.OK) {
		console.log("Succesful Login");
	}
	else {console.log("error", res); return;}
	// to display your bot's status as "Online"
	// steamFriends.setPersonaState(Steam.EPersonaState.Online);
	CSGO.launch();
});
CSGO.on("ready", function onReady() {
	console.log("CSGO Client ready");
	// CSGO.richPresenceUpload({
		// RP: {
		// 	// Sets rich presence text to "Hello World!"
		// 	status: "Hello World!",
		// 	// Not sure what this value does
		// 	version: 13508,
		// 	// This might be the amount of time since you have started the game, not sure.
		// 	time: 161.164087,
		// 	"game:state": "lobby",
		// 	steam_display: "#display_Lobby",
		// 	connect: "+gcconnectG082AA752",
		// 	"game:mode": "casual",
		// },
	// });
});
CSGO.on("unready", function OnUnready() {
	console.log("CSGO Client unready");
});


app.post("/api/data", async (req, res) => {
	if (!req.body.command) {
		return res.status(400).json({
			status: "error",
			error: "req body can't be empty",
		});
	}
	async function commandRan(command) {
		// try {
		// await mongoClient.connect();
		// const options = { upsert : true };
		const database = mongoClient.db("DiscordData");
		const collection = database.collection("discord");
		if (command === "stats") {
			const query = { "statsUsedCount": { $exists: true } };
			await collection.updateOne(query,
				{ $inc: { "statsUsedCount": 1 } },
			);
		}
		else if (command === "profile") {
			const query = { "profileUsedCount": { $exists: true } };
			await collection.updateOne(query,
				{ $inc: { "profileUsedCount": 1 } },
			);
		}
		else if (command === "steamid") {
			const query = { "steamidUsedCount": { $exists: true } };
			await collection.updateOne(query,
				{ $inc: { "steamidUsedCount": 1 } },
			);
		}
		else if (command === "mm-stats") {
			const query = { "mm-statsUsedCount": { $exists: true } };
			await collection.updateOne(query,
				{ $inc: { "mm-statsUsedCount": 1 } },
			);
		}
	}
	// finally {await mongoClient.close();}
	// }
	commandRan(req.body.command).catch(console.dir);
	res.send("OK!");
});

app.get("/api/getRank", (req, res) => {
	if (!req.body) {
		return res.status(500).send("Request body empty");
	}
	else if (!req.body.steamID) {
		return res.status(500).send("Invalid Request");
	}
	const id = CSGO.ToAccountID(req.body.steamID);
	CSGO.playerProfileRequest(id);
	CSGO.on("playerProfile", function playerProfileHandler(profile) {
		// console.log(typeof profile);
		// console.log(profile.account_profiles[0]);
		res.send(JSON.stringify(profile));
		res.status(200);
		CSGO.removeAllListeners();
	});
});

app.get("/api/getMatchmaking", (req, res) => {
	console.log("Received Matchmaking Request");
	CSGO.matchmakingStatsRequest();
	CSGO.on("matchmakingStatsData", function onMatchmakingStats(stats) {
		res.send(JSON.stringify(stats));
		res.status(200);
		CSGO.removeAllListeners();
	});
});

process.on("SIGINT", function() {
	mongoClient.close(function() {
		console.log("MongoDB disconnected on app termination");
		CSGO.exit(console.log("CSGO disconnected on app termination"));
		steamClient.disconnect(console.log("Steam disconnected on app termination"));
		process.exit(0);
	});
});

app.listen(PORT, () => {
	console.log(`App listening at .${PORT}`);
});