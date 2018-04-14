export interface Order {
  key?: string;
  author: string;
  expiration: number;
  fulfilled: boolean;
}
