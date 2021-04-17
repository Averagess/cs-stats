/* eslint-disable indent */
const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const rp = require("request-promise");
const { waitFor } = require("wait-for-event");

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
	steamFriends = new Steam.SteamFriends(steamClient),

	csgo = require("csgo"),
	CSGO = new csgo.CSGOClient(steamUser, steamGC, true);


steamClient.connect();
steamClient.on("connected", function() {
	steamUser.logOn({
		account_name: "nextinen",
		password: "Paskanakki123",
		two_factor_code: process.argv[2],
	});
});

steamFriends.on("friend", async (steamid, res) => {
	// 3 = Hyväksytty
	// 2 = Uusi ystäväpyyntä
	// 0 = Poistettu
	if (res == 3 || res == 2) {
		if (res == 3) {
			await waitFor("ready", CSGO);
		}
		else if (res == 2) {
			console.log(`Received an friend request from ${steamid} while online`);
			await steamFriends.addFriend(steamid);
		}
		console.log(`Succesfully added ${steamid} to friends`);
		const qString = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=A46EE240150FDB461D92C711B23C66BF&steamids=${steamid}`;
		rp(qString)
		.then(steamRes => {
			const obj = JSON.parse(steamRes);
			const steamPersonaName = obj.response.players[0].personaname;
			const accountid = CSGO.ToAccountID(steamid);
			CSGO.playerProfileRequest(accountid);
			CSGO.on("playerProfile", function playerProfileHandler(profile) {
				// console.log(typeof profile);
				// console.log(profile.account_profiles[0]);
				const commendations = profile.account_profiles[0].commendation;
				const mmRankId = profile.account_profiles[0].ranking.rank_id;
				const mmWins = profile.account_profiles[0].ranking.wins;
				const playerLevel = profile.account_profiles[0].player_level;
				const playerCurExp = profile.account_profiles[0].player_cur_xp;
				const mmRank = CSGO.Rank.getString(mmRankId);
				const payload = {
					"steamid64": steamid,
					"steamPersonaName":steamPersonaName,
					"rankString": mmRank,
					"rankId":mmRankId,
					"wins": mmWins,
					"playerLevel":playerLevel,
					"playerCurExp":playerCurExp,
					"commendations":commendations,
				};
				steamFriends.removeFriend(steamid);
				rp.post("http://localhost:3000/api/testing", { json: payload })
				.then("Succesfully forwarded data to update!!").catch(err => console.log("error: " + err));
				CSGO.removeAllListeners();
			});
		});
		return;
	}
	// if (res == 2) {
	// 	steamFriends.addFriend(steamid);
	// 	console.log(`Adding ${steamid} to friends`);
	// 	return;
	// }
	if (res == 0) {
		console.log(`${steamid} removed me from friends`);
		return;
	}
	console.log(res);
	},
);
steamFriends.on("relationships", () => {
	Object.keys(steamFriends.friends).forEach(key => {
		if (steamFriends.friends[key] == 2) {
			console.log(`Received an Friends request from: ${key} while offline, Accepting..`);
			steamFriends.addFriend(key);
		}
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
	console.log("CS:GO Client unready");
});

app.post("/api/prefixCount", async (req, res) => {
	const database = mongoClient.db("DiscordData");
	const collection = database.collection("discord");
	const query = { "prefixUsedCount": { $exists: true } };
	collection.updateOne(query,
		{ $inc: { "prefixUsedCount": 1 } },
	(err) => {
		if (err) {console.log("error", err);}
		else {
			res.status(200).send("OK!");
		}
	});
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

app.get("/api/getRank", async (req, res) => {
	if (!req.body) {
		return res.status(500).send("Request body empty");
	}
	else if (!req.body.steamID) {
		return res.status(500).send("Invalid Request");
	}
	// REQ BODY steamID
	const database = mongoClient.db("DiscordData");
	const collection = database.collection("ranks");
	const query = { "steamid64": req.body.steamID };
	const find = await collection.findOne(query);
	if (find == null) {
		res.status(200).send("No stats for were found for this account");
	}
	else {
		res.status(200).send(find);
	}
});

app.post("/api/testing", async (req, res) => {
	console.log("Testing POST Request received");
	const database = mongoClient.db("DiscordData");
	const collection = database.collection("ranks");
	const query = { "steamid64": req.body.steamid64 };
	const options = {
		// sort matched documents in descending order by rating
		sort: { rating: -1 },
		// Include only the `_id` and `steamid64` fields in the returned document
		projection: { _id: 1, "steamid64": 1 },
	};
	const find = await collection.findOne(query, options);
	if (find == null) {
		// Insert Document
		const date = new Date();
		const doc = {
			steamid64:req.body.steamid64,
			steamPersonaName:req.body.steamPersonaName,
			"rankString":req.body.rankString,
			"rankId":req.body.rankId,
			"wins": req.body.wins,
			"playerLevel":req.body.playerLevel,
			"playerCurExp":req.body.playerCurExp,
			"commendation":req.body.commendations,
			lastUpdate: date,
			};
		const result = await collection.insertOne(doc);
		console.log(`${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`);
	}
	else {
		// Update
		const date = new Date();
		const updateDoc = {
			$set:{ 	steamid64:req.body.steamid64,
					steamPersonaName:req.body.steamPersonaName,
					"rankString":req.body.rankString,
					"rankId":req.body.rankId,
					"wins": req.body.wins,
					"playerLevel":req.body.playerLevel,
					"playerCurExp":req.body.playerCurExp,
					"commendation":req.body.commendations,
					lastUpdate: date },
		};
		const result = await collection.updateOne(find, updateDoc);
		console.log(`Updated ${result.modifiedCount} Docs`);
	}
	res.status(200).send("OK");
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
		CSGO.exit(console.log("CS:GO disconnected on app termination"));
		steamClient.disconnect(console.log("Steam disconnected on app termination"));
		process.exit(0);
	});
});

app.listen(PORT, () => {
	console.log(`App listening at .${PORT}`);
});