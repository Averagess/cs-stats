/* eslint-disable max-nested-callbacks */
/* eslint-disable indent */
const { MongoClient } = require("mongodb");
const express = require("express");
const bodyParser = require("body-parser");
const rp = require("request-promise");
const dotenv = require("dotenv");
const fs = require("fs");
const readline = require("readline");
const winston = require ("winston");
const moment = require("moment");
const { waitFor } = require("wait-for-event");
const { time } = require("../modules/modules");
const { combine, timestamp, printf, prettyPrint, metadata, colorize } = winston.format;
dotenv.config();

process.env.TZ = "Europe/Helsinki";
const app = express();
app.use(bodyParser.json());


const logFormat = printf(info => `[${info.timestamp}] [${info.level}] ${info.message}`);
const logger = winston.createLogger({
	format: combine(
		timestamp(),
		prettyPrint(),
		metadata({ fillExcept: ["message", "level", "timestamp"] }),
	),
	transports: [
	new winston.transports.Console({
		format: combine(
			colorize(),
			logFormat,
		),
	}),
	new winston.transports.File({ filename: "combined.log" }),
	],
  });

const uri = process.env.MONGOURI;
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const PORT = 3000;
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

let logInTime;
const Steam = require("steam"),
	steamClient = new Steam.SteamClient(),
	steamUser = new Steam.SteamUser(steamClient),
	steamGC = new Steam.SteamGameCoordinator(steamClient, 730),
	steamFriends = new Steam.SteamFriends(steamClient),
	csgo = require("csgo"),
	CSGO = new csgo.CSGOClient(steamUser, steamGC, true);

if (fs.existsSync("steamServers.json")) {
	Steam.servers = JSON.parse(fs.readFileSync("steamServers.json", "utf8"));
}

steamClient.connect();
steamClient.on("connected", function() {
	steamUser.logOn({
		account_name: process.env.STEAMUSERNAME,
		password: process.env.STEAMPASSWORD,
		two_factor_code: process.argv[2],
	});
});

steamClient.on("servers", (servers) => {
	const stringArr = JSON.stringify(servers);
	fs.writeFile("steamServers.json", stringArr, "utf-8", (err) => {
		if (err) {
			logger.error(err);
		}
		else {
			// logger.log({ level: "info", message: `${time()} Updated steamServers list file.` });
			logger.info("Updated steamServers list file.");
}
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
			logger.info(`Received an friend request from ${steamid} while online`);
			await steamFriends.addFriend(steamid);
		}
		logger.info(`Succesfully added ${steamid} to friends`);
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
				.then(logger.info("Successfully forwarded data to update")).catch(err => {
					logger.error(err);
				});
				CSGO.removeAllListeners();
			});
		});
		return;
	}

	if (res == 0) {
		logger.info(`${steamid} removed me from friends`);
		return;
	}
	console.log(res);
	},
);

steamFriends.on("relationships", () => {
	Object.keys(steamFriends.friends).forEach(key => {
		if (steamFriends.friends[key] == 2) {
			logger.info(`Received an Friends request from: ${key} while offline, Accepting..`);
			steamFriends.addFriend(key);
		}
	});
});

