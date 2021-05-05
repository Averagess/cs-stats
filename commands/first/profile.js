const { Command } = require("discord.js-commando");
const rp = require("request-promise");
const dotenv = require("dotenv");
const Discord = require("discord.js");
const moment = require("moment");
const logger = require("../../modules/logger.js");
dotenv.config();


module.exports = class profileCommand extends Command {
	constructor(client) {
		super(client, {
			name: "profile",
			group: "first",
			memberName: "profile",
			description: "Replies with info about submitted steam profile.",
			format: "<steamcommunity link> / <steamid64>",
			argsPromptLimit: 0,
			throttling: {
				usages: 2,
				duration: 10,
			},
			args: [
				{
					key: "text",
					prompt: "steam profile link",
					type: "string",
				},
			],
		});
	}

	async run(message, { text }) {
		const things = {
			apiKey: process.env.STEAMSECRET,
			target: text,
		};
		if (text.toLowerCase().includes("steamcommunity.com/id/")) {
			const regex = /([/A-Z/])\w*/g;
			const extracted = text.match(regex);
			const URL = extracted[3].replace("/", "");
			const qString = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${things.apiKey}&vanityurl=${URL}`;
			// eslint-disable-next-line max-statements-per-line
			await rp(qString).then(res => {const data = JSON.parse(res);things.target = data.response.steamid;}).catch(err => logger.error(err));
		}
		else if (text.toLowerCase().includes("steamcommunity.com/profiles/")) {
			const regex = /([\d])\w+/g;
			const extracted = text.match(regex);
			things.target = extracted[0];
		}
		else if (text.match(/([\d]){17}/g)) {
			if (text.match(/([\d]){17}/g).length !== 1) {return message.say("Steam API couldn't find the provided account. Double check your syntax and try again.");}
		}
		else {return message.say("Steam API couldn't find the provided account. Double check your syntax and try again.");}
		const url1 = { uri:`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${things.apiKey}&steamids=${things.target}` };
		const url2 = { uri:`http://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${things.apiKey}&steamid=${things.target}&relationship=friend` };
		rp(url1)
			.then(response => {
				// add stuff from url1 response to url2
				url2.res = response;
				return rp(url2);
			})
			.then(response => {
				// do stuff after all requests
				const steamProfileData = JSON.parse(url2.res).response.players[0];
				const friendsCount = JSON.parse(response).friendslist.friends.length;
				const statuses = {
					0:"Offline",
					1:"Online",
					2:"Busy",
					3:"Away",
					4:"Snooze",
					5:"Looking To Trade",
					6:"Looking To Play",
				};
				const profileEmbed = new Discord.MessageEmbed()
					.setColor("#FFA500")
					.setTitle(steamProfileData.personaname)
					.setThumbnail(steamProfileData.avatarmedium)
					.addFields(
						{ name: "Steam profile URL", value: steamProfileData.profileurl },
						{ name: "Account creation date", value: moment.unix(steamProfileData.timecreated).format("MMMM Do, YYYY h:mm:ss A") },
						{ name: "Friends count", value:friendsCount },
						{ name: "Status", value:statuses[steamProfileData.personastate] },
					)
					.setDescription("Steam Profile")
					.setTimestamp()
					.setFooter("Ricksaw CSGO Bot", this.client.user.displayAvatarURL());

				if (typeof steamProfileData.gameextrainfo !== "undefined") {
					profileEmbed.addField("Currently playing", steamProfileData.gameextrainfo);
				}
				else {profileEmbed.addField("Currently playing", "none");}
				rp.post({
					uri:"http://localhost:3000/api/data",
					json:{ "command":"profile" },
				}).catch(err => logger.error(`Unsuccesful transaction with back end.. error: ${err}`));
				return message.say(profileEmbed);
				// If something went wrong
				// throw new Error('messed up')
			})
			.catch(err => {
				if (err.statusCode === 401) {
					const steamProfileData = JSON.parse(url2.res).response.players[0];
					const friendsCount = "Private";
					const statuses = {
						0:"Offline",
						1:"Online",
						2:"Busy",
						3:"Away",
						4:"Snooze",
						5:"Looking To Trade",
						6:"Looking To Play",
					};
					const profileEmbed = new Discord.MessageEmbed()
						.setColor("#FFA500")
						.setTitle(steamProfileData.personaname)
						.setThumbnail(steamProfileData.avatarmedium)
						.addFields(
							{ name: "Steam profile URL", value: steamProfileData.profileurl },
							{ name: "Account creation date", value: moment.unix(steamProfileData.timecreated).format("MMMM Do, YYYY h:mm:ss A") },
							{ name: "Friends count", value:friendsCount },
							{ name: "Status", value:statuses[steamProfileData.personastate] },
						)
						.setDescription("Steam Profile")
						.setTimestamp()
						.setFooter("Ricksaw CSGO Bot", this.client.user.displayAvatarURL());

					if (typeof steamProfileData.gameextrainfo !== "undefined") {
						profileEmbed.addField("Currently playing", steamProfileData.gameextrainfo);
					}
					else {profileEmbed.addField("Currently playing", "none");}
					rp.post({
						uri:"http://localhost:3000/api/data",
						json:{ "command":"profile" },
					}).catch(err => logger.error(`Unsuccesful transaction with back end.. error: ${err}`));
					return message.say(profileEmbed);
				}
			});
	}
};
