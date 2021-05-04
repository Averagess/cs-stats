const { Command } = require("discord.js-commando");
const rp = require("request-promise");
const logger = require("../../modules/logger.js");

module.exports = class blacklistCommand extends Command {
	constructor(client) {
		super(client, {
			name: "blacklist",
			group: "first",
			memberName: "blacklist",
			description: "Blacklists an user. Only executable by the bot owner.",
			ownerOnly: true,
			hidden: true,
			argsPromptLimit: 0,
			throttling: {
				usages: 2,
				duration: 10,
			},
			args: [
				{
					key: "mention",
					prompt : "mention or Discord user ID",
					type : "user",
				},
			],
		});
	}

	run(message, { mention }) {
		rp.post("http://localhost:3000/api/blacklistUser", { json: { userID: mention.id } })
			.then(() => {
				return message.say(`${mention} Blacklisted successfully.`);
			})
			.catch(err => {
				if (err.statusCode == 304) {
					return message.say(`${mention} was already blacklisted.`);
				}
				else if (err.statusCode == 400) {
					return message.reply(`Bot's request body was empty when blacklisting user ${mention}`);
				}
				logger.error(`Error while blacklisting, err: ${err}`);
				return message.reply(`Error while blacklisting user ${mention}`);
			});
	}
};