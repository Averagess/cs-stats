const { Command } = require("discord.js-commando");
const dotenv = require("dotenv");
const { MessageEmbed } = require("discord.js");
const rp = require("request-promise");
dotenv.config();

module.exports = class statsCommand extends Command {
	constructor(client) {
		super(client, {
			name: "stats",
			group: "first",
			memberName: "stats",
			description: "Replies with a set of CS:GO stats.",
			args: [
				{
					key: "text",
					prompt: "Steam profile link",
					type: "string",
				},
			],
		});
	}

	async run(message, { text }) {
		const things = {
			apiKey : process.env.STEAMSECRET,
			target : text,
			appid : "730",
		};
		if (text.toLowerCase().includes("steamcommunity.com/id/")) {
			const regex = /([/A-Z/])\w*/g;
			const extracted = text.match(regex);
			const URL = extracted[3].replace("/", "");
			const qString = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${things.apiKey}&vanityurl=${URL}`;
			// eslint-disable-next-line max-statements-per-line
			await rp(qString).then(res => {const data = JSON.parse(res);things.target = data.response.steamid;}).catch(err => console.log(err));
		}
		else if (text.toLowerCase().includes("steamcommunity.com/profiles/")) {
			const regex = /([\d])\w+/g;
			const extracted = text.match(regex);
			things.target = extracted[0];
		}
		else if (text.match(/([\d]){17}/g)) {
			if (text.match(/([\d]){17}/g).length !== 1) {return message.say("Steam API couldn't find the provided account. Double check your syntax and try again.");}
			console.log("steam id provided");
		}
		else {return message.say("Steam API couldn't find the provided account. Double check your syntax and try again.");}
		const url1 = { uri: `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${things.apiKey}&steamids=${things.target}` };
		const url2 = { uri: `http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${things.appid}&key=${things.apiKey}&steamid=${things.target}` };
		const url3 = { uri: "http://localhost:3000/api/getRank", json: { steamID: String(things.target) } };
		rp(url1)
			.then(response => {
				url2.url1res = response;
				return rp(url2);
			})
			.then(response => {
				url2.url2res = response;
				return rp(url3);
			})
			.then(response => {
				const csgoData = response;
				const steamProfile = JSON.parse(url2.url1res).response.players[0];
				const steamStats = JSON.parse(url2.url2res);
				let kd = steamStats.playerstats.stats[0].value / steamStats.playerstats.stats[1].value;
				kd = Math.round(Number(kd) * 100) / 100;
				const embedMessage = new MessageEmbed()
					.setTitle(steamProfile.personaname)
					.setColor("#FFA500")
					.setDescription("CS:GO Stats")
					.setThumbnail(steamProfile.avatarfull)
					.addFields(
						{ name: "Lifetime Kills", value:steamStats.playerstats.stats[0].value, inline: true },
						{ name: "Lifetime Deaths", value:steamStats.playerstats.stats[1].value, inline: true },
						{ name: "K/D", value:kd, inline: true },
					)
					.setTimestamp()
					.setFooter("Ricksaw CSGO Bot");
				if (csgoData.rankString) {
					embedMessage.addFields(
						{ name: "Friendly", value: csgoData.commendation.cmd_friendly, inline: true },
						{ name: "Teaching", value: csgoData.commendation.cmd_teaching, inline: true },
						{ name: "Leader", value: csgoData.commendation.cmd_leader, inline: true },
						{ name: "Real Playtime", value: Math.floor((steamStats.playerstats.stats[2].value / 60) / 60) + " hours" },
						{ name: "Rank", value: csgoData.rankString },
					);
				}
				else {
					embedMessage.addField("Real Playtime", Math.floor((steamStats.playerstats.stats[2].value / 60) / 60) + " hours");
					embedMessage.addField("Rank", "if this is your account, see !cs updateRank");
				}
				rp.post({
					uri:"http://localhost:3000/api/data",
					json:{ "command":"stats" },
				}).then(console.log("Succesful transaction with back end.")).catch(err => console.log(err));
				return message.say(embedMessage);
			})
			.catch(err => {
				if (err.statusCode == 500) {
					console.log(err);
					return message.say("This profile has set game details to private, To view the stats you need to set these details to public.");
				}
				console.log(err);
			});
	}
};