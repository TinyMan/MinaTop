export interface Order {
  key?: string;
  group: string;
  author: string;
  authorName: string;
  expiration: number;
  fulfilled: boolean;
  cancelled: boolean;
}
