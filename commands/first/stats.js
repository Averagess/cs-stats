const dotenv = require("dotenv");
const { Command } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");
const rp = require("request-promise");
const { readableNumber } = require("../../modules/modules.js");
const logger = require("../../modules/logger.js");
const { version } = require("../../package.json");
dotenv.config();

module.exports = class statsCommand extends Command {
	constructor(client) {
		super(client, {
			name: "stats",
			group: "first",
			memberName: "stats",
			description: "Replies with a set of a players CS:GO stats.",
			argsPromptLimit: 0,
			format: "<steamcommunity link> / <steamid64>",
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
			apiKey : process.env.STEAMSECRET,
			target : text,
			appid : "730",
		};
		if (text.toLowerCase().includes("steamcommunity.com/id/")) {
			const regex = /(id[/])(\w*)/g;
			const extracted = text.match(regex);
			const URL = extracted[0].replace("id/", "");
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
				const steamStats = JSON.parse(url2.url2res).playerstats.stats;
				let kd = steamStats[0].value / steamStats[1].value;
				kd = Math.round(Number(kd) * 100) / 100;
				const totalShots = readableNumber(steamStats.find(value => value.name == "total_shots_fired").value);
				const totalShotsHit = readableNumber(steamStats.find(value => value.name == "total_shots_hit").value);
				const accuracy = Math.floor(parseInt(totalShotsHit.replace(/(\s)/g, "")) / parseInt(totalShots.replace(/(\s)/g, "")) * 100);
				const embedMessage = new MessageEmbed()
					.setTitle(steamProfile.personaname)
					.setColor("#FFA500")
					.setDescription("CS:GO Stats")
					.setThumbnail(steamProfile.avatarfull)
					.addFields(
						{ name: "Lifetime Kills", value:readableNumber(steamStats[0].value), inline: true },
						{ name: "Lifetime Deaths", value:readableNumber(steamStats[1].value), inline: true },
						{ name: "K/D", value:kd, inline: true },
						{ name: "Total Shots Fired", value: totalShots, inline:true },
						{ name: "Total Shots Hit", value: totalShotsHit, inline:true },
						{ name: "Accuracy", value: `${accuracy} %`, inline:true },
					)
					.setTimestamp()
					.setFooter(`Ricksaw CSGO Bot v${version}`, this.client.user.displayAvatarURL());
				if (csgoData.rankString) {
					embedMessage.addFields(
						{ name: "Friendly", value: csgoData.commendation.cmd_friendly, inline: true },
						{ name: "Teaching", value: csgoData.commendation.cmd_teaching, inline: true },
						{ name: "Leader", value: csgoData.commendation.cmd_leader, inline: true },
						{ name: "Rank", value: csgoData.rankString, inline: true },
						{ name: "Competetive Wins", value: csgoData.wins, inline: true },
					);
				}
				else {
					embedMessage.addField("Rank", "if this is your account and want your rank to be shown, see !cs updaterank");
				}
				embedMessage.addField("Real Playtime", Math.floor((steamStats[2].value / 60) / 60) + " hours");
				rp.post({
					uri:"http://localhost:3000/api/data",
					json:{ "command":"stats" },
				}).catch(err => logger.error(`Unsuccesful transaction with back end.. error: ${err}`));
				return message.say(embedMessage);
			})
			.catch(err => {
				if (err.statusCode == 500) {
					return message.say("This profile has set game details to private, To view the stats you need to set these details to public.");
				}
				logger.error(err);
			});
	}
};