const { IncomingWebhook } = require('@slack/webhook');

const WEBHOOK_URL = process.env.WEBHOOK_URL || "";
const webhook = new IncomingWebhook(WEBHOOK_URL);

function buildMessage({ status, logUrl, substitutions = {} }) {
  const repoName = substitutions.REPO_NAME;

  if (!repoName) return null;

  switch (status) {
    case 'QUEUED':
    case 'SUCCESS':
    case 'FAILURE':
    case 'INTERNAL_ERROR':
    case 'TIMEOUT':
    case 'CANCELLED':
      return [
        `${repoName} - ${status}`,
        logUrl
      ].join("\n");
    case 'WORKING':
    default:
      console.log(`${status}: skipped`);
      return null;
  }
}

exports.notifyBuild = async (event, _context, callback) => {
  const dataStr = event.data
    ? Buffer.from(event.data, 'base64').toString()
    : null;

  if (!dataStr) return;

  const data = JSON.parse(dataStr);
  const message = buildMessage(data);

  if (!message) return;

  await webhook.send({ text: message });

  callback();
};