steamFriends.on("friendMsg", async (steamid, msg, type) => {
	// If typing break out
	if (type == 2) {
		return;
	}
	if (type == 1 && msg == "!cs update") {
		logger.info(`Received an steamchat update request from steamid : ${steamid}`);
		const profile = await rp("http://localhost:3000/api/fetchPlayerRank", { json: { steamid : steamid } });
		const qString = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=A46EE240150FDB461D92C711B23C66BF&steamids=${steamid}`;
		const steamProfile = await rp(qString);
		const obj = JSON.parse(steamProfile);
		const steamPersonaName = obj.response.players[0].personaname;
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
		rp.post("http://localhost:3000/api/testing", { json: payload })
		.then(() => {
			logger.info(`Successfully forwarded data to update for steamid ${steamid}`);
			const message = "Your rank has been successfully updated!";
			steamFriends.sendMessage(steamid, message);
		})
		.catch(err => {
			logger.err(`Unsuccessful rank update!! ERR: ${err}`);
			const message = "Your rank wasnt updated. Try again later";
			steamFriends.sendMessage(steamid, message);
		});
	return;
	}
	if (type == 1 && msg.startsWith("!cs")) {
		steamFriends.sendMessage(steamid, "Unrecognized command.");
	}
});

steamClient.on("error", (err) => {
	console.log(`${time()} ${err}`);
	try {
		logger.info("Attempting reconnecting..");
		steamClient.connect();
	}
	catch (error) {
		logger.info(`Couldnt Connect.. err: ${error}`);
	}
});

steamClient.on("logOnResponse", function(res) {
	if (res.eresult == Steam.EResult.OK) {
		logger.info("Successful steam login");
		mongoClient.connect().then(logger.info("Successfully connected to DB!")).catch(reason => logger.error(`MongoDB ERROR: ${reason}`));
		CSGO.launch();
		logInTime = moment().unix();
	}
	else if (res.eresult == Steam.EResult.InvalidPassword) {
		logger.error("Invalid Steam Password on login");
		throw new Error("ERR: Invalid Password");
	}
	else if (res.eresult == Steam.EResult.TwoFactorCodeMismatch) {
		logger.error("Invalid Two Factor Code");
		throw new Error("ERR: Invalid Two Factor Code");
	}
	else if (res.eresult == Steam.EResult.LoggedInElsewhere) {
		logger.error("Bot Account logged in elsewhere");
		throw new Error("ERR: Bot Account logged in elsewhere");
	}
	else if (res.eresult == Steam.EResult.AccountLoginDeniedNeedTwoFactor) {
		logger.error("No Two Factor Code");
		throw new Error("ERR: No Two Factor Code");

	}
	else {logger.error(`EResult: ${res.eresult} Check: https://github.com/SteamRE/SteamKit/blob/master/Resources/SteamLanguage/eresult.steamd#L96`); return;}
	// to display your bot's status as "Online"
	// steamFriends.setPersonaState(Steam.EPersonaState.Online);
});

CSGO.on("ready", function onReady() {
	logger.info("CS:GO Client Ready");
});

CSGO.on("unready", function OnUnready() {
	logger.info("CS:GO Client Unready");
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
			).then(res.send("OK!")).catch(err => {logger.error(err); res.status(500).send("Internal Server Error");});
		}
		else if (command === "profile") {
			const query = { "profileUsedCount": { $exists: true } };
			await collection.updateOne(query,
				{ $inc: { "profileUsedCount": 1 } },
			).then(res.send("OK!")).catch(err => {logger.error(err); res.status(500).send("Internal Server Error");});
		}
		else if (command === "steamid") {
			const query = { "steamidUsedCount": { $exists: true } };
			await collection.updateOne(query,
				{ $inc: { "steamidUsedCount": 1 } },
			).then(res.send("OK!")).catch(err => {logger.error(err); res.status(500).send("Internal Server Error");});
		}
		else if (command === "mm-stats") {
			const query = { "mm-statsUsedCount": { $exists: true } };
			await collection.updateOne(query,
				{ $inc: { "mm-statsUsedCount": 1 } },
			).then(res.send("OK!")).catch(err => {logger.error(err); res.status(500).send("Internal Server Error");});
		}
	}
	commandRan(req.body.command);
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
app.post("/api/blacklistUser", async (req, res) => {
	if (!req.body) {
		return res.status(400).send("Request body was empty");
	}
	fs.readFile("blacklist.json", (err, data) => {
		if (err) {
			return logger.error("error while reading blacklist.json at /api/blacklistUser");
		}
		const arr = JSON.parse(data);
		if (arr.includes(req.body.userID)) {
			return res.status(304).send("User is already blacklisted");
		}
		else {
			arr.push(req.body.userID);
			fs.writeFile("blacklist.json", JSON.stringify(arr), () => {
				return res.status(200).send("User blacklisted");
			});
		}
	});
});
app.post("/api/testing", async (req, res) => {
	logger.info("PlayerDB request received!");
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
		logger.info(`${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`);
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
		logger.info(`Updated ${result.modifiedCount} Docs`);
	}
	res.status(200).send("OK");
});

