# Metric McMaster Chrome Extension

Converts imperial units to metric on McMaster-Carr and toggles tooltips via toolbar button.

## Features

- Converts inches, feet, pounds, and °F to metric units on mcmaster.com
- Shows metric conversions as tooltips
- Toggle tooltips with the extension button

## Build & Development

### Prerequisites

- [Bun](https://bun.sh/)
- [Brave](https://brave.com/) or [Chromium/Chrome] (for .crx packaging)

### Build

```bash
bun run build
```

- Bundles and minifies all code to `dist/`
- Copies static assets and manifest
- Produces `metric-mcmaster.zip` for Chrome Web Store
- Produces `metric-mcmaster.crx` for manual install

### Load Unpacked Extension

1. Go to `chrome://extensions/`
2. Enable Developer Mode
3. Click "Load unpacked" and select the `dist/` folder

## Testing

### Manual Testing

- Open mcmaster.com and verify conversions and tooltips
- Use the extension button to toggle tooltips

### Automated Testing

Run all tests:

```bash
bun test
```

## Linting & Formatting

- Lint: `bun run lint`
- Format: `bun run format`

## Versioning

- Update `version` in both `manifest.json` and `package.json` for each release.

## Permissions

- Only requests `activeTab`, and host permissions for mcmaster.com
- No unnecessary permissions requested

## Security

- No remote code execution
- No external scripts
- Only runs on mcmaster.com

---

MIT License
