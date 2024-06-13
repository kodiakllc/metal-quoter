import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: '/api/upload',
  unstable_allowDynamic: [
    '/node_modules/pdf-parse/**',
  ],
};
