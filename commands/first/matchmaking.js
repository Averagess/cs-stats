const { Command } = require("discord.js-commando");
const { MessageEmbed } = require("discord.js");
const rp = require("request-promise");
const { readableNumber } = require("../../modules/modules.js");
module.exports = class mmstats extends Command {
	constructor(client) {
		super(client, {
			name: "mm-stats",
			group: "first",
			memberName: "matchmaking",
			description: "Replies with current CS:GO Matchmaking stats",
		});
	}

	run(message) {
		rp("http://localhost:3000/api/getMatchmaking")
			.then(res => {
				const stats = JSON.parse(res).global_stats;
				const playersOn = readableNumber(stats.players_online);
				const serversOn = readableNumber(stats.servers_online);
				const playersSearching = readableNumber(stats.players_searching);
				const serversAvailable = readableNumber(stats.servers_available);
				const ongoingMatches = readableNumber(stats.ongoing_matches);
				const searchtimeAvg = ((stats.search_time_avg / 60) / 1000).toFixed(2);
				const statsEmbed = new MessageEmbed()
					.setColor("#FFA500")
					.setTitle("Current CS:GO Matchmaking stats")
					.setThumbnail("https://i.pinimg.com/originals/b1/02/24/b10224ae75edd5debd06c44662cbcb30.png")
					.addFields(
						{ name: "Players online", value: playersOn, inline:true },
						{ name: "Servers online", value: serversOn, inline:true },
						{ name: "Players searching", value: playersSearching, inline:true },
						{ name: "Servers available", value: serversAvailable, inline:true },
						{ name: "Ongoing matches", value: ongoingMatches, inline:true },
						{ name: "Search time average", value: `${searchtimeAvg} minutes`, inline:true },
					)
					.setTimestamp()
					.setFooter("Ricksaw CSGO Bot", this.client.user.displayAvatarURL());
				return message.say(statsEmbed);
			}).then(
				rp.post({
					uri:"http://localhost:3000/api/data",
					json:{ "command":"mm-stats" },
				}).then(console.log("Succesful transaction with back end.")).catch(console.log),
			);
	}
};