import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { statSync, existsSync, createReadStream } from 'fs'
import { join } from 'path'

// File size limits
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_CHUNK_SIZE = 2 * 1024 * 1024 // 2MB chunks

// GET /api/tracks/stream - Stream audio track
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const track = await db.track.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        artistName: true,
        ipfsHash: true,
        duration: true,
        genre: true,
      }
    })

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      )
    }

    // Extract filename from ipfsHash (assuming local storage for now)
    const audioPath = track.ipfsHash.replace('ipfs://', '').replace('/', '_')
    const fullPath = join(process.cwd(), 'uploads', 'audio', `${audioPath}.mp3`)

    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
      )
    }

    // Get file stats efficiently
    const stats = statSync(fullPath)
    const fileSize = stats.size

    // Check file size limit
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large' },
        { status: 413 }
      )
    }

    // Parse range header for partial content
    const range = request.headers.get('range') || 'bytes=0-'
    const rangeMatch = range.match(/bytes=(\d+)-(\d*)/)

    if (!rangeMatch) {
      return NextResponse.json(
        { error: 'Invalid range header' },
        { status: 400 }
      )
    }

    const start = parseInt(rangeMatch[1])
    const endStr = rangeMatch[2]
    const end = endStr ? parseInt(endStr) : Math.min(start + MAX_CHUNK_SIZE, fileSize - 1)

    // Validate range
    if (start >= fileSize || end >= fileSize || start > end) {
      const headers = new Headers()
      headers.set('Content-Range', `bytes */${fileSize}`)
      return new NextResponse(null, {
        status: 416,
        headers,
      })
    }

    // Additional security: prevent large range requests
    if (end - start > MAX_CHUNK_SIZE) {
      return NextResponse.json(
        { error: 'Range too large' },
        { status: 413 }
      )
    }

    const chunkSize = end - start + 1

    // Create read stream for the chunk
    const fileStream = createReadStream(fullPath, { start, end })

    // Set appropriate headers for streaming
    const headers = new Headers()
    headers.set('Content-Range', `bytes ${start}-${end}/${fileSize}`)
    headers.set('Accept-Ranges', 'bytes')
    headers.set('Content-Length', chunkSize.toString())
    headers.set('Content-Type', 'audio/mpeg')
    headers.set('Content-Disposition', `inline; filename="${track.title}.mp3"`)
    headers.set('Cache-Control', 'public, max-age=31536000') // Cache for 1 year

    return new NextResponse(fileStream as any, {
      status: 206,
      headers,
    })
  } catch (error) {
    console.error('Error streaming track:', error)
    return NextResponse.json(
      { error: 'Failed to stream track' },
      { status: 500 }
    )
  }
}

// POST /api/tracks/stream - Track play count and user listening
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { userId, duration, completed, position } = body

    // Find the track
    const track = await db.track.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        artistId: true,
        playCount: true,
      }
    })

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      )
    }

    // Increment play count
    await db.track.update({
      where: { id: params.id },
      data: { playCount: { increment: 1 } }
    })

    // Record play history if user is provided
    if (userId) {
      // Validate input parameters
      const validDuration = Math.max(0, Math.min(duration || 0, 3600)) // Max 1 hour
      const validPosition = Math.max(0, Math.min(position || 0, 100)) // Max 100%

      await db.playHistory.create({
        data: {
          userId,
          trackId: params.id,
          duration: validDuration,
          completed: completed || false,
          position: validPosition,
        }
      })

      // Award listening reward (only if completed and listened for more than 30 seconds)
      if (completed && validDuration > 30) {
        await db.reward.create({
          data: {
            userId,
            type: 'LISTENING',
            amount: 1, // 1 $NDT token per completed listen
            reason: `Listening reward for track ${track.title}`
          }
        })

        // Update user balance
        await db.user.update({
          where: { id: userId },
          data: { balance: { increment: 1 } }
        })
      }
    }

    return NextResponse.json({
      message: 'Play recorded successfully',
      trackId: params.id,
      playCount: track.playCount + 1,
    })
  } catch (error) {
    console.error('Error recording play:', error)
    return NextResponse.json(
      { error: 'Failed to record play' },
      { status: 500 }
    )
  }
}

// HEAD /api/tracks/stream - Get track info without streaming
export async function HEAD(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const track = await db.track.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        artistName: true,
        ipfsHash: true,
        duration: true,
        genre: true,
      }
    })

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      )
    }

    // Extract filename from ipfsHash (assuming local storage for now)
    const audioPath = track.ipfsHash.replace('ipfs://', '').replace('/', '_')
    const fullPath = join(process.cwd(), 'uploads', 'audio', `${audioPath}.mp3`)

    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
      )
    }

    // Get file stats
    const stats = statSync(fullPath)
    const fileSize = stats.size

    const headers = new Headers()
    headers.set('Accept-Ranges', 'bytes')
    headers.set('Content-Length', fileSize.toString())
    headers.set('Content-Type', 'audio/mpeg')
    headers.set('Content-Disposition', `inline; filename="${track.title}.mp3"`)

    return new NextResponse(null, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Error getting track info:', error)
    return NextResponse.json(
      { error: 'Failed to get track info' },
      { status: 500 }
    )
  }
}
