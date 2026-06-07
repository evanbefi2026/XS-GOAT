const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "edit",
    version: "3.0",
    author: "S AY EM",
    countDown: 5,
    role: 0,
    shortDescription: "Edit image",
    category: "ai"
  },

  onStart: async function ({ api, event, args }) {
    try {
      const { messageReply, threadID, messageID } = event;

      if (!messageReply?.attachments?.length) {
        return api.sendMessage("❌ Reply to an image.", threadID, messageID);
      }

      const attachment = messageReply.attachments[0];

      if (attachment.type !== "photo") {
        return api.sendMessage("❌ Only image is supported.", threadID, messageID);
      }

      const prompt = args.join(" ") || "improve";
      const imgUrl = attachment.url;


      const imgBuffer = (await axios.get(imgUrl, {
        responseType: "arraybuffer"
      })).data;

      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", imgBuffer, "image.jpg");

      const upload = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders()
      });

      const publicUrl = upload.data.trim();

      api.sendMessage("Processing Your image..🪄", threadID, messageID);

      const apiUrl = `https://sayem-online-project.vercel.app/api/ai/edit?url=${encodeURIComponent(publicUrl)}&prompt=${encodeURIComponent(prompt)}`;

      const res = await axios.get(apiUrl, { timeout: 60000 });

      if (!res.data?.status) {
        return api.sendMessage("❌ API failed.", threadID, messageID);
      }

      const finalImage = res.data.result.image;

      api.sendMessage({
        body: `🪄 Editing Successfully 🪄`,
        attachment: await global.utils.getStreamFromURL(finalImage)
      }, threadID, messageID);

    } catch (err) {
      console.error(err.response?.data || err.message);
      api.sendMessage("❌ Error processing image.", event.threadID, event.messageID);
    }
  }
};
