const { Command } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");

module.exports = class MeowCommand extends Command {
	constructor(client) {
		super(client, {
			name: "serverlist",
			group: "first",
			memberName: "serverlist",
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
			embed.addField(`${count}. ${i.name}`, `Members: ${i.memberCount}\nLarge: ${i.large}\nOwner: ${i.ownerID}\nBoosts: ${i.premiumSubscriptionCount}\nVerified: ${i.verified}\nJoined at: ${i.joinedAt.toLocaleString()}`);
		});
		return message.say(embed);
	}
};