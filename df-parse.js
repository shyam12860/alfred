/**
 * Module for interacting with Dialogflow
 */

const dialogflow = require("dialogflow");

const PROJECT_ID = "alfred-273e2";
const SESSION_ID = "main-session-id";
const LANG = "en-US";

const sessionClient = new dialogflow.SessionsClient();
const SESSION_PATH = sessionClient.sessionPath(PROJECT_ID, SESSION_ID);

/**
 * Given the input text, calls the given callback with the NLP-parsed command
 * and arguments
 */
module.exports = (text, callback) => {
  const input = text.substring(7);
  const request = {
    session: SESSION_PATH,
    queryParams: {
      resetContexts: true,
    },
    queryInput: {
      text: {
        text: input,
        languageCode: LANG,
      },
    },
  };

  sessionClient
    .detectIntent(request)
    .then((responses) => {
      const result = responses[0].queryResult;
      if (result.action === "input.unknown") return callback(false);

      const args = {};
      Object.keys(result.parameters.fields).forEach((key) => {
        args[key] = result.parameters.fields[key].stringValue;
      });
      callback(result.intent.displayName, args);
    })
    .catch((err) => {
      callback(false);
      console.error("ERROR:", err);
    });
};
