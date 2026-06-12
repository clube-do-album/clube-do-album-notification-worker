import { Prisma, type NotificationType } from '@prisma/client';
import { prisma } from '../config/prisma.js';

interface CreateNotificationData {
  type: NotificationType;
  recipientUserId: string;
  actorUserId?: string;
  albumId?: string;
  title: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
  occurredAt: Date;
}

export class NotificationRepository {
  listByRecipient(recipientUserId: string, limit: number, onlyUnread: boolean) {
    return prisma.notification.findMany({
      where: {
        recipientUserId,
        readAt: onlyUnread ? null : undefined,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  countUnread(recipientUserId: string) {
    return prisma.notification.count({
      where: {
        recipientUserId,
        readAt: null,
      },
    });
  }

  markAsRead(id: string, recipientUserId: string) {
    return prisma.notification.updateMany({
      where: {
        id,
        recipientUserId,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  markAllAsRead(recipientUserId: string) {
    return prisma.notification.updateMany({
      where: {
        recipientUserId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  create(data: CreateNotificationData) {
    return prisma.notification.upsert({
      where: {
        type_recipientUserId_actorUserId_albumId_occurredAt: {
          type: data.type,
          recipientUserId: data.recipientUserId,
          actorUserId: data.actorUserId ?? '',
          albumId: data.albumId ?? '',
          occurredAt: data.occurredAt,
        },
      },
      create: {
        type: data.type,
        recipientUserId: data.recipientUserId,
        actorUserId: data.actorUserId ?? '',
        albumId: data.albumId ?? '',
        title: data.title,
        message: data.message,
        metadata: data.metadata,
        occurredAt: data.occurredAt,
      },
      update: {
        title: data.title,
        message: data.message,
        metadata: data.metadata,
      },
    });
  }
}
