import { PersistentWebsocket } from "persistent-websocket";
import { log } from "@/helpers/log";

let WsScanner;

try {
  log.step('Открываем соединение со сканером по WebSocket')
  
  const ws = 'ws://127.0.0.1:64808';
  WsScanner = new PersistentWebsocket(ws);
  
  WsScanner.disable = () => {
    WsScanner.onmessage = () => {}
  }
  
  WsScanner.open()
  
} catch (e) {
  log.error(e)
}

export {
  WsScanner
}