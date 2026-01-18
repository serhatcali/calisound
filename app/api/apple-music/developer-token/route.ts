import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

// Generate Apple Music Developer Token (JWT)
export async function GET() {
  try {
    const teamId = process.env.APPLE_MUSIC_TEAM_ID
    const keyId = process.env.APPLE_MUSIC_KEY_ID
    const privateKeyPath = process.env.APPLE_MUSIC_PRIVATE_KEY_PATH

    if (!teamId || !keyId || !privateKeyPath) {
      return NextResponse.json(
        {
          error: 'Apple Music credentials not configured',
          message: 'Please set APPLE_MUSIC_TEAM_ID, APPLE_MUSIC_KEY_ID, and APPLE_MUSIC_PRIVATE_KEY_PATH in .env.local',
        },
        { status: 500 }
      )
    }

    // Read private key
    let privateKey: string
    try {
      const keyPath = path.resolve(process.cwd(), privateKeyPath)
      privateKey = fs.readFileSync(keyPath, 'utf8')
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Failed to read Apple Music private key',
          message: `Key file not found at: ${privateKeyPath}`,
        },
        { status: 500 }
      )
    }

    // Generate JWT token (valid for 6 months)
    const token = jwt.sign({}, privateKey, {
      algorithm: 'ES256',
      expiresIn: '180d',
      issuer: teamId,
      header: {
        alg: 'ES256',
        kid: keyId,
      },
    })

    return NextResponse.json({ token })
  } catch (error: any) {
    console.error('Error generating Apple Music developer token:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate developer token',
        message: 'Failed to generate developer token',
      },
      { status: 500 }
    )
  }
}
