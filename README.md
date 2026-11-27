# Whole-app sync

End-to-end encrypted sync of every vault, preference, revision, and plugin
data through storage you control: a folder, WebDAV, S3-compatible storage,
Google Drive, or a dedicated Git repository.

This is the optional [Denote](https://github.com/denote-io/denote) plugin
`denote.sync`. Its user guide is [guide.md](guide.md), also shown in
**Settings → Plugins**. The trusted host implementation and protocol are
documented in Denote's `docs/sync.md`; the plugin only registers the isolated
`sync` tool.

## Status

Released as [v0.1.0](https://github.com/denote-io/denote-sync/releases/tag/v0.1.0)
and offered by Denote 1.1.1 and later. It requires Denote 1.1.0, the first
release with host sync support.

## Development

Use the Node.js version in `.node-version`, then run `npm ci`,
`npm run typecheck`, `npm test`, `npm run check`, and `npm run package`.
`npm run dev` rebuilds `.plugin-dev/denote.sync.tgz` for **Settings → Plugins →
Load local plugin archive**. See the
[Denote plugin SDK](https://github.com/denote-io/denote-plugin-sdk).

## Release

Bump `version` in `plugin.json` and `package.json` together, merge with CI
passing, then run the **Release** workflow. Published versions are immutable.

## License

[MIT](LICENSE)
