import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import * as tc from '@actions/tool-cache'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

import { lookpath } from 'lookpath'
import * as utils from './utils'

const REGCLIENT_REPO = 'https://github.com/regclient/regclient'

export async function run(): Promise<void> {
  let tmpDir
  try {
    // System information
    const OS = utils.getOS(process.platform)
    const ARCH = utils.getArch(process.arch)
    const EXE = OS === 'windows' ? '.exe' : ''
    const BIN_NAME = `regctl${EXE}`

    // Authenticate with GitHub
    const octokit = github.getOctokit(core.getInput('token'))

    // Validate requested version
    let version = core.getInput('regctl-release')
    if (utils.isSha(version)) {
      version = await utils.getVersionBySha(version, octokit)
    } else if (utils.validVersion(version)) {
      version = await utils.getVersion(version, octokit)
    } else if (version === 'latest') {
      version = await utils.getLatestVersion(octokit)
    } else {
      throw Error(
        `Invalid version ${version}. For the set of valid versions, see ${REGCLIENT_REPO}/releases`
      )
    }
    core.info(`🏗️ Setting up regctl ${version}`)
    core.setOutput('version', version)

    // Create temp directory for downloading non-cached versions
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'regctl_'))

    // Check if regctl is already in the tool-cache
    const cache = core.getInput('cache')
    let mainCachePath = tc.find('regctl', version.substring(1))
    core.setOutput('cache-hit', cache && !!mainCachePath)
    if (!mainCachePath || !cache) {
      // Download regctl into tmpDir
      core.info('⏬ Downloading regctl')
      const mainUrl = `${REGCLIENT_REPO}/releases/download/${version}/regctl-${OS}-${ARCH}${EXE}`
      const mainBin = await tc.downloadTool(
        mainUrl,
        path.join(tmpDir, BIN_NAME)
      )
      fs.chmodSync(mainBin, 0o755)

      // Verify regctl if cosign is in the PATH (unless told to skip)
      const cosign = await lookpath('cosign')
      if (core.getBooleanInput('verify') && cosign) {
        // Download release metadata into tmpDir
        core.info('🔏 Downloading signature metadata')
        const metadataUrl = `${REGCLIENT_REPO}/releases/download/${version}/metadata.tgz`
        const metadataTar = await tc.downloadTool(
          metadataUrl,
          path.join(tmpDir, 'metadata.tgz')
        )

        // Extract metadata
        const metadataDir = await tc.extractTar(
          metadataTar,
          path.join(tmpDir, 'metadata')
        )

        // Validate binary against downloaded signature
        // This will display stdout and stderr automatically
        core.info('🔍 Verifying signature')
        const { exitCode } = await exec.getExecOutput(cosign, [
          'verify-blob',
          '--certificate-oidc-issuer',
          'https://token.actions.githubusercontent.com',
          '--certificate-identity-regexp',
          'https://github.com/regclient/regclient/.github/workflows/',
          '--certificate',
          path.join(metadataDir, `regctl-${OS}-${ARCH}.pem`),
          '--signature',
          path.join(metadataDir, `regctl-${OS}-${ARCH}.sig`),
          mainBin
        ])
        if (exitCode !== 0) {
          throw Error('Signature verification failed')
        }
        core.info('✅ Signature verified')
      } else core.info('⏭️ Skipped signature verification')

      // Cache the regctl download
      mainCachePath = await tc.cacheFile(
        mainBin,
        BIN_NAME,
        'regctl',
        version.substring(1) // remove leading 'v'
      )
    } else core.info('📥 Loaded from runner cache')
    // Add the cached regctl to our PATH
    core.addPath(mainCachePath)

    // Cleanup tmpDir
    fs.rmSync(tmpDir, { recursive: true, force: true })
    core.info('🎉 regctl is ready')
  } catch (error) {
    // Cleanup tmpDir before terminating during a failure
    if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true })

    if (error instanceof Error) core.setFailed(error.message)
    else core.setFailed(error as string)
  }
}
