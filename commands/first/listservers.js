const { Command } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");

module.exports = class MeowCommand extends Command {
	constructor(client) {
		super(client, {
			name: "listservers",
			group: "first",
			memberName: "listservers",
			description: "Replies with current server list.",
			argsPromptLimit: 0,
			hidden: true,
			ownerOnly: true,
			throttling: {
				usages: 2,
				duration: 10,
			},
		});
	}

	run(message) {
		let count = 0;
		const embed = new MessageEmbed();
		this.client.guilds.cache.forEach(i => {
			count++;
			embed.addField(`${count}. ${i.name}`, `Members: [${i.memberCount}]`);
		});
		return message.say(embed);
	}
};