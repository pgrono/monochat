import type { ServiceId } from "../shared/model.js";
export interface Adapter { name: string; url: string; hosts: readonly string[]; symbol: string }
export const adapters: Record<ServiceId, Adapter> = {
  whatsapp: { name: "WhatsApp", url: "https://web.whatsapp.com/", hosts: ["web.whatsapp.com"], symbol: "W" },
  messenger: { name: "Messenger", url: "https://www.facebook.com/messages/", hosts: ["www.facebook.com", "facebook.com", "m.facebook.com", "web.facebook.com", "messenger.com", "www.messenger.com", "accountscenter.facebook.com"], symbol: "M" },
  "google-messages": { name: "Wiadomości Google", url: "https://messages.google.com/web/", hosts: ["messages.google.com", "accounts.google.com", "myaccount.google.com"], symbol: "G" },
  instagram: { name: "Instagram Direct", url: "https://www.instagram.com/direct/inbox/", hosts: ["www.instagram.com", "instagram.com", "www.facebook.com", "m.facebook.com", "accountscenter.instagram.com", "accountscenter.facebook.com"], symbol: "I" },
  slack: { name: "Slack", url: "https://slack.com/signin", hosts: ["slack.com", "accounts.google.com", "appleid.apple.com", "login.microsoftonline.com", "login.live.com"], symbol: "S" },
  gmail: { name: "Gmail", url: "https://mail.google.com/mail/u/0/", hosts: ["mail.google.com", "accounts.google.com", "myaccount.google.com"], symbol: "G" }
};
export function serviceUserAgent(service: ServiceId, userAgent: string): string {
  // WhatsApp rejects Electron's product tokens with a Chrome 100+ warning even
  // on the bundled current Chromium. Keep real Chromium/platform versions; change only this
  // adapter, with no security flags or changes to authentication challenges.
  return service === "whatsapp" ? userAgent.replace(/\s(?:Electron|MonoChat|monochat)\/[^\s]+/g, "") : userAgent;
}
export function webURL(value: string): URL | null {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url : null; } catch { return null; }
}
export function internalURL(service: ServiceId, value: string): boolean {
  const url = webURL(value);
  if (!url || url.protocol !== "https:" || url.port) return false;
  // Slack workspaces have separate single-label subdomains; never match lookalike suffixes.
  const workspace = service === "slack" && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.slack\.com$/.test(url.hostname);
  if (!adapters[service].hosts.includes(url.hostname) && !workspace) return false;
  if (service === "slack" && /^\/link(?:\/|$)/.test(url.pathname)) return false;
  // These official link shims lead to message links, not authentication.
  if (/^\/(l\.php|flx\/warn|si\/ajax\/l\/redirect)/.test(url.pathname)) return false;
  return true;
}
export function instagramInbox(value: string): string | null {
  const url = webURL(value);
  // Only the post-login root; profiles, challenges, 2FA and attachments are untouched.
  return url?.hostname === "www.instagram.com" && url.pathname === "/" ? adapters.instagram.url : null;
}
export function attachmentURL(service: ServiceId, value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "blob:" && internalURL(service, url.origin);
  } catch { return false; }
}
