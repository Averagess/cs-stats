const moment = require("moment");
module.exports = {
	time: function() {
		const time = moment().format("LTS");
		return `[${time}]`;
	},
	readableNumber: function(number) {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
	},
};