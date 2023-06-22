import { auth } from './auth'
import { NextRequest, NextResponse } from 'next/server'
export const middleware = (req: NextRequest) => {
  const res = NextResponse.next()
  res.headers.set('Cache-Control', 'no-store, max-age=0')
  //TODO: this is a hack to ensure that the next-auth can use the edge middleware interfaces. testing only
  return auth(req as any, res as any)
}
