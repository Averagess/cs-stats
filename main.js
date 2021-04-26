const modules = require("./modules/modules.js");
const dotenv = require("dotenv");
const { CommandoClient } = require("discord.js-commando");
const path = require("path");
const rp = require("request-promise");
const fs = require("fs");
dotenv.config();
let blacklist;

if (fs.existsSync("server/blacklist.json", "utf-8")) {
	blacklist = JSON.parse(fs.readFileSync("server/blacklist.json"));
}
else {console.log(`${modules.time()} [WARN] didnt load user blacklist since it doesnt exist.`);}
fs.watchFile("server/blacklist.json", () => {
	blacklist = JSON.parse(fs.readFileSync("server/blacklist.json"));
	console.log(`${modules.time()} Updated blacklist`);
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
	console.log(`${modules.time()} Ready. Connected as: [${client.user.tag}]`);
	client.user.setActivity(" : !cs", { type: "LISTENING" })
		.then(presence => console.log(`${modules.time()} Activity set to ${presence.activities[0].name}`))
		.catch(console.error);

});

client.on("guildCreate", (guild) => {
	try {
		guild.systemChannel.send("Thanks for inviting me! You can see my commands by using !cs help");
	}
	catch (error) {
		if (error == TypeError) {
			return;
		}
		else {console.log(`Unknown error raised while trying to send a message on guild join. err: ${error}`);}
	}
});

client.on("message", (msg) => {
	if (msg.content.startsWith("!cs")) {
		rp.post("http://localhost:3000/api/prefixCount")
			.catch(err => console.log(`Unsuccesful transaction with back end.. error: ${err}`));
	}
});

process.on("SIGINT", function() {
	console.log("Shutting down....");
	client.destroy();
	process.exit(0);
});
client.login(process.env.DISCORDSECRET);