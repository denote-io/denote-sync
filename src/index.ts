import { parsePluginManifest, type DenotePlugin } from "@denote/plugin-sdk";
import manifest from "../plugin.json";

const plugin: DenotePlugin = {
  manifest: parsePluginManifest(manifest),
  activate(context) {
    if (!context.capabilities.sensitiveTools) throw new Error("The sync host capability is required.");
    context.subscriptions.add(context.capabilities.sensitiveTools.register({
      id: "denote.sync.tool", title: "Sync", feature: "sync",
    }));
  },
};

export default plugin;
