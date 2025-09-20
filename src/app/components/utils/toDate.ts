import { Timestamp } from "firebase/firestore";

export default function toDate(timestamp: Timestamp) {
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
  );
  return date;
}
