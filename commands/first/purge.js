const { Command } = require("discord.js-commando");

module.exports = class purgeCommand extends Command {
	constructor(client) {
		super(client, {
			name: "purge",
			group: "first",
			memberName: "purge",
			description: "Purges messages",
			ownerOnly: true,
			args: [
				{
					key:"amount",
					prompt:"Number of messages to purge",
					type: "string",
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
			oldMessage.channel.messages.fetch({ limit: parseInt(amount) }).then(msg => {
				// msg.forEach(item => console.log(item.content));
				oldMessage.channel.bulkDelete(msg)
					.then(deletedMessages => {
						if (deletedMessages.size == 1) {
							return oldMessage.say(`Deleted ${amount} message`);
						}
						return oldMessage.say(`Deleted ${deletedMessages.size} messages`);
					});
			});
		});

		// return message.say(`${amount}`);
	}
};