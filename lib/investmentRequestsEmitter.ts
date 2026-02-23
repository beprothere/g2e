import { EventEmitter } from "events";

declare global {
  var investmentRequestsEmitter: EventEmitter | undefined;
}

export const investmentRequestsEmitter =
  global.investmentRequestsEmitter ?? new EventEmitter();

investmentRequestsEmitter.setMaxListeners(50);

if (!global.investmentRequestsEmitter) {
  global.investmentRequestsEmitter = investmentRequestsEmitter;
}
