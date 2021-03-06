/**
 * Module for sending messages to Slack
 */

const request = require("request");
const Users = require("../users");
const private = require("../private");

module.exports.sendBasicMessage = (message) => {
  sendMessage({ text: message });
};

const atUser = username => {
  const u = Users.getUser(username);
  return u.slackId ? `<@${u.slackId}>` : `@${username}`;
}
module.exports.atUser = atUser;

// Formats the given stats
module.exports.statsFormatter = (stats) => {
  const dollarStats = `Total spent: $${stats.dollars.toFixed(2)}\n\n`;

  let callStats = "";
  if (stats.calls) {
    callStats = `Total calls received: ${stats.calls}\n\n`;
  }

  let dishStats = "  None";
  if (stats.dishes.length > 0) {
    formattedDishes= stats.dishes.map((d) => {
      const rest = d.restaurant ? ` from ${d.restaurant}` : "";
      return `  ${d.count} of "${d.itemName}"${rest}`;
    });
    dishStats = `Top dishes:\n${formattedDishes.join("\n")}`;
  }
  const otherMessage = Math.random() > 0.8 ? "\n\nWant other stats? Message Ajay!" : "";
  return `\`\`\`${dollarStats}${callStats}${dishStats}${otherMessage}\`\`\``;
};

/**
 * Format of parts:
 *
 * [
 *   {
 *     successful: bool,
 *     restaurant: string,
 *     user: string,
 *     confirmationUrl: string,
 *   },
 *   ...
 * ],
 */
module.exports.sendFinishedMessage = (parts) => {
  const attachments = parts.map((part) => {
    const attachment = {
      color: part.successful ? "good" : "danger",
    };

    if (part.successful) {
      attachment.title = part.restaurant;
      attachment.title_link = part.confirmationUrl;
      attachment.text = `${atUser(part.user)} will receive the call.`;
    } else {
      attachment.title = `${part.restaurant} (failed)`;
      attachment.text = part.errors.join("\n");
    }
    return attachment;
  });

  const { dailyPassword } = require("../private");

  sendMessage({
    text: [
      "Alfred ordered from the following restaurants for delivery at 5:30pm.",
      `Today's password is \`${dailyPassword}\`.`,
    ].join("\n"),
    attachments,
  });
};


const sendMessage = (contents) => {
  contents.channel = "#ot-test-ram",
  request({
    url: private.slackOutgoingUrl,
    method: "POST",
    json: contents,
  },
  (err, response, body) => {
    if (response.statusCode !== 200) {
      console.log("Message send failed");
      console.log(err, body);
    }
  });
};
