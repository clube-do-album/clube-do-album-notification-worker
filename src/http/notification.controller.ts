import { Router } from 'express';
import { NotificationService } from '../services/notification.service.js';

const notificationService = new NotificationService();

export const notificationRouter = Router();

notificationRouter.get('/notifications', async (request, response, next) => {
  try {
    const userId = resolveUserId(request);
    const limit = normalizeLimit(request.query.limit);
    const unreadOnly = request.query.unread === 'true';
    const notifications = await notificationService.listByRecipient(userId, limit, unreadOnly);

    response.json(notifications);
  } catch (error) {
    next(error);
  }
});

notificationRouter.get('/notifications/unread-count', async (request, response, next) => {
  try {
    const userId = resolveUserId(request);
    const result = await notificationService.countUnread(userId);

    response.json(result);
  } catch (error) {
    next(error);
  }
});

notificationRouter.patch('/notifications/:id/read', async (request, response, next) => {
  try {
    const userId = resolveUserId(request);
    const result = await notificationService.markAsRead(request.params.id, userId);

    response.json(result);
  } catch (error) {
    next(error);
  }
});

notificationRouter.patch('/notifications/read-all', async (request, response, next) => {
  try {
    const userId = resolveUserId(request);
    const result = await notificationService.markAllAsRead(userId);

    response.json(result);
  } catch (error) {
    next(error);
  }
});

function resolveUserId(request: { header: (name: string) => string | undefined; query: Record<string, unknown> }) {
  const headerUserId = request.header('x-user-id')?.trim();
  const queryUserId = typeof request.query.userId === 'string' ? request.query.userId.trim() : '';
  const userId = headerUserId || queryUserId;

  if (!userId) {
    const error = new Error('X-User-Id header or userId query parameter is required.');
    error.name = 'BadRequestError';
    throw error;
  }

  return userId;
}

function normalizeLimit(value: unknown): number {
  if (typeof value !== 'string') {
    return 20;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 20;
  }

  return Math.min(parsed, 100);
}
