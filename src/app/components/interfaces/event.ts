import { Timestamp } from "firebase/firestore";

export interface EventInterface {
  id: string;
  description: string;
  isSoldOut: boolean;
  location: string;
  price: number;
  src: string;
  sub_title: string;
  ticket: number;
  timestamp: Timestamp;
  title: string;
  closeTime: Timestamp;
}
