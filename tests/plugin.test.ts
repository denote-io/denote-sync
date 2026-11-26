import { describe, expect, it, vi } from "vitest";
import { parsePluginManifest, type PluginActivationContext, type PluginDisposable } from "@denote/plugin-sdk";
import manifest from "../plugin.json";
import plugin from "../src/index";

function createContext(capabilities: PluginActivationContext["capabilities"]) {
  const subscriptions: PluginDisposable[] = [];
  const context: PluginActivationContext = {
    pluginId: plugin.manifest.id,
    subscriptions: { add: vi.fn((disposable: PluginDisposable) => { subscriptions.push(disposable); }) },
    capabilities,
    storage: { get: vi.fn(async () => null), set: vi.fn(), delete: vi.fn(), clear: vi.fn() },
    settings: { getAll: vi.fn(async () => ({})) },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  };
  const deactivate = async () => {
    await plugin.deactivate?.();
    for (const disposable of subscriptions.splice(0)) disposable.dispose();
  };
  return { context, subscriptions, deactivate };
}

describe("isolated sync package", () => {
  it("declares exactly the isolated sync permission and no settings", () => {
    const parsed = parsePluginManifest(manifest);
    expect(parsed.id).toBe("denote.sync");
    expect(parsed.permissions).toEqual([{ capability: "sync" }]);
    expect(parsed.settings ?? []).toEqual([]);
  });

  it("registers only the host-rendered sync tool and touches no data in the worker", async () => {
    const dispose = vi.fn();
    const register = vi.fn(() => ({ dispose }));
    const { context, subscriptions } = createContext({ sensitiveTools: { register } });

    await plugin.activate(context);

    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith({ id: "denote.sync.tool", title: "Sync", feature: "sync" });
    expect(subscriptions).toEqual([{ dispose }]);
    expect(context.storage.get).not.toHaveBeenCalled();
    expect(context.storage.set).not.toHaveBeenCalled();
    expect(context.settings.getAll).not.toHaveBeenCalled();
  });

  it("disposes the registration on deactivate", async () => {
    const dispose = vi.fn();
    const { context, deactivate } = createContext({ sensitiveTools: { register: vi.fn(() => ({ dispose })) } });

    await plugin.activate(context);
    expect(dispose).not.toHaveBeenCalled();
    await deactivate();
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it("refuses to activate without the host sync capability", async () => {
    const { context, subscriptions } = createContext({});
    await expect(Promise.resolve().then(() => plugin.activate(context))).rejects.toThrow("sync host capability");
    expect(subscriptions).toEqual([]);
  });
});
