const { Command } = require("discord.js-commando");

module.exports = class purgeCommand extends Command {
	constructor(client) {
		super(client, {
			name: "purge",
			group: "first",
			memberName: "purge",
			description: "Purges messages, only executable by the bot owner.",
			ownerOnly: true,
			hidden: true,
			argsPromptLimit: 0,
			args: [
				{
					key:"amount",
					prompt:"number of messages to purge",
					type: "integer",
				},
			],
		});
	}

	run(message, { amount }) {
		if (!message.guild.me.hasPermission("MANAGE_MESSAGES")) {
			return message.say("I dont have permissions to delete messages here.");
		}
		else if (parseInt(amount) > 100) {
			return message.reply("Max amount of messages i can delete at once is 100.");
		}
		const oldMessage = message;
		message.channel.messages.delete(message).then(() => {
			oldMessage.channel.messages.fetch({ limit: amount }).then(msg => {
				// msg.forEach(item => console.log(item.content));
				oldMessage.channel.bulkDelete(msg)
					.then(deletedMessages => {
						if (deletedMessages.size == 1) {
							return oldMessage.say(`Deleted ${deletedMessages.size} message`);
						}
						return oldMessage.say(`Deleted ${deletedMessages.size} messages`);
					});
			});
		});
	}
};