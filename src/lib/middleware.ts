import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './auth';

export async function authenticateRequest(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    return payload;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function requireAuth(request: NextRequest): JWTPayload {
  const payload = authenticateRequest(request);
  
  if (!payload) {
    throw new Error('Unauthorized');
  }
  
  return payload as any;
}

export async function requireAdmin(request: NextRequest): Promise<JWTPayload> {
  const payload = await authenticateRequest(request);
  
  if (!payload || payload.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }
  
  return payload;
}