app.get("/api/getMatchmaking", (req, res) => {
	logger.info("Received Matchmaking Request");
	CSGO.matchmakingStatsRequest();
	CSGO.on("matchmakingStatsData", function onMatchmakingStats(stats) {
		res.send(JSON.stringify(stats));
		res.status(200);
		CSGO.removeAllListeners();
	});
});

app.get("/api/updateFriendslist", (req, res) => {
	res.send("OK");
	const interval = 4000;
	let promise = Promise.resolve();
	Object.keys(steamFriends.friends).forEach(key => {
		promise = promise.then(function() {
			const qString = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=A46EE240150FDB461D92C711B23C66BF&steamids=${key}`;
			rp(qString)
			.then(async steamRes => {
				const obj = JSON.parse(steamRes);
				const steamPersonaName = obj.response.players[0].personaname;
				const playerSteamId = { steamid: key };
				rp("http://localhost:3000/api/fetchPlayerRank", { json: playerSteamId }).then(playerProfile => {
					const commendations = playerProfile.account_profiles[0].commendation;
					const mmRankId = playerProfile.account_profiles[0].ranking.rank_id;
					const mmWins = playerProfile.account_profiles[0].ranking.wins;
					const playerLevel = playerProfile.account_profiles[0].player_level;
					const playerCurExp = playerProfile.account_profiles[0].player_cur_xp;
					const mmRank = CSGO.Rank.getString(mmRankId);
					const payload = {
						"steamid64": key,
						"steamPersonaName":steamPersonaName,
						"rankString": mmRank,
						"rankId":mmRankId,
						"wins": mmWins,
						"playerLevel":playerLevel,
						"playerCurExp":playerCurExp,
						"commendations":commendations,
					};
					rp.post("http://localhost:3000/api/testing", { json: payload });
					});
				});
			return new Promise(function(resolve) {
				setTimeout(resolve, interval);
			});
		});
	});
	promise.then(logger.info("Friendlist playerdata updating loop finished."));
});

app.get("/api/fetchPlayerRank", async (req, res) => {
	const steamid = req.body.steamid;
	const accountid = CSGO.ToAccountID(steamid);
	CSGO.playerProfileRequest(accountid);
	await CSGO.on("playerProfile", (profile) => {
		res.status(200).send(profile);
		CSGO.removeAllListeners();
	});
});

app.get("/api/getMatchData", (req, res) => {
	if (!req.body || !req.body.shareCode) {
		res.status(500).send("No sharecode submitted");
	}
	const shareCodeUnformatted = req.body.shareCode;
	const shareCode = shareCodeUnformatted.match(/(CSGO)(.{30})/);
	const decodedSC = new csgo.SharecodeDecoder(shareCode[0]).decode();
	const matchID = decodedSC.matchId;
	const outcomeID = decodedSC.outcomeId;
	const tokenID = parseInt(decodedSC.tokenId);
	CSGO.requestGame(matchID, outcomeID, tokenID);
	CSGO.on("matchList", (match) => {
		res.send(match);
		CSGO.removeAllListeners();
	});
});


rl.on("line", (input) => {
	if (input == "uptime") {
		const currentTime = moment().unix();
		const difference = (currentTime - logInTime) / 60;
		logger.info(`Uptime: ${Math.floor(difference)} minutes`);
	}
	else {
		logger.info(`${time()} INPUT ERR: Unknown Command: ["${input}"]`);
	}
});
process.on("SIGINT", function() {
	logger.info(`${time()} Shutting down....`);
	mongoClient.close(function() {
		const currentTime = moment().unix();
		logger.info("MongoDB disconnected on app termination");
		CSGO.exit(logger.info("CS:GO disconnected on app termination"));
		steamClient.disconnect(logger.info("Steam disconnected on app termination"));
		logger.info(`Server uptime was: ${Math.floor((currentTime - logInTime) / 60)} minutes.`);
		process.exit(0);
	});
});

app.listen(PORT, () => {
	logger.info(`App listening at .${PORT}`);
});