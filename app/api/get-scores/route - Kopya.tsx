import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'app', 'data', 'week3_scores.json');
  if (!fs.existsSync(filePath)) return NextResponse.json({});
  return NextResponse.json(JSON.parse(fs.readFileSync(filePath, 'utf8')));
}