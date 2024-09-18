import * as core from '@actions/core'
import * as github from '@actions/github'
import * as tc from '@actions/tool-cache'
import * as exec from '@actions/exec'
import * as io from '@actions/io'

import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'

import * as utils from './utils'

export const REGCLIENT_REPO = 'https://github.com/regclient/regclient'

export async function run(): Promise<void> {
  let tmpDir
  try {
    // System information
    const OS = utils.getOS(process.platform)
    const ARCH = utils.getArch(process.arch)
    const EXE = OS === 'windows' ? '.exe' : ''
    const BIN_NAME = `regctl${EXE}`
    const ARTIFACT_NAME = `regctl-${OS}-${ARCH}${EXE}`

    // Authenticate with GitHub
    const octokit = github.getOctokit(core.getInput('token'))

    // Validate requested version
    let version = core.getInput('regctl-release')
    try {
      core.debug(`version => ${version}`)
      if (utils.isSha(version)) {
        version = await utils.getVersionReleaseBySha(version, octokit)
      } else if (utils.validVersion(version)) {
        version = await utils.getVersionRelease(version, octokit)
      } else if (version === 'latest') {
        version = await utils.getLatestVersion(octokit)
      } else throw Error
    } catch (error) {
      // If we get an error message, then something when wrong with a valid
      // version. If we get a blank error, that means we got an invalid version.
      const message = error instanceof Error ? error.message : ''
      if (message) {
        throw Error(
          `${message} - For a list of valid versions, see ${REGCLIENT_REPO}/releases`
        )
      } else {
        throw Error(
          `Invalid version ${version} - For a list of valid versions, see ${REGCLIENT_REPO}/releases`
        )
      }
    }
    core.info(`🏗️ Setting up regctl ${version}`)
    core.setOutput('version', version)

    // Create temp directory for downloading non-cached versions
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'regctl_'))
    core.debug(`Created ${tmpDir}`)

    // Check if regctl is already in the tool-cache
    const cache = core.getInput('cache')
    core.debug('Checking regctl cache')
    let mainPath = tc.find('regctl', version.substring(1))
    core.setOutput('cache-hit', cache && !!mainPath)

    let mainBin
    if (!cache || !mainPath) {
      // Download regctl into tmpDir
      core.info('⏬ Downloading regctl')
      mainBin = await utils.downloadReleaseArtifact(
        version,
        ARTIFACT_NAME,
        path.join(tmpDir, BIN_NAME)
      )
      fs.chmodSync(mainBin, 0o755)
    } else {
      core.info('📥 Loaded from runner cache')
      mainBin = path.join(mainPath, BIN_NAME)
    }

    // Verify regctl if cosign is in the PATH (unless told to skip)
    const cosign = await io.which('cosign')
    if (core.getBooleanInput('verify') && cosign) {
      // Download release metadata into tmpDir
      core.info('🔏 Downloading signature metadata')
      const metadataTar = await utils.downloadReleaseArtifact(
        version,
        'metadata.tgz',
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
      try {
        // This will exit 1 on error and display stdout and stderr automatically
        await exec.getExecOutput(cosign, [
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
      } catch (error) {
        core.debug(error instanceof Error ? error.message : (error as string))
        throw Error('regctl signature verification failed')
      }
      core.info('✅ Signature verified')
    } else core.info('⏭️ Skipped signature verification')

    // Cache the regctl download if it was not already in the cache
    // if cache=false, we overwrite it each time
    if (!cache || !mainPath) {
      mainPath = await tc.cacheFile(
        mainBin,
        BIN_NAME,
        'regctl',
        version.substring(1) // remove leading 'v'
      )
    }

    // Add regctl to our PATH
    core.addPath(mainPath)
    core.info('🎉 regctl is ready')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    else core.setFailed(error as string)
  }

  // Cleanup tmpDir if it was created at any point
  if (tmpDir) {
    core.debug(`Deleting ${tmpDir}`)
    await io.rmRF(tmpDir)
  }
}
