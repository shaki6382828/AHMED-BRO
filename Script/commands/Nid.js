module.exports.config = {
  name: "nid",
  version: "1.0.0",
  hasPermission: 0,
  credits: "SIFAT (VIP Demo)",
  description: "🔍 মোবাইল নাম্বার দিয়ে ফেইক NID তথ্য দেখুন (VIP স্টাইল)",
  commandCategory: "🔐 তথ্য",
  usages: "/nid [phone number]",
  cooldowns: 3,
};

module.exports.run = async function ({ api, event, args }) {
  const number = args[0];
  if (!number) {
    return api.sendMessage(
      "❌ *একটি মোবাইল নম্বর প্রদান করুন!*\n\n📥 উদাহরণ:\n`/nid 0171××××××4`",
      event.threadID,
      event.messageID
    );
  }

  // ফেইক ভিআইপি ডেটা
  const fakeData = {
    name: "🔱 sifat",
    nid: "🆔 1990112345678",
    mobile: number,
    dob: "📅 ১৫ ফেব্রুয়ারি ১৯৯০",
    address: "🏠 খুলনা সদর, খুলনা"
  };

  const line = "━━━━━━━━━━━━━━━━━━━━━━";
  const message = `✨ 𝐕𝐈𝐏 জাতীয় পরিচয়পত্র তথ্য ✨\n${line}\n\n👤 নাম: ${fakeData.name}\n🪪 NID নম্বর: ${fakeData.nid}\n📞 মোবাইল: ${fakeData.mobile}\n📍 ঠিকানা: ${fakeData.address}\n🎂 জন্ম তারিখ: ${fakeData.dob}\n\n${line}\n🔐 তথ্যটি শুধুমাত্র ডেমো ভেরিফিকেশনের জন্য!`;

  api.sendMessage(message, event.threadID, event.messageID);
};
