/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler deploy src/index.ts --name my-worker` to deploy your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
}

import PostalMime from 'postal-mime';
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler deploy src/index.ts --name my-worker` to deploy your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
}

const slackSuccess = async (sender: string, recipient: string, subject: string, response: any) => {
  await fetch('https://hooks.slack.com/services/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', {
    method: 'POST',
    headers: {
      'Content-Type': 'application-json',
    },
    body: JSON.stringify({
      text: `Email successfully processed:\n
      - Sender: ${sender}\n
      - Recipient: ${recipient}\n
      - Subject: ${subject}\n
      - Structured Data: \`\`\`${JSON.stringify(await response.json())}\`\`\``
    })
  });
}

const slackError = async (sender: string, recipient: string, error: any) => {
  console.error('Error processing email: ', error.toString());
  await fetch('https://hooks.slack.com/services/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', {
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
      await slackSuccess(sender, recipient, email.subject ?? '[No Subject]', response);

    } catch (error: any) {
      console.error('Error processing email:', error.toString());
      await slackError(sender, recipient, error);
    }
  },
};
