// /cf-worker/src/index.ts
import PostalMime from 'postal-mime';

export interface Env {
  SLACK_WEBHOOK_URL: string;
}

const slackSuccess = async (webhookUrl: string, sender: string, recipient: string, subject: string, response: any) => {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application-json',
    },
    body: JSON.stringify({
      text: `Email processing initiated:\n
      - Sender: ${sender}\n
      - Recipient: ${recipient}\n
      - Subject: ${subject}\n
      - Response: \`\`\`${JSON.stringify(await response.json())}\`\`\``
    })
  });
}

const slackError = async (webhookUrl: string, sender: string, recipient: string, error: any) => {
  console.error('Error processing email: ', error.toString());
  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application-json',
    },
    body: JSON.stringify({
      text: `Error processing email:\n
      - Sender: ${sender}\n
      - Recipient: ${recipient}\n
      - Error: ${error.toString()}`
    })
  });
}

export default {
  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext) {
    // Assuming this Worker is triggered by incoming emails.
    // Convert the Request into the expected email message format.
    const recipient = message.to;
    const sender = message.from;
    const parser = new PostalMime();
    const email = await parser.parse(message.raw);

    // Define the email data according to your Email model.
    const emailData = {
      sender,
      recipient,
      subject: email.subject,
      body: email.html || email.text,
      receivedAt: new Date().toISOString(), // Current timestamp as the received time.
      assistantId: 'asst_uJCTAaXnBqTDzMG2FfgwJEtJ',
      assistantThreadId: null,
    };

    // Define the endpoint URL for your `email-to-rfq.ts` API.
    const apiEndpoint = 'https://mq.kdk.dev/api/email-to-rfq';

    try {
      // Attempt to forward the email content to your `email-to-rfq.ts` API.
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      // Check if the API call was successful.
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      // Notify the Slack channel about the successful email processing.
      await slackSuccess(env.SLACK_WEBHOOK_URL, sender, recipient, email.subject ?? '[No Subject]', response);

    } catch (error: any) {
      console.error('Error processing email:', error.toString());
      await slackError(env.SLACK_WEBHOOK_URL, sender, recipient, error);
    }
  },
};
