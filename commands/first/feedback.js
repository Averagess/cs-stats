const { MessageEmbed } = require("discord.js");
const { Command } = require("discord.js-commando");

module.exports = class feedbackCommand extends Command {
	constructor(client) {
		super(client, {
			name: "feedback",
			group: "first",
			memberName: "feedback",
			description: "You can submit feedback by using this command",
			format: "<feedback message>",
			argsPromptLimit: 0,
			throttling: {
				usages: 2,
				duration: 10,
			},
			args: [
				{
					key:"text",
					prompt:"feedback message",
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
			.setThumbnail(message.author.displayAvatarURL())
			.setTitle(`${message.author.tag}'s feedback, <${message.author.id}>`)
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