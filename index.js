const fs = require("fs");
const { server } = require("./server.js");
const login = require("fca-unofficial");
const { OpenAIApi, Configuration } = require("openai");

let msgs = {};
let vips = ["", "", ""]; //FB USER ID FOR VIPS
let cd = {};

const prefix = "/";
const bot = "Jordi";

const openaiConfig = new Configuration({
  apiKey: process.env.API_KEY,
});

const openai = new OpenAIApi(openaiConfig);

login(
  { appState: JSON.parse(fs.readFileSync("fbappstate.json", "utf8")) },
  (err, api) => {
    if (err) return console.error(err);
    api.setOptions({
      listenEvents: true,
      selfListen: true,
    });
    const listenEmitter = api.listen(async (err, event) => {
      if (err) return console.error(err);
      const earl = event.body;
      const args = earl.split(" ");

      if (earl.startsWith(prefix + "ask")) {
        const userID = event.senderID;
        const isVip = vips.includes(userID);
        const cooldownTime = isVip ? 0 : 180000; // COOLDOWN TIME
        const lastTime = cd[userID] || 0;
        const now = Date.now();
        const timeSinceLast = now - lastTime;
        if (timeSinceLast < cooldownTime) {
          const remainingTime = Math.ceil(
            (cooldownTime - timeSinceLast) / 60000
          );
          api.sendMessage(
            `Please wait ${remainingTime} minute(s) before asking another question.😸`, // REMAINING TIME
            event.threadID
          );
          return;
        }
        cd[userID] = now;
        api.setMessageReaction("😸", event.messageID, (err) => {}, true);
        if (args.length < 2) {
          api.sendMessage(
            "Invalid command!\n\nCommand: /ask <ask anything>",
            event.threadID
          );
        } else {
          try {
            const completion = await openai.createCompletion({
              model: "text-davinci-003",
              prompt: args.slice(1).join(" "),
              temperature: 0.7,
              max_tokens: 3000,
              top_p: 0.3,
              frequency_penalty: 0.5,
              presence_penalty: 0.0,
            });
            api.sendMessage(
              completion.data.choices[0].text,
              event.threadID,
              event.messageID
            );
          } catch (error) {
            if (error.response) {
              console.log(error.response.status);
              console.log(error.response.data);
            } else {
              console.log(error.message);
              api.sendMessage(error.message, event.threadID);
            }
          }
        }
      }
    });
  }
);
