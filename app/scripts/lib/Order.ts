export interface Order {
  key?: string;
  group: string;
  author: string;
  expiration: number;
  fulfilled: boolean;
  cancelled: boolean;
}
