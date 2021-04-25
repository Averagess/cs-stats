const modules = require("./modules/modules.js");
const dotenv = require("dotenv");
const { CommandoClient } = require("discord.js-commando");
const path = require("path");
const rp = require("request-promise");
dotenv.config();

const client = new CommandoClient({
	commandPrefix: "!cs",
	owner: "184366854674972672",
	invite: "https://discord.gg/muHq8gmBwU",
	disableEveryone: true,
	unknownCommandResponse: false,
});
client.dispatcher
	.addInhibitor(msg => {
		// Under work..
		// if (msg.author.id == client.options.owner) return "blacklisted";
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