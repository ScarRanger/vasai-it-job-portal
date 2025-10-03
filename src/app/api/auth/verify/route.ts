import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, getUserByUid } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify the ID token
    const decodedToken = await verifyIdToken(idToken);
    
    // Get additional user data if needed
    const userRecord = await getUserByUid(decodedToken.uid);
    
    return NextResponse.json({
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: userRecord.emailVerified,
      customClaims: decodedToken,
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}