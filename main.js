const modules = require("./modules/modules.js");
const dotenv = require("dotenv");
const { CommandoClient } = require("discord.js-commando");
const path = require("path");
dotenv.config();

const client = new CommandoClient({
	commandPrefix: "!cs",
	owner: "184366854674972672",
	invite: "https://discord.gg/VTnwqWKnDZ",
	disableEveryone: true,
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
		unknownCommandResponse: false,
	})
	.registerCommandsIn(path.join(__dirname, "commands"));


client.on("ready", () => {
	console.log(`${modules.time()} Ready. Connected as: [${client.user.tag}]`);
	client.user.setActivity(" : !cs", { type: "LISTENING" })
		.then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
		.catch(console.error);

});

client.login(process.env.DISCORDSECRET);