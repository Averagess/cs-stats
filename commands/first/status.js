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
			description: "Replies with info about the bot's status",
			argsPromptLimit: 0,
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
					.setTitle("Status")
					.addFields(
						{ name: "Server uptime ", value: `${data.uptime} minutes` },
						{ name: "Total reconnections to steam", value: data.reconnections },
						{ name: "Connected to Steam", value: data.steamLoggedIn },
						{ name: "Connected to Database", value: data.mongoLoggedIn },
					)
					.setTimestamp()
					.setFooter(`Ricksaw CSGO Bot v${version}`, this.client.user.displayAvatarURL());
				message.say(statusEmbed);
			})
			.catch(err => {
				logger.error(`Error while fetching Backend status. ERR: ${err}`);
				if (err.error.code == "ECONNREFUSED") {
					return message.say("Couldnt reach backend :(");
				}
			});
	}
};