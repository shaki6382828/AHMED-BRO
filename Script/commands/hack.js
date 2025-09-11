const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

// Command Configuration
module.exports.config = {
    name: "hack",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "𝗦𝗛𝗜𝗙𝗔𝗧",
    description: "Generates a fake 'account hacked' image for fun.",
    commandCategory: "fun",
    usages: "[@mention/leave blank]",
    cooldowns: 5
};

// Text Wrapping Function
async function wrapText(context, text, maxWidth) {
    return new Promise(resolve => {
        if (context.measureText(text).width < maxWidth) {
            return resolve([text]);
        }
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
        // Define paths for temporary files
        const avatarPath = __dirname + "/cache/avatar.png";
        const outputPath = __dirname + "/cache/hack.png";

        // Determine the target user (mentioned user or the command sender)
        const targetID = Object.keys(event.mentions)[0] || event.senderID;

        // Get user's name and profile picture URL
        const userName = await Users.getNameUser(targetID);
        const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const backgroundURL = "https://i.postimg.cc/PqY5t2d9/1665499955431.jpg"; // A reliable background image link

        // Download avatar and background images
        const [avatarResponse, backgroundResponse] = await Promise.all([
            axios.get(avatarURL, { responseType: 'arraybuffer' }),
            axios.get(backgroundURL, { responseType: 'arraybuffer' })
        ]);

        fs.writeFileSync(avatarPath, Buffer.from(avatarResponse.data, "utf-8"));
        
        // Load images into canvas
        const background = await loadImage(Buffer.from(backgroundResponse.data));
        const avatar = await loadImage(avatarPath);

        // Create canvas and context
        const canvas = createCanvas(background.width, background.height);
        const ctx = canvas.getContext("2d");

        // Draw background image
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Draw user's avatar
        ctx.drawImage(avatar, 57, 290, 66, 68);

        // Set font style for the user's name
        ctx.font = "400 23px Arial";
        ctx.fillStyle = "#1878F3"; // Facebook blue color
        ctx.textAlign = "start";

        // Wrap and draw the user's name
        const wrappedName = await wrapText(ctx, userName, 1160);
        ctx.fillText(wrappedName.join("\n"), 136, 335);

        // Save the final image
        const finalImage = canvas.toBuffer();
        fs.writeFileSync(outputPath, finalImage);

        // Send the image and clean up temporary files
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
