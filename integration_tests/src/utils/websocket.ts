import { WebSocket } from "ws";
import { WsEvents } from "./enum";

export function processMessage(message: object) {
  let decodedMessage = {};
  try {
    decodedMessage = JSON.parse(message.toString()) || {};
  } catch (err) {
    console.info(`Cannot parse message`);
    return;
  }

  return decodedMessage;
}

export async function handleMessageEvent(ws: WebSocket): Promise<object> {
  return new Promise((resolve) => {
    ws.on(WsEvents.MESSAGE, (message) => {
      resolve(processMessage(message));
    });
  });
}

export function sendEvent(ws: WebSocket, messageType, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ event: messageType, data: message }));
  }
}
