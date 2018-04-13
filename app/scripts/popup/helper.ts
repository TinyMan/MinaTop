import { MinaTopMessage, AddGroupMessage } from "../lib/MessageEvent";

export function sendMessage(message: MinaTopMessage, callback?: (response: any) => void) {
  return chrome.runtime.sendMessage(message, callback);
}

export function addGroup(group: string) {
  sendMessage(new AddGroupMessage(group));
}
(window as any).addGroup = addGroup;
