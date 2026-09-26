export type OperationStatus = "PENDING" | "UNKNOWN" | "CONFIRMED" | "REJECTED" | "FAILED" | "CANCELLED";
export type Operation = {
  id: string; kind: "deploy" | "claim"; network: string; address?: string;
  status: OperationStatus; phase: "preparing" | "balancing" | "submitting";
  startedAt: string; updatedAt: string; txId?: string;
};
export type OperationHooks = { balancing(): void; submitting(txId: string): void };
type Store = Pick<Storage, "getItem" | "setItem">;
type StoreSource = Store | (() => Store);
const key = "silent-pass.operation.v1";
export const unresolved = (op?: Operation | null): boolean => !!op && ["PENDING", "UNKNOWN"].includes(op.status);

function decodeRecord(raw: string): Operation {
  const op = JSON.parse(raw) as Operation;
  if (!op || typeof op !== "object" || Array.isArray(op) ||
      typeof op.id !== "string" || !op.id || op.id.length > 128 ||
      !["deploy", "claim"].includes(op.kind) || !["preview", "preprod", "undeployed"].includes(op.network) ||
      !["PENDING", "UNKNOWN", "CONFIRMED", "REJECTED", "FAILED", "CANCELLED"].includes(op.status) ||
      !["preparing", "balancing", "submitting"].includes(op.phase) ||
      typeof op.startedAt !== "string" || !Number.isFinite(Date.parse(op.startedAt)) ||
      typeof op.updatedAt !== "string" || !Number.isFinite(Date.parse(op.updatedAt)) ||
      (op.address !== undefined && (typeof op.address !== "string" || op.address.length > 256)) ||
      (op.txId !== undefined && (typeof op.txId !== "string" || !/^[a-f0-9]{66}$/.test(op.txId))) ||
      (op.phase === "submitting" && !op.txId)) throw new Error("Invalid operation record");
  // Allowlist persisted fields; never reflect arbitrary stored data in the UI.
  return { id: op.id, kind: op.kind, network: op.network, address: op.address,
    status: unresolved(op) ? "UNKNOWN" : op.status, phase: op.phase,
    startedAt: op.startedAt, updatedAt: op.updatedAt, txId: op.txId };
}

