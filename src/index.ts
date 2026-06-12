import 'dotenv/config';
import { startAlbumRatedConsumer } from './consumers/album-rated.consumer.js';
import { startRankingUpdatedConsumer } from './consumers/ranking-updated.consumer.js';
import { startUserFollowedConsumer } from './consumers/user-followed.consumer.js';
import { startHttpServer } from './http/server.js';

async function bootstrap() {
  console.log('clube-do-album-notification-worker initialized');
  console.log('Notification worker started');

  startHttpServer();
  await startAlbumRatedConsumer();
  await startUserFollowedConsumer();
  await startRankingUpdatedConsumer();
}

bootstrap().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Failed to start notification worker.');
  process.exit(1);
});
