const { Command } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");
const { version } = require("../../package.json");
module.exports = class helpCommand extends Command {
	constructor(client) {
		super(client, {
			name: "help",
			group: "first",
			memberName: "help",
			description: "Replies with a list of available commands.",
			hidden: true,
			argsPromptLimit: 0,
			throttling: {
				usages: 2,
				duration: 10,
			},
		});
	}

	run(message) {
		const commands = this.client.registry.findCommands("", false, message);
		const cmds = [];
		commands.forEach(item => {
			if (item.group.id == "first" && item.hidden == false) {
				cmds.push(item);
			}
		});
		const helpEmbed = new MessageEmbed()
			.setColor("#FFA500")
			.setTitle("Commands")
			.setThumbnail("https://i.pinimg.com/originals/b1/02/24/b10224ae75edd5debd06c44662cbcb30.png")
			.setTimestamp()
			.setFooter(`Ricksaw CSGO Bot v${version}`, this.client.user.displayAvatarURL());
		cmds.forEach(item => {
			// const possibleArgs = item.argsCollector.args[0].prompt;
			if (item.argsCollector !== null) {
				const arg = item.argsCollector.args[0];
				const name = item.name;
				const desc = item.description;
				helpEmbed.addField(`!cs ${name} <${arg.prompt}>`, `${desc}`);
			}
			else {
				const name = item.name;
				const desc = item.description;
				helpEmbed.addField(`!cs ${name}`, desc);
			}
		});
		return message.say(helpEmbed);
	}
};