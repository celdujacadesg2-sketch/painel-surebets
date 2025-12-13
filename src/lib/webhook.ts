import { prisma } from './prisma';
import crypto from 'crypto';

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Send webhook to a specific URL
 */
async function sendWebhook(
  url: string,
  payload: WebhookPayload,
  secret?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const payloadString = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Painel-Surebets-Webhook/1.0',
    };

    // Add signature if secret is provided
    if (secret) {
      headers['X-Webhook-Signature'] = generateSignature(payloadString, secret);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: payloadString,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Webhook delivery error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Trigger all active webhooks for a specific event
 */
export async function triggerWebhooks(event: string, data: any): Promise<void> {
  try {
    // Get all active webhooks that listen to this event
    const webhooks = await prisma.webhook.findMany({
      where: {
        isActive: true,
        events: {
          has: event,
        },
      },
    });

    if (webhooks.length === 0) {
      return;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    // Send webhooks in parallel
    const results = await Promise.allSettled(
      webhooks.map(async (webhook) => {
        const result = await sendWebhook(webhook.url, payload, webhook.secret || undefined);

        // Update webhook statistics
        await prisma.webhook.update({
          where: { id: webhook.id },
          data: {
            lastTriggeredAt: new Date(),
            totalCalls: { increment: 1 },
            failedCalls: result.success ? undefined : { increment: 1 },
          },
        });

        return result;
      })
    );

    // Log results
    results.forEach((result, index) => {
      const webhook = webhooks[index];
      if (result.status === 'fulfilled' && result.value.success) {
        console.log(`✅ Webhook delivered to ${webhook.name} (${webhook.url})`);
      } else {
        const error = result.status === 'fulfilled' 
          ? result.value.error 
          : (result.reason as Error).message;
        console.error(`❌ Webhook failed for ${webhook.name} (${webhook.url}): ${error}`);
      }
    });
  } catch (error) {
    console.error('Error triggering webhooks:', error);
  }
}

/**
 * Verify webhook signature
 * Use this on the receiving end to verify the webhook is authentic
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
