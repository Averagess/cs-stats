const { Command } = require("discord.js-commando");
const logger = require("../../modules/logger.js");
const rp = require("request-promise");
const { MessageEmbed } = require("discord.js");
const { version } = require("../../package.json");

module.exports = class statusCommand extends Command {
	constructor(client) {
		super(client, {
			name: "status",
			group: "first",
			memberName: "status",
			description: "Replies with info about the bot's status.",
			argsPromptLimit: 0,
			ownerOnly: true,
			hidden: true,
			throttling: {
				usages: 2,
				duration: 10,
			},
		});
	}

	run(message) {
		rp.get("http://localhost:3000/api/status")
			.then(res => {
				const data = JSON.parse(res);
				const statusEmbed = new MessageEmbed()
					.setColor("#FFA500")
					.setTitle(`${this.client.user.username}'s status`)
					.addFields(
						{ name: "Server uptime ", value: `${data.uptime}` },
						{ name: "Total reconnections to Steam", value: data.reconnections },
						{ name: "Connected to Steam", value: data.steamLoggedIn },
						{ name: "Connected to Database", value: data.mongoLoggedIn },
						{ name: "Total Guilds", value: this.client.guilds.cache.size },
					)
					.setTimestamp()
					.setFooter(`Ricksaw CSGO Bot v${version}`, this.client.user.displayAvatarURL());
				message.say(statusEmbed);
			})
			.catch(err => {
				logger.error(`Error while fetching Backend status. ERR: ${err}`);
				if (err.error.code == "ECONNREFUSED") {
					const statusEmbed = new MessageEmbed()
						.setColor("#FFA500")
						.setTitle(`${this.client.user.username}'s status`)
						.addFields(
							{ name: "Server uptime ", value: "unknown" },
							{ name: "Total reconnections to Steam", value: "unknown" },
							{ name: "Connected to Steam", value: "unknown" },
							{ name: "Connected to Database", value: "false" },
							{ name: "Total Guilds", value: this.client.guilds.cache.size },
						)
						.setTimestamp()
						.setFooter(`Ricksaw CSGO Bot v${version}`, this.client.user.displayAvatarURL());
					return message.say(statusEmbed);
				}
			});
	}
};