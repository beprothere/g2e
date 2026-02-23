import { EventEmitter } from "events";

export const planEmitter = new EventEmitter();

// Node default limit kam hoti hai, is liye increase
planEmitter.setMaxListeners(100);
