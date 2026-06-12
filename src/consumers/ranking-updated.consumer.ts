import type { ConsumeMessage } from 'amqplib';
import type { RankingUpdatedEvent } from '../dtos/ranking-updated-event.dto.js';
import {
  getRabbitChannel,
  getRankingUpdatedQueue,
  getRankingUpdatedRoutingKey,
  setupConsumerQueue,
} from '../messaging/rabbitmq.connection.js';
import { NotificationService } from '../services/notification.service.js';

const notificationService = new NotificationService();

export async function startRankingUpdatedConsumer() {
  const channel = await getRabbitChannel();
  const queue = getRankingUpdatedQueue();
  const routingKey = getRankingUpdatedRoutingKey();

  await setupConsumerQueue(channel, queue, routingKey);

  console.log(`Waiting for ${routingKey} events...`);

  await channel.consume(queue, async (message) => {
    if (!message) {
      return;
    }

    try {
      const event = parseRankingUpdatedEvent(message);

      console.log(`RANKING_UPDATED received for notification: albumId=${event.albumId}`);

      await notificationService.handleRankingUpdated(event);
      channel.ack(message);
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Unexpected ranking updated notification consumer error.');
      channel.nack(message, false, false);
    }
  });
}

function parseRankingUpdatedEvent(message: ConsumeMessage): RankingUpdatedEvent {
  let payload: unknown;

  try {
    payload = JSON.parse(message.content.toString('utf8'));
  } catch {
    throw new Error('Invalid JSON message received.');
  }

  if (!isRankingUpdatedEvent(payload)) {
    throw new Error('Unexpected RANKING_UPDATED event received.');
  }

  return payload;
}

function isRankingUpdatedEvent(payload: unknown): payload is RankingUpdatedEvent {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const event = payload as Partial<RankingUpdatedEvent>;

  return (
    event.event === 'RANKING_UPDATED' &&
    typeof event.albumId === 'string' &&
    typeof event.occurredAt === 'string'
  );
}
