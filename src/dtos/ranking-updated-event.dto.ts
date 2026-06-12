export interface RankingUpdatedEvent {
  event: 'RANKING_UPDATED';
  albumId: string;
  albumName?: string;
  artistName?: string;
  averageRating?: number;
  totalRatings?: number;
  position?: number;
  occurredAt: string;
}
