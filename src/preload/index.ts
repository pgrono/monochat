import { contextBridge, ipcRenderer } from "electron";
import type { API, Command, Snapshot } from "../shared/model.js";
const api: API = {
  command: (command: Command) => ipcRenderer.invoke("monochat:command", command),
  subscribe: (callback: (snapshot: Snapshot) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, snapshot: Snapshot) => callback(snapshot);
    ipcRenderer.on("monochat:state", listener);
    return () => { ipcRenderer.removeListener("monochat:state", listener); };
  },
  shortcut: (callback: (action: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, action: string) => callback(action);
    ipcRenderer.on("monochat:shortcut", listener);
    return () => { ipcRenderer.removeListener("monochat:shortcut", listener); };
  }
};
contextBridge.exposeInMainWorld("monochat", Object.freeze(api));
