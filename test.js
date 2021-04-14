const botModules = require("./modules/botModules");

const target = "76561198147946696";
const key = "A46EE240150FDB461D92C711B23C66BF";
const url = "http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=A46EE240150FDB461D92C711B23C66BF&steamid=76561198147946696&relationship=friend";


async function getFriendsList(profile) {
	try {
		const html = await botModules.friendsList(profile);
		return html;
		// try downloading an invalid url
	}
	catch (error) {
		console.error("ERROR:");
		console.error(error);
	}
}
const printer = getFriendsList(url).then(friends => { const friendsObject = JSON.parse(friends); return friendsObject.friendslist.friends.length;});

console.log(printer)
//getFriendsList(url).then(item => {data = JSON.parse(item); console.log(data.friendslist.friends.length)});