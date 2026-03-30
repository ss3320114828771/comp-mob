import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET!
const SALT_ROUNDS = 10

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables')
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(userId: string, email: string, role: string): Promise<string> {
  return jwt.sign(
    { 
      userId, 
      email, 
      role,
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string; role: string } | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      role: string
      iat: number
      exp: number
    }
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('Token expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid token')
    } else {
      console.error('Token verification error:', error)
    }
    return null
  }
}

export async function getUserFromToken(token: string | null) {
  if (!token) return null
  
  const decoded = await verifyToken(token)
  if (!decoded) return null
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { 
        cart: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    })
    return user
  } catch (error) {
    console.error('Error fetching user from token:', error)
    return null
  }
}

// Middleware helper to get user from request
export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization')
  let token = authHeader?.split(' ')[1]
  
  if (!token) {
    // Try to get from cookie if using Next.js cookies
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split('; ').map(c => c.split('='))
      )
      token = cookies['auth_token']
    }
  }
  
  return getUserFromToken(token || null)
}

// Check if user is admin
export async function isAdmin(token: string | null): Promise<boolean> {
  const user = await getUserFromToken(token)
  return user?.role === 'ADMIN'
}