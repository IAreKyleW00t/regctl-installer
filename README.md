# 📦 regctl-installer

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-regctl--installer-blue?style=flat&logo=github)](https://github.com/marketplace/actions/regctl-installer)
[![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/IAreKyleW00t/regctl-installer?style=flat&label=Latest%20Version&color=blue)](https://github.com/IAreKyleW00t/regctl-installer/tags)
[![Action Test & Release](https://github.com/IAreKyleW00t/regctl-installer/actions/workflows/main.yml/badge.svg)](https://github.com/IAreKyleW00t/regctl-installer/actions/workflows/main.yml)
[![License](https://img.shields.io/github/license/IAreKyleW00t/regctl-installer?label=License)](https://github.com/IAreKyleW00t/regctl-installer/blob/main/LICENSE)
[![Dependabot](https://img.shields.io/badge/Dependabot-0366d6?style=flat&logo=dependabot&logoColor=white)](.github/dependabot.yml)

This GitHub Action enables you to interacting with remote images and registries
using [`regctl`](https://github.com/google/go-containerregistry/tree/main/cmd/regctl).
This action will verify the integrity of the `regctl` release during installation
if you setup [Cosign](https://docs.sigstore.dev/cosign/overview/) ahead of
time (see examples below).

For a quick start guide on the usage of `regctl`, please refer to
https://github.com/regclient/regclient/blob/main/docs/regctl.md. For available
regctl releases, see https://github.com/regclient/regclient/releases.

---

- [Tags](#tags)
- [Usage](#usage)
- [Inputs](#inputs)
- [Examples](#examples)
  - [Pinned version](#pinned-version)
  - [Default version](#default-version)
  - [Authenticate on other registries](#authenticate-on-other-registries)
  - [Automatic validation with Cosign](#automatic-validation-with-cosign)
- [Contributing](#contributing)
- [License](#license)

## Tags

The following tags are available for the `iarekylew00t/regctl-installer` action.

- `main`
- `<version>` (eg: `v1.0.1`, including: `v1.0`, `v1`, etc.)

## Usage

This action currently supports GitHub-provided Linux, macOS and Windows runners
(self-hosted runners may not work).

Add the following entry to your Github workflow YAML file:

```yaml
uses: iarekylew00t/regctl-installer@v1
with:
  regctl-release: v0.4.7 # optional
```

## Inputs

| input            | Description                               | Default               |
| ---------------- | ----------------------------------------- | --------------------- |
| `regctl-release` | `regctl` release version to be installed  | `latest`              |
| `install-dir`    | directory to install `regctl` binary      | `$HOME/.regctl`       |
| `username`       | username to use for GitHub authentication | `${{ github.actor }}` |
| `token`          | token to use for GitHub authentication    | `${{ github.token }}` |

## Examples

### Pinned version

```yaml
jobs:
  regctl:
    runs-on: ubuntu-latest
    steps:
      - name: Install regctl
        uses: iarekylew00t/regctl-installer@v1
        with:
          regctl-release: v0.4.7
      - name: Check install
        run: regctl version
```

### Default version

```yaml
jobs:
  regctl:
    runs-on: ubuntu-latest
    steps:
      - name: Install regctl
        uses: iarekylew00t/regctl-installer@v1
      - name: Check install
        run: regctl version
```

### Authenticate on other registries

```yaml
jobs:
  regctl:
    runs-on: ubuntu-latest
    steps:
      - uses: iarekylew00t/regctl-installer@v1
      - name: Login to Docker Hub
        run: |
          echo "${{ secrets.DOCKERHUB_TOKEN }}" | \
          regctl registry login docker.io \
            --user "${{ vars.DOCKERHUB_USERNAME }}" \
            --pass-stdin
```

### Automatic validation with Cosign

```yaml
jobs:
  regctl:
    runs-on: ubuntu-latest
    steps:
      - name: Install Cosign
        uses: sigstore/cosign-installer@v3.0.1
      - name: Install regctl
        uses: iarekylew00t/regctl-installer@v1
      - name: Check install
        run: regctl version
```

## Contributing

Feel free to contribute and make things better by opening an
[Issue](https://github.com/IAreKyleW00t/regctl-installer/issues) or
[Pull Request](https://github.com/IAreKyleW00t/regctl-installer/pulls).

## License

See [LICENSE](https://github.com/IAreKyleW00t/regctl-installer/blob/main/LICENSE).