// Only public operation metadata is retained. No secret, signed payload or wallet address.
export class OperationTracker {
  current: Operation | null = null;
  private listener = (): void => {};
  private readonly storeSource?: StoreSource;
  private storageFault: "read" | "write" | null = null;
  get blocked(): boolean { return this.storageFault !== null; }
  get blockedMessage(): string {
    return "BLOCKED · 거래 복구 기록을 읽거나 안전하게 저장하지 못해 새 거래를 차단했습니다. 기록을 삭제하거나 새 탭에서 재전송하지 마세요. 원래 네트워크·거래 ID를 보존하고 저장소 접근 또는 원본 기록을 복구한 뒤 다시 검사하세요. 공개 조회와 로컬 회로 시연은 계속 사용할 수 있습니다.";
  }
  private get store(): Store | undefined {
    return typeof this.storeSource === "function" ? this.storeSource() : this.storeSource;
  }
  constructor(store?: StoreSource) {
    this.storeSource = store;
    try {
      const raw = this.store?.getItem(key);
      if (raw !== null && raw !== undefined) this.current = decodeRecord(raw);
    } catch { this.storageFault = "read"; }
  }
  subscribe(listener: () => void): void { this.listener = listener; }
  private save(): boolean {
    // Storage failure must prevent sending a transaction whose recovery ID is lost.
    try { this.store?.setItem(key, JSON.stringify(this.current)); }
    catch { this.storageFault = "write"; this.listener(); return false; }
    this.listener();
    return true;
  }
  private assertStorage(): void {
    if (this.blocked) throw new Error(this.blockedMessage);
  }
  // Explicit recovery only: a missing record after an error is NOT permission
  // to send again. Never remove a corrupt record or invent a final tx result.
  retryStorage(): void {
    if (!this.blocked) return;
    try {
      if (this.storageFault === "write" && this.current) {
        // Retain the most recent in-memory ID, not an older persisted snapshot.
        if (unresolved(this.current)) this.current = { ...this.current, status: "UNKNOWN" };
        if (!this.save()) return;
      } else {
        const raw = this.store?.getItem(key);
        if (raw === null || raw === undefined) throw new Error("Missing recovery record");
        this.current = decodeRecord(raw);
      }
      this.storageFault = null;
    } catch { /* Preserve the fault and original record. */ }
    this.listener();
  }
  private change(id: string, patch: Partial<Operation>): boolean {
    if (this.current?.id !== id || this.current.status === "CANCELLED") return false;
    this.current = { ...this.current, ...patch, updatedAt: new Date().toISOString() };
    return this.save();
  }
  async run<T extends { txId?: string; address?: string }>(
    kind: Operation["kind"], network: string, address: string | undefined,
    action: (hooks: OperationHooks) => Promise<T>, onSuccess: (result: T) => void,
    timeoutMs = 180_000,
  ): Promise<void> {
    this.assertStorage();
    if (unresolved(this.current)) throw new Error("이전 거래가 미확정입니다. 결과 확인 또는 전송 전 작업 중단을 먼저 진행하세요.");
    const id = crypto.randomUUID();
    this.current = { id, kind, network, address, status: "PENDING", phase: "preparing", startedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    if (!this.save()) this.assertStorage();
    const assertActive = (): void => {
      this.assertStorage();
      if (this.current?.id !== id || !unresolved(this.current)) throw new Error("전송 전 중단된 작업입니다.");
    };
    const hooks: OperationHooks = {
      balancing: () => { assertActive(); if (!this.change(id, { phase: "balancing" })) this.assertStorage(); },
      submitting: (txId) => {
        assertActive();
        if (!/^[a-f0-9]{66}$/.test(txId)) throw new Error("잘못된 거래 식별자");
        const beforeSubmission = this.current;
        if (!this.change(id, { phase: "submitting", txId })) {
          // The hook has not returned, so its caller cannot broadcast. Keep
          // the pre-submit record recoverable/cancellable after storage repair;
          // otherwise an ID never sent to the chain would lock this tab forever.
          this.current = beforeSubmission;
          this.listener();
          this.assertStorage();
        }
      },
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    const task = Promise.resolve().then(() => action(hooks)).then(result => {
      if (this.current?.id !== id || this.current.status === "CANCELLED") return;
      if (this.change(id, { status: "CONFIRMED", txId: result.txId ?? this.current.txId, address: result.address ?? address }) && !this.blocked) onSuccess(result);
    }, (error: unknown) => {
      if (this.blocked) return;
      if (this.current?.id !== id || !unresolved(this.current)) return;
      const code = error && typeof error === "object" ? (error as { code?: string }).code : undefined;
      const status = this.current.txId ? "UNKNOWN" : code === "Rejected" || code === "PermissionRejected" ? "REJECTED" : "FAILED";
      this.change(id, { status });
      // The UI uses bounded status text; errors never persist private input.
    });
    try {
      await Promise.race([task, new Promise<void>(resolve => {
        timer = setTimeout(() => { if (unresolved(this.current) && this.current?.id === id) this.change(id, { status: "UNKNOWN" }); resolve(); }, timeoutMs);
      })]);
    } finally { clearTimeout(timer); }
  }
  cancelBeforeSubmission(): void {
    this.assertStorage();
    if (!this.current || !unresolved(this.current) || this.current.txId) throw new Error("이미 전송을 시작한 거래는 이 화면에서 취소할 수 없습니다.");
    // Every late continuation must pass submitting(), which rejects cancelled IDs.
    if (!this.change(this.current.id, { status: "CANCELLED" })) this.assertStorage();
  }
  async reconcile(network: string, read: (txId: string) => Promise<{ status: string; txId: string }>): Promise<void> {
    this.assertStorage();
    const op = this.current;
    if (!op || !unresolved(op) || !op.txId) throw new Error("확인할 전송 식별자가 없습니다.");
    if (network !== op.network) throw new Error("원래 거래와 같은 네트워크로 연결하세요.");
    const result = await read(op.txId);
    if (result.txId !== op.txId) throw new Error("거래 식별자 불일치");
    if (result.status === "SucceedEntirely" && !this.change(op.id, { status: "CONFIRMED" })) this.assertStorage();
    else if (result.status === "FailEntirely" && !this.change(op.id, { status: "FAILED" })) this.assertStorage();
    // Partial/absent/timeout responses never release the operation guard.
  }
}
