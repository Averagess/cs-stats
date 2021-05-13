const { Command } = require("discord.js-commando");
const rp = require("request-promise");
const logger = require("../../modules/logger.js");

module.exports = class unblacklistCommand extends Command {
	constructor(client) {
		super(client, {
			name: "unblacklist",
			group: "first",
			memberName: "unblacklist",
			description: "Unblacklists an user. Only executable by the bot owner.",
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
		rp.delete("http://localhost:3000/api/unblacklistUser", { json: { userID: mention.id } })
			.then(() => {
				return message.say(`${mention} unblacklisted successfully.`);
			})
			.catch(err => {
				if (err.statusCode == 400) {
					return message.reply(`Bot's request body was empty when blacklisting user ${mention}`);
				}
				logger.error(`Error while unblacklisting user ${mention}, err: ${err}`);
				return message.reply(`Error while unblacklisting user ${mention}`);
			});
	}
};