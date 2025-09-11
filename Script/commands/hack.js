const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

// Command Configuration
module.exports.config = {
    name: "hack",
    version: "1.2.0", // Updated version
    hasPermssion: 0,
    credits: "𝐒𝐡𝐢𝐟𝐚𝐭",
    description: "Generates a fake 'account hacked' image for fun.",
    commandCategory: "fun",
    usages: "[@mention/leave blank]",
    cooldowns: 5
};

// Text Wrapping Function
async function wrapText(context, text, maxWidth) {
    return new Promise(resolve => {
        if (context.measureText(text).width < maxWidth) return resolve([text]);
        const words = text.split(" ");
        const lines = [];
        let currentLine = "";
        while (words.length > 0) {
            let word = words.shift();
            let testLine = currentLine + word + " ";
            if (context.measureText(testLine).width > maxWidth) {
                lines.push(currentLine.trim());
                currentLine = word + " ";
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine.trim());
        return resolve(lines);
    });
}

// Main Command Logic
module.exports.run = async function({ api, event, Users }) {
    try {
        const avatarPath = __dirname + "/cache/avatar.png";
        const outputPath = __dirname + "/cache/hack.png";

        const targetID = Object.keys(event.mentions)[0] || event.senderID;

        const userName = await Users.getNameUser(targetID);
        
        // --- THIS IS THE FIXED PART ---
        // Removed the invalid access_token for more reliability
        const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=720&height=720`; 
        const backgroundURL = "https://i.postimg.cc/PqY5t2d9/1665499955431.jpg";

        const [avatarResponse, backgroundResponse] = await Promise.all([
            axios.get(avatarURL, { responseType: 'arraybuffer' }),
            axios.get(backgroundURL, { responseType: 'arraybuffer' })
        ]);

        fs.writeFileSync(avatarPath, Buffer.from(avatarResponse.data, "utf-8"));
        
        const background = await loadImage(Buffer.from(backgroundResponse.data));
        const avatar = await loadImage(avatarPath);

        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(avatar, 57, 290, 66, 68);

        ctx.font = "400 23px Arial";
        ctx.fillStyle = "#1878F3";
        ctx.textAlign = "start";

        const wrappedName = await wrapText(ctx, userName, 1160);
        ctx.fillText(wrappedName.join("\n"), 136, 335);

        const finalImage = canvas.toBuffer();
        fs.writeFileSync(outputPath, finalImage);

        return api.sendMessage({
            body: `⚠️ Alert! Account of **${userName}** seems to be compromised! 😱`,
            attachment: fs.createReadStream(outputPath)
        }, event.threadID, () => {
            fs.unlinkSync(avatarPath);
            fs.unlinkSync(outputPath);
        }, event.messageID);

    } catch (error) {
        console.error("Error in hack command:", error);
        return api.sendMessage("❌ Something went wrong. Please try again later.", event.threadID, event.messageID);
    }
};
