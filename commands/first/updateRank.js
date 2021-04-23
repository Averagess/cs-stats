const { Command } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");
module.exports = class updaterank extends Command {
	constructor(client) {
		super(client, {
			name: "updaterank",
			group: "first",
			memberName: "updaterank",
			description: "Replies with instructions on how to update your rank",
		});
	}

	run(message) {
		const embed = new MessageEmbed()
			.setColor("#FFA500")
			.setTitle("Bot's Steam profile link")
			.setDescription("In order for the bot to know your rank, you need to add it to your friends list on steam. We wont message you on steam, and we will remove you almost instantly so we wont take any friends list space.")
			.setURL("https://steamcommunity.com/id/ricksawBot")
			.setTimestamp()
			.setFooter("Ricksaw CSGO Bot", this.client.user.displayAvatarURL());
		return message.say(embed);
	}
};