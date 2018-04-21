import { MinaTopMessage, AddGroupMessage } from "../lib/MessageEvent";

export function sendMessage(message: MinaTopMessage, callback?: (response: any) => void) {
  return chrome.runtime.sendMessage(message, callback);
}

export function addGroup(group: string) {
  sendMessage(new AddGroupMessage(group));
}
(window as any).addGroup = addGroup;

function component(x, v) {
  return Math.floor(x / v);
}

export function getClassTimeRemaining(expiration: number) {
  const timeRemaining = (expiration - Date.now()) / 1000;
  if (timeRemaining > 60 * 60)
    return 'remaining-hours';
  else if (timeRemaining > 60 * 10)
    return 'remaining-minutes';
  else if (timeRemaining > 60)
    return 'remaining-seconds'
  else if (timeRemaining <= 0)
    return 'remaining-expired';
  else return 'remaining-imminent';
}

export function getTimeRemaining(expiration: number) {
  const timestamp = (expiration - Date.now()) / 1000;
  let days = component(timestamp, 24 * 60 * 60),      // calculate days from timestamp
    hours = component(timestamp, 60 * 60) % 24, // hours
    minutes = component(timestamp, 60) % 60, // minutes
    seconds = component(timestamp, 1) % 60; // seconds

  return {
    days, hours, minutes, seconds, msDiff: timestamp
  }
}

export function leadingZero(n: number, size = 2): string {
  var s = "000000000" + n;
  return s.substr(s.length - size);
}

export function pluralize(text: string) {
  return text.replace(/(\w+) ?/g, '$1s ').trim();
}

export function openOptions() {
  chrome.runtime.openOptionsPage();
}
