const { Command } = require("discord.js-commando");
const dotenv = require("dotenv");
const rp = require("request-promise");
const { decToHex } = require("hex2dec");
const { MessageEmbed } = require("discord.js");
const m = require("../../modules/modules.js");
const logger = require("../../modules/logger.js");
const { version } = require("../../package.json");
dotenv.config();

module.exports = class steamid extends Command {
	constructor(client) {
		super(client, {
			name: "steamid",
			group: "first",
			memberName: "steamid",
			description: "Replies with a steamid for the provided account",
			argsPromptLimit: 0,
			format: "<steamcommunity link> / <steamid64>",
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
			apiKey : process.env.STEAMSECRET,
			target : text,
			appid : "730",
		};
		if (text.toLowerCase().includes("steamcommunity.com/id/") || text.toLowerCase().includes("id/")) {
			const regex = /(\w)\w*/g;
			const extracted = text.match(regex);
			const URL = extracted.pop().replace("/", "");
			const qString = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${things.apiKey}&vanityurl=${URL}`;
			// eslint-disable-next-line max-statements-per-line
			await rp(qString).then(res => {const data = JSON.parse(res);things.target = data.response.steamid;}).catch(err => logger.err(err));
		}
		else if (text.toLowerCase().includes("steamcommunity.com/profiles/")) {
			const regex = /([\d])\w+/g;
			const extracted = text.match(regex);
			things.target = extracted[0];
		}
		else {return message.say("Steam API couldn't find the provided account. Double check your syntax and try again.");}
		const url1 = { uri: `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${things.apiKey}&steamids=${things.target}` };
		rp(url1).then(res => {
			const steamID1 = m.SteamIDConverter.toSteamID(things.target);
			const steamID3 = m.SteamIDConverter.toSteamID3(things.target);
			const hexid = decToHex(things.target).toUpperCase();
			const profileData = JSON.parse(res).response.players[0];
			const profileEmbed = new MessageEmbed()
				.setColor("#FFA500")
				.setTitle(profileData.personaname)
				.setThumbnail(profileData.avatarmedium)
				.addFields(
					{ name: "Steam profile URL", value: profileData.profileurl },
					{ name: "SteamID", value: steamID1 },
					{ name: "SteamID3", value: steamID3 },
					{ name: "Steam64 ID", value: things.target },
					{ name: "Hex ID", value: hexid },
				)
				.setTimestamp()
				.setFooter(`Ricksaw CSGO Bot v${version}`, this.client.user.displayAvatarURL());
			return message.say(profileEmbed);
		}).then(
			rp.post({
				uri:"http://localhost:3000/api/data",
				json:{ "command":"steamid" },
			}).catch(err => logger.error(`Unsuccesful transaction with back end.. error: ${err}`)),
		);
	}
};
