const axios = require("axios");

module.exports = {
	config: {
		name: "alldl",
		version: "1.2",
		author: "S AY EM",
		countDown: 5,
		role: 0,
		shortDescription: "Auto download video",
		longDescription: "Download all video automatically",
		category: "media"
	},

	onStart: async function ({ message, args }) {
		if (!args[0]) return message.reply("Please provide a URL");

		message.reaction("😘");

		handleDownload(args[0], message);
	},

	onChat: async function ({ event, api }) {
		try {
			if (!event.body) return;

			const text = event.body.trim();

			if (!text.includes("http")) return;

			api.setMessageReaction("😘", event.messageID, () => {}, true);

			handleDownload(text, {
				reply: (msg) => api.sendMessage(msg, event.threadID, event.messageID)
			});

		} catch (e) {
			console.log(e);
		}
	}
};

async function handleDownload(url, message) {
	try {

		const api = `https://sayem-apixs.vercel.app/api/downloader/threads?url=${encodeURIComponent(url)}`;
		const res = await axios.get(api);

		if (!res.data || !res.data.success) {
			return message.reply("Failed to fetch media");
		}

		const mediaUrl = res.data.download_url;

		const isPhoto =
			mediaUrl.includes(".jpg") ||
			mediaUrl.includes(".jpeg") ||
			mediaUrl.includes(".png") ||
			mediaUrl.includes("image");

		let platformText = isPhoto ? "Your photo." : "Your video.";

		if (url.includes("facebook.com") || url.includes("fb.watch")) {
			platformText = isPhoto
				? "😘 | 𝐘𝐨𝐮𝐫 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐏𝐡𝐨𝐭𝐨"
				: "😘 | 𝐘𝐨𝐮𝐫 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐕𝐢𝐝𝐞𝐨";
		}
		else if (url.includes("tiktok.com")) {
			platformText = isPhoto
				? "😘 | 𝐘𝐨𝐮𝐫 𝐓𝐢𝐤𝐭𝐨𝐤 𝐏𝐡𝐨𝐭𝐨"
				: "😘 | 𝐘𝐨𝐮𝐫 𝐓𝐢𝐤𝐭𝐨𝐤 𝐕𝐢𝐝𝐞𝐨";
		}
		else if (url.includes("instagram.com")) {
			platformText = isPhoto
				? "😘 | 𝐘𝐨𝐮𝐫 𝐈𝐧𝐬𝐭𝐫𝐚𝐠𝐫𝐚𝐦 𝐏𝐡𝐨𝐭𝐨"
				: "😘 | 𝐘𝐨𝐮𝐫 𝐈𝐧𝐬𝐭𝐫𝐚𝐠𝐫𝐚𝐦 𝐕𝐢𝐝𝐞𝐨";
		}
		else if (url.includes("pinterest.com")) {
			platformText = isPhoto
				? "😘 | 𝐘𝐨𝐮𝐫 𝐏𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 𝐏𝐡𝐨𝐭𝐨"
				: "😘 | 𝐘𝐨𝐮𝐫 𝐏𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 𝐕𝐢𝐝𝐞𝐨";
		}
		else if (url.includes("youtube.com") || url.includes("youtu.be")) {
			platformText = "😘 | 𝐘𝐨𝐮𝐫 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐕𝐢𝐝𝐞𝐨";
		}

		await message.reply({
			body: platformText,
			attachment: await global.utils.getStreamFromURL(mediaUrl)
		});

	} catch (e) {
		console.log(e);
		message.reply("Error while downloading");
	}
}
