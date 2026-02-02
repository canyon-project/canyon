import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const repoList = await prisma.repo.findMany({
    where: {},
  });
  // 如果表不存在，返回空数组（表可能还未创建）
  return NextResponse.json({
    success: true,
    data: repoList,
    total: 0,
    message: 'User table does not exist',
  });
}
