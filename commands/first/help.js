const { Command } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");
module.exports = class helpCommand extends Command {
	constructor(client) {
		super(client, {
			name: "help",
			group: "first",
			memberName: "help",
			description: "Replies with a list of available commands.",
		});
	}

	run(message) {
		const messageEmbed = new MessageEmbed()
			.setColor("#FFA500")
			.setTitle("Commands")
			.setThumbnail("https://i.pinimg.com/originals/b1/02/24/b10224ae75edd5debd06c44662cbcb30.png")
			.addFields(
				{ name: "!cs mm-stats", value: "Shows current data about CS:GO Matchmaking servers" },
				{ name: "!cs profile <steam profile>", value: "Shows data about a steam profile" },
				{ name: "!cs stats <steam profile>", value: "Shows data about a players CS:GO stats" },
				{ name: "!cs steamid <steam profile>", value: "Shows a list of a steam profiles available id's" },
				{ name: "!cs updaterank", value: "Gives info how to update your own matchmaking rank" },
				{ name: "!cs support", value:"Ricksaw's support / community server" },
				{ name: "!cs feedback <message>", value:"Submit feedback about the bot, or make suggestions" },
				{ name: "!cs help", value:"Lists all available commands" },
			)
			.setTimestamp()
			.setFooter("Ricksaw CSGO Bot", this.client.user.displayAvatarURL());
		return message.say(messageEmbed);
	}
};