/* eslint-disable prefer-const */
const readline = require("readline");
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

let Steam = require("steam"),
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
	});
});

steamClient.on("error", (err) => {
	console.log(err);
});

steamClient.on("logOnResponse", function(res) {
	if (res.eresult == Steam.EResult.OK) {
		console.log("Succesful Login");
	}
	else {console.log("error", res);}
	// to display your bot's status as "Online"
	steamFriends.setPersonaState(Steam.EPersonaState.Online);
	CSGO.launch();
});

rl.on("line", (input) => {
	// Input Event
	console.log(input);
	const id = CSGO.ToAccountID(input);
	CSGO.playerProfileRequest(id);
	CSGO.on("playerProfile", (res) => {
		console.log(typeof res);
		console.log("Ranking: " + res.account_profiles[0].ranking);
		console.log("Commendations: " + res.account_profiles[0].commendation);
		console.log(res.account_profiles[0]);
	});
});
// STEAM ID: 76561198116173009
