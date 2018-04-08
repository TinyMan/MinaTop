import { MinaTopMessage } from "../lib/MessageEvent";

export function sendMessage(message: MinaTopMessage, callback?: (response: any) => void) {
  return chrome.runtime.sendMessage(message, callback);
}
