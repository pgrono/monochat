import { effective, type AccountConfig, type Config } from "../shared/model.js";
export interface AccountRuntime {
  show(visible: boolean): void;
  update(account: AccountConfig): void;
  close(): Promise<void>;
  reload(): void;
  focus(): void;
}
export class Accounts<T extends AccountRuntime> {
  readonly live = new Map<string, T>();
  private cleanup = new Set<string>();
  selected: string | null = null;
  overlay = false;
  constructor(private create: (account: AccountConfig) => T) {}
  async reconcile(config: Config): Promise<void> {
    for (const [id, runtime] of this.live) {
      const account = config.accounts.find(a => a.id === id);
      if (!account || !effective(config, account) || this.cleanup.has(id)) {
        this.cleanup.add(id);
        await runtime.close();
        this.live.delete(id);
        this.cleanup.delete(id);
      }
    }
    for (const account of config.accounts) if (effective(config, account)) {
      if (!this.live.has(account.id)) this.live.set(account.id, this.create(account));
      this.live.get(account.id)!.update(account);
    }
    this.selected = config.selected && this.live.has(config.selected) ? config.selected : (this.live.keys().next().value ?? null);
    this.layout();
  }
  select(id: string): void {
    if (!this.live.has(id)) throw new Error("Konto jest wyłączone.");
    this.selected = id;
    this.layout();
    if (!this.overlay) this.live.get(id)!.focus();
  }
  layout(): void { for (const [id, runtime] of this.live) runtime.show(!this.overlay && id === this.selected); }
  async closeAll(): Promise<void> {
    for (const [id, runtime] of this.live) { await runtime.close(); this.live.delete(id); }
  }
}
