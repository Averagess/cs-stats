const { Command } = require("discord.js-commando");

module.exports = class supportCommand extends Command {
	constructor(client) {
		super(client, {
			name: "support",
			group: "first",
			memberName: "support",
			description: "Replies with a invite link to the support / community server.",
			argsPromptLimit: 0,
			throttling: {
				usages: 2,
				duration: 10,
			},
		});
	}

	run(message) {
		return message.say(this.client.options.invite);
	}
};