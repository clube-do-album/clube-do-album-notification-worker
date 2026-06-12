import { NotificationType } from '@prisma/client';
import type { AlbumRatedEvent } from '../dtos/album-rated-event.dto.js';
import type { RankingUpdatedEvent } from '../dtos/ranking-updated-event.dto.js';
import type { UserFollowedEvent } from '../dtos/user-followed-event.dto.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import { CatalogClientService } from './catalog-client.service.js';
import { IdentityClientService } from './identity-client.service.js';

const notificationRepository = new NotificationRepository();
const identityClientService = new IdentityClientService();
const catalogClientService = new CatalogClientService();

export class NotificationService {
  listByRecipient(recipientUserId: string, limit: number, onlyUnread: boolean) {
    return notificationRepository.listByRecipient(recipientUserId, limit, onlyUnread);
  }

  async countUnread(recipientUserId: string) {
    return {
      unread: await notificationRepository.countUnread(recipientUserId),
    };
  }

  async markAsRead(id: string, recipientUserId: string) {
    const result = await notificationRepository.markAsRead(id, recipientUserId);

    return {
      updated: result.count,
    };
  }

  async markAllAsRead(recipientUserId: string) {
    const result = await notificationRepository.markAllAsRead(recipientUserId);

    return {
      updated: result.count,
    };
  }

  async handleUserFollowed(event: UserFollowedEvent): Promise<void> {
    const occurredAt = parseOccurredAt(event.occurredAt, 'USER_FOLLOWED');
    const follower = await identityClientService.findUserById(event.followerId);
    const followerName = follower?.name ?? shortId(event.followerId);

    const notification = await notificationRepository.create({
      type: NotificationType.USER_FOLLOWED,
      recipientUserId: event.followedId,
      actorUserId: event.followerId,
      title: 'Novo seguidor',
      message: `${followerName} comecou a seguir voce.`,
      metadata: {
        followerId: event.followerId,
        followedId: event.followedId,
      },
      occurredAt,
    });

    console.log(`Notification created for USER_FOLLOWED: ${notification.id}`);
  }

  async handleAlbumRated(event: AlbumRatedEvent): Promise<void> {
    const occurredAt = parseOccurredAt(event.occurredAt, 'ALBUM_RATED');
    const album = await catalogClientService.findAlbumById(event.albumId);
    const albumName = album?.name ?? shortId(event.albumId);
    const artistName = album?.artistName ? ` de ${album.artistName}` : '';

    const notification = await notificationRepository.create({
      type: NotificationType.ALBUM_RATED,
      recipientUserId: event.userId,
      actorUserId: event.userId,
      albumId: event.albumId,
      title: 'Avaliacao registrada',
      message: `Sua avaliacao de ${albumName}${artistName} foi registrada com nota ${event.rating}.`,
      metadata: {
        albumId: event.albumId,
        rating: event.rating,
      },
      occurredAt,
    });

    console.log(`Notification created for ALBUM_RATED: ${notification.id}`);
  }

  async handleRankingUpdated(event: RankingUpdatedEvent): Promise<void> {
    const occurredAt = parseOccurredAt(event.occurredAt, 'RANKING_UPDATED');
    const album = event.albumName
      ? { name: event.albumName, artistName: event.artistName }
      : await catalogClientService.findAlbumById(event.albumId);
    const albumName = album?.name ?? shortId(event.albumId);

    const notification = await notificationRepository.create({
      type: NotificationType.RANKING_UPDATED,
      recipientUserId: 'system',
      albumId: event.albumId,
      title: 'Ranking atualizado',
      message: `${albumName} teve o ranking atualizado.`,
      metadata: {
        albumId: event.albumId,
        averageRating: event.averageRating,
        totalRatings: event.totalRatings,
        position: event.position,
      },
      occurredAt,
    });

    console.log(`Notification created for RANKING_UPDATED: ${notification.id}`);
  }
}

function parseOccurredAt(value: string, eventName: string): Date {
  const occurredAt = new Date(value);

  if (Number.isNaN(occurredAt.getTime())) {
    throw new Error(`Invalid occurredAt received in ${eventName} event.`);
  }

  return occurredAt;
}

function shortId(value: string) {
  return value.length > 12 ? `${value.slice(0, 8)}...` : value;
}
