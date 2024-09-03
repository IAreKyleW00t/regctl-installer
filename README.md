# 📦 regctl-installer

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-regctl--installer-blue?style=flat&logo=github)](https://github.com/marketplace/actions/regctl-installer)
[![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/IAreKyleW00t/regctl-installer?style=flat&label=Latest%20Version&color=blue)](https://github.com/IAreKyleW00t/regctl-installer/tags)
[![Action Tests](https://github.com/IAreKyleW00t/regctl-installer/actions/workflows/test.yml/badge.svg)](https://github.com/IAreKyleW00t/regctl-installer/actions/workflows/test.yml)
[![License](https://img.shields.io/github/license/IAreKyleW00t/regctl-installer?label=License)](https://github.com/IAreKyleW00t/regctl-installer/blob/main/LICENSE)
[![Dependabot](https://img.shields.io/badge/Dependabot-0366d6?style=flat&logo=dependabot&logoColor=white)](.github/dependabot.yml)

This GitHub Action enables you to interacting with remote images and registries
using [`regctl`](https://github.com/google/go-containerregistry/tree/main/cmd/regctl).
This action will verify the integrity of the `regctl` release during installation
if you setup [Cosign](https://docs.sigstore.dev/cosign/overview/) ahead of
time (see [Examples](#examples) below). This Action will also utilize
[actions/cache](https://github.com/actions/cache) to cache the `regctl` binary.

For a quick start guide on the usage of `regctl`, please refer to
https://github.com/regclient/regclient/blob/main/docs/regctl.md. For available
regctl releases, see https://github.com/regclient/regclient/releases.

This action supports Linux, macOS and Windows runners (results may vary with self-hosted runners).

## Quick Start

```yaml
- name: Install regctl
  uses: iarekylew00t/regctl-installer@v2
```

## Usage

> [!IMPORTANT]
>
> You need to authenticate into registries using either the
> [docker/login-action](https://github.com/docker/login-action) Action or by
> manually configuring credentials in within `regctl` itself. See the
> [Examples](#examples) section for details on how to do this.

### Inputs

| Name             | Type    | Description                                      | Default               |
| ---------------- | ------- | ------------------------------------------------ | --------------------- |
| `regctl-release` | String  | `regctl` version to be installed                 | `latest`              |
| `install-dir`    | String  | directory to install `regctl` binary into        | `$HOME/.regctl`       |
| `cache`          | Boolean | Cache the `regctl` binary                        | `true`                |
| `verify`         | Boolean | Perform `cosign` validation on regctl binary [1] | `true`                |
| `token`          | String  | GitHub Token for API access                      | `${{ github.token }}` |

> 1. `cosign` must be in your `PATH` for validation to work. It will be skipped
>    if it's not present; See
>    [Automatic validation with Cosign](#automatic-validation-with-cosign).
>    The `verify` input is if you want explicitly _skip_ the verification step when it _would_ run.

### Outputs

| Name        | Type    | Description                                 |
| ----------- | ------- | ------------------------------------------- |
| `version`   | String  | The version of `regctl` the was installed   |
| `cache-hit` | Boolean | If the `regctl` binary was loaded via cache |

### Token Permissions

This Actions requires the following permissions granted to the GITHUB_TOKEN.

- `packages: write` (Only needed if you plan to use
  [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry))

## Examples

### Pinned version

```yaml
- name: Install regctl
  uses: iarekylew00t/regctl-installer@v2
  with:
    regctl-release: v0.7.1
```

### Authenticate using Docker credentials

```yaml
- name: Install regctl
  uses: iarekylew00t/regctl-installer@v2

- name: Login to DockerHub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}

- name: Login to GHCR
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ github.token }}
```

### Authenticate using regctl

```yaml
- name: Install regctl
  uses: iarekylew00t/regctl-installer@v2

- name: Login to DockerHub
  run: |
    echo "${{ secrets.DOCKERHUB_TOKEN }}" | \
    regctl registry login docker.io \
      --user "${{ vars.DOCKERHUB_USERNAME }}" \
      --pass-stdin

- name: Login to GHCR
  run: |
    echo "${{ github.token }}" | \
    regctl registry login ghcr.io \
      --user "${{ github.actor }}" \
      --pass-stdin
```

### Automatic validation with Cosign

```yaml
- name: Install Cosign
  uses: sigstore/cosign-installer@v3.0.1

- name: Install regctl
  uses: iarekylew00t/regctl-installer@v2
```

## Releases

For maintainers, the following release process should be used when cutting new
versions.

1. ⏬ Ensure all changes are in the `main` branch and all necessary
   [Workflows](https://github.com/IAreKyleW00t/regctl-installer/actions) are
   passing.

   ```sh
   git checkout main
   git pull
   ```

2. 🔖 Create a new Tag, push it up, then create a
   [new Release](https://github.com/IAreKyleW00t/regctl-installer/releases/new)
   for the version.

   ```sh
   git tag v1.2.3
   git push -u origin v1.2.3
   ```

   Alternatively you can create the Tag on the GitHub Release page itself.

   When the tag is pushed it will kick off the
   [Shared Tags](https://github.com/IAreKyleW00t/regctl-installer/actions/workflows/shared-tags.yml)
   Workflows to update the `v$MAJOR` and `v$MAJOR.MINOR` tags.

## Contributing

Feel free to contribute and make things better by opening an
[Issue](https://github.com/IAreKyleW00t/regctl-installer/issues) or
[Pull Request](https://github.com/IAreKyleW00t/regctl-installer/pulls).  
Thank you for your contribution! ❤️

## License

See [LICENSE](https://github.com/IAreKyleW00t/regctl-installer/blob/main/LICENSE).
