import { GitHub } from '@actions/github/lib/utils'

export function getArch(arch: string): string {
  switch (arch) {
    case 'x64':
      return 'amd64'
    case 'ppc64':
      return 'ppc64le'
    case 's390x':
    case 'arm64':
      return arch
    default:
      throw Error(`Unsupported architecture ${arch}`)
  }
}

export function getOS(os: string): string {
  switch (os) {
    case 'win32':
      return 'windows'
    case 'linux':
    case 'darwin':
      return os
    default:
      throw Error(`Unsupported OS ${os}`)
  }
}

export function validVersion(version: string): boolean {
  const re = /^(v[0-9]+\.[0-9]+\.[0-9]+)$/
  if (re.test(version)) {
    return true
  } else {
    return false
  }
}

export function isSha(sha: string): boolean {
  const re = /^[a-f\d]{40}$/
  if (re.test(sha)) {
    return true
  } else {
    return false
  }
}

export async function getLatestVersion(
  octokit: InstanceType<typeof GitHub>
): Promise<string> {
  return (
    await octokit.rest.repos.getLatestRelease({
      owner: 'regclient',
      repo: 'regclient'
    })
  ).data.tag_name
}

export async function getVersion(
  version: string,
  octokit: InstanceType<typeof GitHub>
): Promise<string> {
  return (
    await octokit.rest.repos.getReleaseByTag({
      owner: 'regclient',
      repo: 'regclient',
      tag: version
    })
  ).data.tag_name
}

export async function getVersionBySha(
  sha: string,
  octokit: InstanceType<typeof GitHub>
): Promise<string> {
  const tags = (
    await octokit.rest.repos.listTags({
      owner: 'regclient',
      repo: 'regclient'
    })
  ).data
  for (const tag of tags) {
    if (tag.commit.sha === sha) {
      return getVersion(tag.name, octokit)
    }
  }
  throw Error(`Release not found for ${sha}`)
}
