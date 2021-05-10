const dotenv = require("dotenv");
const { CommandoClient } = require("discord.js-commando");
const path = require("path");
const rp = require("request-promise");
const fs = require("fs");
const logger = require("./modules/logger.js");
dotenv.config();
let blacklist;

if (fs.existsSync("server/blacklist.json", "utf-8")) {
	blacklist = JSON.parse(fs.readFileSync("server/blacklist.json"));
}
else {logger.warn("Didnt load user blacklist since it doesnt exist.");}
fs.watchFile("server/blacklist.json", () => {
	blacklist = JSON.parse(fs.readFileSync("server/blacklist.json"));
	logger.info("Updated blacklist");
});

const client = new CommandoClient({
	commandPrefix: "!cs",
	owner: "184366854674972672",
	invite: "https://discord.gg/Brs96NUFs8",
	disableEveryone: true,
	unknownCommandResponse: false,
});
client.dispatcher
	.addInhibitor(msg => {
		// Under work..
		// if (msg.author.id == client.options.owner) return "blacklisted";
		if (blacklist.includes(msg.author.id)) return { reason: "blacklisted", response : msg.reply("You have been blacklisted. You can appeal here: https://discord.gg/Brs96NUFs8") };
	});
client.registry
	.registerDefaultTypes()
	.registerGroups([
		["first", "First command group"],
		["second", "Second command group"],
	])
	.registerDefaultGroups()
	.registerDefaultCommands({
		help:false,
		unknownCommand: false,
	})
	.registerCommandsIn(path.join(__dirname, "commands"));

client.on("ready", () => {
	logger.info(`Ready. Connected as: [${client.user.tag}]`);
	client.user.setActivity(" : !cs help", { type: "LISTENING" })
		.then(presence => logger.info(`Activity set to ${presence.activities[0].name}`))
		.catch(err => logger.error(err));

});

client.on("guildCreate", (guild) => {
	try {
		guild.systemChannel.send("Thanks for inviting me! You can see my commands by using !cs help");
	}
	catch (error) {
		if (error == TypeError) {
			return;
		}
		else {logger.error(`Unknown error raised while trying to send a message on guild join. err: ${error}`);}
	}
});

client.on("commandRun", (command, promise, message, args, fromPattern, result) => {
	// If there were no args used with cmd and it was run in a guild
	if (result == null && message.guild) {
		return logger.info(`[cmdran] ${message.author.tag} ran cmd [${command.name}] in server [${message.guild.name}]`);
	}
	// If message was sent to bot DM'S and there were args
	if (message.guild == null && result != null) {
		return logger.info(`[cmdran] ${message.author.tag} ran cmd [${command.name}] with args [${result.values[Object.keys(result.values)[0]]}] in DM's`);
	}
	if (message.guild == null && result == null) {
		return logger.info(`[cmdran] ${message.author.tag} ran cmd [${command.name}] in DM's`);
	}
	// If we have args and msg was in a guild, log this
	logger.info(`[cmdran] ${message.author.tag} ran cmd [${command.name}] with args [${result.values[Object.keys(result.values)[0]]}] in server [${message.guild.name}]`);
});

client.on("message", (msg) => {
	if (msg.content.startsWith("!cs")) {
		rp.post("http://localhost:3000/api/prefixCount")
			.catch(err => logger.error(`Unsuccesful transaction with back end.. error: ${err}`));
	}
});

process.on("SIGINT", function() {
	logger.info("Shutting down....");
	client.destroy();
	process.exit(0);
});
client.login(process.env.DISCORDSECRET);
