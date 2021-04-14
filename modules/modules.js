const moment = require("moment");
module.exports = {
	time: function() {
		const time = moment().format("LTS");
		return `[${time}]`;
	},
};