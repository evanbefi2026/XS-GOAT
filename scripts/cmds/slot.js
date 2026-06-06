module.exports = {
  config: {
    name: "slot",
    version: "3.4",
    author: "S AY EM",
    role: 0,
    shortDescription: "Slot Machine",
    category: "game",
    guide: "-slot <amount>"
  },

  onStart: async function ({ api, event, args, usersData }) {

    const { threadID, messageID, senderID } = event;

    if (!args[0])
      return api.sendMessage("❌ | Enter bet amount.", threadID, messageID);

    const bet = parseBet(args[0]);

    const minBet = 500;
    const maxBet = 2000000000000;

    if (bet < minBet)
      return api.sendMessage("❌ | Minimum bet is 500.", threadID, messageID);

    if (bet > maxBet)
      return api.sendMessage("❌ | Maximum bet is 200B.", threadID, messageID);

    let userData = await usersData.get(senderID);

    let balance = userData.money || 0;
    const oldBalance = balance;

    userData.data = userData.data || {};

    let spins = userData.data.spins || 0;
    let cooldown = userData.data.slotCooldown || 0;

    const maxSpins = 100;
    const cooldownTime = 60 * 60 * 1000;
    const now = Date.now();

    if (cooldown > now) {
      const left = Math.ceil((cooldown - now) / 60000);
      return api.sendMessage(`⏳ | Wait ${left} minutes to play again.`, threadID, messageID);
    }

    if (cooldown !== 0 && cooldown <= now) {
      spins = 0;
      cooldown = 0;
    }

    if (spins >= maxSpins) {
      userData.data.spins = 0;
      userData.data.slotCooldown = now + cooldownTime;
      await usersData.set(senderID, userData);
      return api.sendMessage("⏳ | You reached 100 spins. Wait 1 hour.", threadID, messageID);
    }

    if (balance < bet)
      return api.sendMessage("❌ | Not enough balance.", threadID, messageID);

    spins++;
    userData.data.spins = spins;
    userData.data.slotCooldown = spins >= maxSpins ? now + cooldownTime : 0;

    await usersData.set(senderID, userData);

    const left = maxSpins - spins;

    const icons = ["💦","🎀","✨","🥀","🐥","🐍","🦆"];

    let slots = [];
    let maxMatch = 0;

    const chance = Math.random();

    if (chance < 0.10) {
      const icon = icons[Math.floor(Math.random()*icons.length)];
      slots = [icon,icon,icon,icon,icon];
      maxMatch = 5;
    }

    else if (chance < 0.40) {
      const icon = icons[Math.floor(Math.random()*icons.length)];
      slots = [icon,icon,icon,icon,icons[Math.floor(Math.random()*icons.length)]];
      maxMatch = 4;
    }

    else if (chance < 0.75) {
      const icon = icons[Math.floor(Math.random()*icons.length)];
      slots = [icon,icon,icon,icons[Math.floor(Math.random()*icons.length)],icons[Math.floor(Math.random()*icons.length)]];
      maxMatch = 3;
    }

    else {
      for (let i=0;i<5;i++){
        slots.push(icons[Math.floor(Math.random()*icons.length)]);
      }
      const count = {};
      slots.forEach(i => count[i] = (count[i] || 0) + 1);
      maxMatch = Math.max(...Object.values(count));
    }

    let reward = 0;
    let result;
    let amountText;
    let tipText;

    if (maxMatch === 5) {
      reward = bet * 5;
      result = "🔥 JACKPOT WIN 🔥";
      tipText = "Legendary spin!";
    }

    else if (maxMatch === 4) {
      reward = bet * 3;
      result = "🎉 BIG WIN 🎉";
      tipText = "Great! 4 matched!";
    }

    else if (maxMatch === 3) {
      reward = bet * 2;
      result = "✅ WIN";
      tipText = "Nice spin!";
    }

    else {
      reward = -bet;
      result = "❌ LOSE";
      tipText = "Better luck next time!";
    }

    const newBalance = balance + reward;

    function randomSpin() {
      let arr = [];
      for (let i = 0; i < 5; i++) {
        arr.push(icons[Math.floor(Math.random()*icons.length)]);
      }
      return arr.join(" ┃ ");
    }

    const spinMsg = `
╔═══════════════════╗
       🎰 SLOT MACHINE
╚═══════════════════╝

❰ ${randomSpin()} ❱

━━━━━━━━━━━━━━━━━━
🎯 RESULT: 🎲 Spinning...

💰 BALANCE: $${formatMoney(oldBalance)}

🎲 Spins: ${spins}/100 | ${left} left
━━━━━━━━━━━━━━━━━━
`;

    api.sendMessage(spinMsg, threadID, async (err, info) => {

      const id = info.messageID;

      let frame = 0;

      const spin = () => {

        frame++;

        if (frame >= 5) {

          usersData.set(senderID, {
            ...userData,
            money: newBalance
          });

          amountText = reward > 0
            ? `🟢 WON: $${formatMoney(reward)}`
            : `🔴 LOST: $${formatMoney(Math.abs(reward))}`;

          const finalMsg = `
╔═══════════════════╗
       🎰 SLOT MACHINE
╚═══════════════════╝

❰ ${slots.join(" ┃ ")} ❱

━━━━━━━━━━━━━━━━━━
🎯 RESULT: ${result}

${amountText}
💰 BALANCE: $${formatMoney(newBalance)}

💡 ${tipText}
🎲 Spins: ${spins}/100 | ${left} left
━━━━━━━━━━━━━━━━━━
`;

          return api.editMessage(finalMsg, id);
        }

        const frameMsg = spinMsg.replace(/❰.*❱/, `❰ ${randomSpin()} ❱`);

        api.editMessage(frameMsg, id);

        setTimeout(spin, 700);
      };

      setTimeout(spin, 700);

    }, messageID);

  }
};

function parseBet(input){
  input = input.toLowerCase();
  if (input.endsWith("k")) return parseFloat(input)*1000;
  if (input.endsWith("m")) return parseFloat(input)*1000000;
  if (input.endsWith("b")) return parseFloat(input)*1000000000;
  return parseInt(input);
}

function formatMoney(num){
  if (num >= 1000000000000) return (num/1000000000000).toFixed(2)+"T";
  if (num >= 1000000000) return (num/1000000000).toFixed(2)+"B";
  if (num >= 1000000) return (num/1000000).toFixed(2)+"M";
  if (num >= 1000) return (num/1000).toFixed(2)+"K";
  return num;
}
