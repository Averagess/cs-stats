const { Command } = require("discord.js-commando");

module.exports = class supportCommand extends Command {
	constructor(client) {
		super(client, {
			name: "support",
			group: "first",
			memberName: "support",
			description: "Replies with a invite link to the support / community server.",
		});
	}

	run(message) {
		return message.say(this.client.options.invite);
	}
};