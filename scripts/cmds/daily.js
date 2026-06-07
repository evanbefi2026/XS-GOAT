const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "daily",
		version: "1.2",
		author: "NTKhang | Modified by Sayem",
		countDown: 5,
		role: 0,
		description: {
			vi: "Nhận quà hàng ngày",
			en: "Receive daily gift"
		},
		category: "game",
		guide: {
			vi: "   {pn}: Nhận quà hàng ngày"
				+ "\n   {pn} info: Xem thông tin quà hàng ngày",
			en: "   {pn}"
				+ "\n   {pn} info: View daily gift information"
		},
		envConfig: {
			rewardFirstDay: {
				coin: 1050,
				exp: 10
			}
		}
	},

	langs: {
		vi: {
			monday: "Thứ 2",
			tuesday: "Thứ 3",
			wednesday: "Thứ 4",
			thursday: "Thứ 5",
			friday: "Thứ 6",
			saturday: "Thứ 7",
			sunday: "Chủ nhật",
			alreadyReceived: "Bạn đã nhận quà rồi, hãy quay lại sau 6 giờ",
			received: "Bạn đã nhận được %1 coin và %2 exp"
		},
		en: {
			monday: "Monday",
			tuesday: "Tuesday",
			wednesday: "Wednesday",
			thursday: "Thursday",
			friday: "Friday",
			saturday: "Saturday",
			sunday: "Sunday",
			alreadyReceived: "You have already received the gift, come back after 6 hours",
			received: "You have received %1 coin and %2 exp"
		}
	},

	onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
		const reward = envCommands[commandName].rewardFirstDay;

		if (args[0] == "info") {
			let msg = "";
			for (let i = 1; i < 8; i++) {
				const getCoin = 1050;
				const getExp = 10;
				const day = i == 7 ? getLang("sunday") :
					i == 6 ? getLang("saturday") :
					i == 5 ? getLang("friday") :
					i == 4 ? getLang("thursday") :
					i == 3 ? getLang("wednesday") :
					i == 2 ? getLang("tuesday") :
					getLang("monday");
				msg += `${day}: ${getCoin} coin, ${getExp} exp\n`;
			}
			return message.reply(msg);
		}

		const { senderID } = event;
		const userData = await usersData.get(senderID);

		const now = Date.now();
		const sixHours = 6 * 60 * 60 * 1000;

		if (userData.data.lastTimeGetReward && now - userData.data.lastTimeGetReward < sixHours)
			return message.reply(getLang("alreadyReceived"));

		const getCoin = 1050;
		const getExp = 10;

		userData.data.lastTimeGetReward = now;

		await usersData.set(senderID, {
			money: userData.money + getCoin,
			exp: userData.exp + getExp,
			data: userData.data
		});

		message.reply(getLang("received", getCoin, getExp));
	}
};
