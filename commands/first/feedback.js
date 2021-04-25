const { MessageEmbed } = require("discord.js");
const { Command } = require("discord.js-commando");

module.exports = class feedbackCommand extends Command {
	constructor(client) {
		super(client, {
			name: "feedback",
			group: "first",
			memberName: "feedback",
			description: "You can submit feedback by using this command",
			args: [
				{
					key:"text",
					prompt:"Feedback that you submit",
					type: "string",
				},
			],
		});
	}

	run(message, { text }) {
		const feedbackTextChannel = "835921497570541608";
		if (text.length < 20 || text.length > 2000) {
			return message.reply(`Feedback not submitted. The requirements are: minimum length of 20 and max of 2000. Your message's length was: ${text.length}`);
		}
		const feedbackEmbed = new MessageEmbed()
			.setColor("#FFA500")
			.setTitle(`${message.author.tag}'s feedback`)
			.setDescription(text)
			.setTimestamp()
			.setFooter("Ricksaw CSGO Bot", this.client.user.displayAvatarURL());
		this.client.channels.fetch(feedbackTextChannel).then(channel => {
			channel.send(feedbackEmbed)
				.then((feedbackMessage) => {
					message.reply("Thanks! Your feedback was submitted successfully.");
					feedbackMessage.react("👍")
						.then(feedbackMessage.react("👎"));
				});
		});
	}
};