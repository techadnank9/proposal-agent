import {
  canUseFreeSearch,
  createPaidUnlockState,
  getDiscoveryQuotaState,
  getFreeDiscoveryLimit,
  getFreeSearchesRemaining,
  incrementDiscoverySearch,
  serializeDiscoveryQuotaCookie,
} from "@/lib/quota";

describe("quota helpers", () => {
  it("increments free searches up to the limit", () => {
    const initial = getDiscoveryQuotaState(null);
    const once = incrementDiscoverySearch(initial);
    const twice = incrementDiscoverySearch(once);

    expect(getFreeSearchesRemaining(twice)).toBe(getFreeDiscoveryLimit() - 2);
    expect(canUseFreeSearch(twice)).toBe(true);
  });

  it("restores state from the signed cookie", () => {
    const cookie = serializeDiscoveryQuotaCookie(
      incrementDiscoverySearch(
        incrementDiscoverySearch(getDiscoveryQuotaState(null)),
      ),
    );

    const state = getDiscoveryQuotaState(cookie);
    expect(state.freeSearchesUsed).toBe(2);
  });

  it("treats paid unlock as unlimited", () => {
    const state = createPaidUnlockState();
    expect(canUseFreeSearch(state)).toBe(true);
    expect(getFreeSearchesRemaining(state)).toBe(0);
  });
});
