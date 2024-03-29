const { Command } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");
const { version } = require("../../package.json");
module.exports = class updaterank extends Command {
	constructor(client) {
		super(client, {
			name: "updaterank",
			group: "first",
			memberName: "updaterank",
			description: "Replies with instructions on how to update your rank.",
			argsPromptLimit: 0,
			throttling: {
				usages: 2,
				duration: 10,
			},
		});
	}

	run(message) {
		const steamcommunityEmbed = new MessageEmbed()
			.setColor("#FFA500")
			.setTitle("Steam Community :: Ricksaw")
			.setURL("https://steamcommunity.com/id/ricksawBot")
			.setThumbnail(this.client.user.displayAvatarURL());
		const embed = new MessageEmbed()
			.setColor("#FFA500")
			.setTitle("Updating your rank")
			.setDescription("In order for the bot to know your rank, you need to add it to your Steam friends list. This process only takes a second, and after the process the bot will remove you from their friends list.")
			.setTimestamp()
			.setFooter(`Ricksaw CSGO Bot v${version}`, this.client.user.displayAvatarURL());
		return message.say(steamcommunityEmbed).then(message.say(embed));
	}
};
