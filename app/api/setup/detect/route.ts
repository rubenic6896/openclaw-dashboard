import { NextResponse } from 'next/server'
import { detectAll } from '@/lib/setup-detection'
import { execSync } from 'child_process'

export const dynamic = 'force-dynamic'

function getNodeVersion(): string | null {
  try {
    return process.version
  } catch {
    return null
  }
}

function getNpmVersion(): string | null {
  try {
    return execSync('npm --version', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim()
  } catch {
    return null
  }
}

export async function GET() {
  try {
    const detection = detectAll()
    const nodeVersion = getNodeVersion()
    const npmVersion = getNpmVersion()

    return NextResponse.json({
      ...detection,
      nodeVersion,
      npmVersion,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
