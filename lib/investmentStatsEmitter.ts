import { EventEmitter } from "events";
declare global {
  // eslint-disable-next-line no-var
  var investmentStatsEmitter: EventEmitter | undefined;
}

export const investmentStatsEmitter =
  global.investmentStatsEmitter ??
  new EventEmitter();

investmentStatsEmitter.setMaxListeners(50);

if (!global.investmentStatsEmitter) {
  global.investmentStatsEmitter = investmentStatsEmitter;
}
