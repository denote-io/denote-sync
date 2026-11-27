# Whole-app sync

## Purpose

Keep several devices in step: every synced vault, portable preferences,
revision history, and plugin data replicate through one storage location you
control. Supported storage is a local or mounted folder, WebDAV, an
S3-compatible bucket, Google Drive, or a dedicated Git repository. Everything
stored remotely is end-to-end encrypted with a sync passphrase; the provider
sees only opaque object names and ciphertext.

This is the cross-device successor to replicating vaults through the per-vault
Git plugin. **Git versioning** (`denote.git`) still keeps the history of one
vault in that vault's own repository. Whole-app sync uses one separate store
for the whole application and never reads or writes any `.git` entry, so both
can be used together.

## Enablement and permissions

Disabled by default. The plugin requests one isolated permission, **Sync**,
which only lets it register the host-rendered **Sync** panel. Denote's trusted
host performs enrollment, encryption, storage access, scanning, merging, and
writing files. The downloaded plugin code never receives vault content, paths,
preferences, plugin data, credentials, or the passphrase, and has no network
or filesystem access. Enabling the plugin does not configure or start sync.

## Usage

Open **Sync** from the command palette.

### First device

Choose **Create**, name the device, pick a backend, and enter a sync passphrase.
The passphrase is never stored remotely and cannot be recovered; keep it in a
password manager. **Remember on this device** stores the unlocked key in the
operating-system credential store; otherwise Denote asks for the passphrase
after each start.

- **Folder:** select an absolute folder, such as one kept by a desktop sync
  client or a mounted network share. It must not be inside a vault.
- **WebDAV:** enter the HTTPS URL, username, and password (for example a
  Nextcloud app password).
- **S3-compatible:** enter endpoint, region, bucket, prefix, and access keys.
  Works with AWS S3, Cloudflare R2, MinIO, SeaweedFS, and similar servers;
  enable **Path-style** for most self-hosted servers.
- **Google Drive:** sign in through the browser. Denote creates its own folder
  and can only see files it created.
- **Git:** enter the remote URL and branch of a dedicated, empty repository and
  an existing Git authentication mode. Never use a vault's own repository.
  Denote commits only under `denote-sync/v1/` and never force-pushes.

Credentials stay in the operating-system credential store on each device.

### More devices

Choose **Join**, enter the same backend settings and the passphrase. For every
remote vault choose a new empty folder, an existing folder that already holds
that vault (it is merged), or **Skip on this device**. Local vaults are synced
only after you enroll them. **Stop syncing this vault** keeps local files and
stops publishing it; forgetting a vault in the vault switcher never deletes it
remotely.

### Running sync

Sync runs shortly after start, on the chosen interval (default 15 minutes, or
manual only), and on **Sync now**. It never runs while Denote is locked or in
safe mode. Files changed during a cycle are left alone and retried next time,
and open tabs with unsaved edits report a conflict instead of being replaced.

### Conflicts

Deletions never win over concurrent edits. When two devices change the same
file, the newer version keeps the name and the other is saved beside it as
`<name>.sync-conflict-<id>.<ext>`; review and delete whichever you do not
need. Concurrent changes to a plugin setting or plugin state value, and to a
vault's encryption settings, are listed in the panel to choose **Local** or
**Remote**; an encryption conflict pauses that vault until resolved.

### Devices and passphrase

The panel lists every device. **Remove device** stops merging what a lost or
retired device publishes; it does not revoke what it already downloaded.
**Change passphrase** re-protects the same key; devices that knew the old
passphrase can still read the data they could access before. To rotate
completely, disconnect every device and create a new store.

### What is synced

Synced: files of enrolled vaults (byte-exact; encrypted vaults stay
encrypted), vault names and view options, bookmarks, file order and pins, tag
colors, project roots, revision history, theme and editor display, default
Markdown view, dotfile visibility, activity-rail layout, dictation shortcut,
portable plugin settings and plugin state, and which plugins are enabled (as
suggestions only).

Not synced: `.git` entries, `.denote/trash/`, locks and temporary files,
symbolic links, panel widths, approved domains and remote-image consent,
update channel and automatic plugin updates, plugin packages and permission
approvals, plugin settings for executables, paths, authentication, signing, or
automation, app lock, tab sessions, caches, and every keychain secret. A
suggested plugin is never downloaded or enabled automatically. Single files
larger than 256 MiB are reported and skipped.

## Settings

The plugin has no settings. Backend, device name, interval, pause, and the
history, preferences, and plugin data toggles are in the **Sync** panel and
stay on this device.

## Disable behavior

Disabling stops the scheduler, cancels a running cycle at the next file
boundary, and removes plugin code. The sync configuration, local index, and
credentials are kept so re-enabling resumes. **Disconnect** removes the local
configuration, index, and stored credentials. Neither ever deletes local files
or remote data; delete the remote folder, bucket, or repository yourself.

## Troubleshooting

- **Needs passphrase:** unlock in the panel, optionally remembering it.
- **Authentication or network errors** are reported and retried later; they
  are never treated as deletions. Check credentials, URL, and clock.
- **A device's data could not be read:** Denote falls back to that device's
  previous complete state and reports it. Sync that device again.
- **Vault unavailable:** a missing or unreadable vault folder is skipped
  without deleting anything remotely. Reconnect the drive or remap the vault.
- **Vault paused for encryption:** finish enabling or disabling encryption, or
  resolve the encryption conflict.
- **Copied or restored application data** is detected; the device re-enrolls
  under a new identity and divergent files become conflict copies.
- **Forgotten passphrase:** the data cannot be decrypted. Disconnect and
  create a new store from a device that still has the files.
