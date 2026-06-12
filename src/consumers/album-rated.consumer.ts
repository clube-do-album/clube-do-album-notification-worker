import type { ConsumeMessage } from 'amqplib';
import type { AlbumRatedEvent } from '../dtos/album-rated-event.dto.js';
import {
  getAlbumRatedQueue,
  getAlbumRatedRoutingKey,
  getRabbitChannel,
  setupConsumerQueue,
} from '../messaging/rabbitmq.connection.js';
import { NotificationService } from '../services/notification.service.js';

const notificationService = new NotificationService();

export async function startAlbumRatedConsumer() {
  const channel = await getRabbitChannel();
  const queue = getAlbumRatedQueue();
  const routingKey = getAlbumRatedRoutingKey();

  await setupConsumerQueue(channel, queue, routingKey);

  console.log(`Waiting for ${routingKey} events...`);

  await channel.consume(queue, async (message) => {
    if (!message) {
      return;
    }

    try {
      const event = parseAlbumRatedEvent(message);

      console.log(`ALBUM_RATED received for notification: albumId=${event.albumId}, userId=${event.userId}`);

      await notificationService.handleAlbumRated(event);
      channel.ack(message);
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Unexpected album rated notification consumer error.');
      channel.nack(message, false, false);
    }
  });
}

function parseAlbumRatedEvent(message: ConsumeMessage): AlbumRatedEvent {
  let payload: unknown;

  try {
    payload = JSON.parse(message.content.toString('utf8'));
  } catch {
    throw new Error('Invalid JSON message received.');
  }

  if (!isAlbumRatedEvent(payload)) {
    throw new Error('Unexpected ALBUM_RATED event received.');
  }

  return payload;
}

function isAlbumRatedEvent(payload: unknown): payload is AlbumRatedEvent {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const event = payload as Partial<AlbumRatedEvent>;

  return (
    event.event === 'ALBUM_RATED' &&
    typeof event.albumId === 'string' &&
    typeof event.userId === 'string' &&
    typeof event.rating === 'number' &&
    event.rating >= 0.5 &&
    event.rating <= 5 &&
    typeof event.occurredAt === 'string'
  );
}
