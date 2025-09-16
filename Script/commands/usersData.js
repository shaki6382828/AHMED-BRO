const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "usersData.json");

// যদি ফাইল না থাকে নতুন বানাও
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify({}), "utf8");
}

function readData() {
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf8");
}

module.exports = {
  get: function (uid) {
    const data = readData();
    if (!data[uid]) {
      data[uid] = { coins: 0, exp: 0 };
      writeData(data);
    }
    return data[uid];
  },

  addCoins: function (uid, amount) {
    const data = readData();
    if (!data[uid]) data[uid] = { coins: 0, exp: 0 };
    data[uid].coins += amount;
    writeData(data);
    return data[uid].coins;
  },

  addExp: function (uid, amount) {
    const data = readData();
    if (!data[uid]) data[uid] = { coins: 0, exp: 0 };
    data[uid].exp += amount;
    writeData(data);
    return data[uid].exp;
  }
};
