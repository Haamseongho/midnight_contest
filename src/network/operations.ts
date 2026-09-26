export type OperationStatus = "PENDING" | "UNKNOWN" | "CONFIRMED" | "REJECTED" | "FAILED" | "CANCELLED";
export type Operation = {
  id: string; kind: "deploy" | "claim"; network: string; address?: string;
  status: OperationStatus; phase: "preparing" | "balancing" | "submitting";
  startedAt: string; updatedAt: string; txId?: string;
};
export type OperationHooks = { balancing(): void; submitting(txId: string): void };
type Store = Pick<Storage, "getItem" | "setItem">;
const key = "silent-pass.operation.v1";
export const unresolved = (op?: Operation | null): boolean => !!op && ["PENDING", "UNKNOWN"].includes(op.status);

// Only public operation metadata is retained. No secret, signed payload or wallet address.
export class OperationTracker {
  current: Operation | null = null;
  private listener = (): void => {};
  private readonly store?: Store;
  constructor(store?: Store) {
    this.store = store;
    const raw = store?.getItem(key);
    if (raw) {
      try {
        const op = JSON.parse(raw) as Operation;
        if (!op.id || !["deploy", "claim"].includes(op.kind) || !["preview", "preprod", "undeployed"].includes(op.network) ||
            !["PENDING", "UNKNOWN", "CONFIRMED", "REJECTED", "FAILED", "CANCELLED"].includes(op.status) ||
            (op.txId && !/^[a-f0-9]{66}$/.test(op.txId))) throw new Error("Invalid operation record");
        this.current = { ...op, status: unresolved(op) ? "UNKNOWN" : op.status };
      } catch { throw new Error("거래 복구 기록을 읽지 못했습니다. 기존 거래를 확인해야 합니다."); }
    }
  }
  subscribe(listener: () => void): void { this.listener = listener; }
  private save(): void {
    // Storage failure must prevent sending a transaction whose recovery ID is lost.
    this.store?.setItem(key, JSON.stringify(this.current));
    this.listener();
  }
  private change(id: string, patch: Partial<Operation>): void {
    if (this.current?.id !== id || this.current.status === "CANCELLED") return;
    this.current = { ...this.current, ...patch, updatedAt: new Date().toISOString() };
    this.save();
  }
  async run<T extends { txId?: string; address?: string }>(
    kind: Operation["kind"], network: string, address: string | undefined,
    action: (hooks: OperationHooks) => Promise<T>, onSuccess: (result: T) => void,
    timeoutMs = 180_000,
  ): Promise<void> {
    if (unresolved(this.current)) throw new Error("이전 거래가 미확정입니다. 결과 확인 또는 전송 전 작업 중단을 먼저 진행하세요.");
    const id = crypto.randomUUID();
    this.current = { id, kind, network, address, status: "PENDING", phase: "preparing", startedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.save();
    const assertActive = (): void => {
      if (this.current?.id !== id || !unresolved(this.current)) throw new Error("전송 전 중단된 작업입니다.");
    };
    const hooks: OperationHooks = {
      balancing: () => { assertActive(); this.change(id, { phase: "balancing" }); },
      submitting: (txId) => {
        assertActive();
        if (!/^[a-f0-9]{66}$/.test(txId)) throw new Error("잘못된 거래 식별자");
        this.change(id, { phase: "submitting", txId });
      },
    };
    let timer: ReturnType<typeof setTimeout> | undefined;
    const task = Promise.resolve().then(() => action(hooks)).then(result => {
      if (this.current?.id !== id || this.current.status === "CANCELLED") return;
      this.change(id, { status: "CONFIRMED", txId: result.txId ?? this.current.txId, address: result.address ?? address });
      onSuccess(result);
    }, (error: unknown) => {
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
    if (!this.current || !unresolved(this.current) || this.current.txId) throw new Error("이미 전송을 시작한 거래는 이 화면에서 취소할 수 없습니다.");
    // Every late continuation must pass submitting(), which rejects cancelled IDs.
    this.change(this.current.id, { status: "CANCELLED" });
  }
  async reconcile(network: string, read: (txId: string) => Promise<{ status: string; txId: string }>): Promise<void> {
    const op = this.current;
    if (!op || !unresolved(op) || !op.txId) throw new Error("확인할 전송 식별자가 없습니다.");
    if (network !== op.network) throw new Error("원래 거래와 같은 네트워크로 연결하세요.");
    const result = await read(op.txId);
    if (result.txId !== op.txId) throw new Error("거래 식별자 불일치");
    if (result.status === "SucceedEntirely") this.change(op.id, { status: "CONFIRMED" });
    else if (result.status === "FailEntirely") this.change(op.id, { status: "FAILED" });
    // Partial/absent/timeout responses never release the operation guard.
  }
}
