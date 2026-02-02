import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 获取查询参数
    const provider = searchParams.get('provider');
    const org = searchParams.get('org');
    const repo = searchParams.get('repo');
    const subject = searchParams.get('subject');
    const subjectID = searchParams.get('subjectID');

    // 验证必要参数
    if (!provider || !org || !repo || !subject || !subjectID) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required parameters: provider, org, repo, subject, subjectID',
        },
        { status: 400 },
      );
    }

    // 构建 coverage ID
    const repoId = `${provider}-${org}/${repo}`;
    const coverageId = `${repoId}|${subject}|${subjectID}`;

    // 查询 coverage 数据
    const coverage = await prisma.coverage.findUnique({
      where: { id: coverageId },
    });

    if (!coverage) {
      return NextResponse.json(
        {
          success: false,
          message: 'Coverage data not found',
        },
        { status: 404 },
      );
    }

    // 将 Buffer 转换为 JSON 对象
    // Prisma Bytes 类型在 PostgreSQL 中返回的是 Buffer
    // 但需要确保正确处理
    let diffDataBuffer: Buffer;
    
    // 检查类型并转换
    if (Buffer.isBuffer(coverage.diffData)) {
      diffDataBuffer = coverage.diffData;
    } else if (coverage.diffData instanceof Uint8Array) {
      diffDataBuffer = Buffer.from(coverage.diffData);
    } else {
      // Prisma 可能返回其他格式，尝试转换
      const data = coverage.diffData as any;
      if (Array.isArray(data)) {
        // 如果是数字数组，转换为 Buffer
        diffDataBuffer = Buffer.from(data);
      } else if (typeof data === 'string') {
        // 如果是字符串，可能需要先解码
        diffDataBuffer = Buffer.from(data, 'utf-8');
      } else {
        // 尝试直接转换
        diffDataBuffer = Buffer.from(data);
      }
    }
    
    const diffDataJson = diffDataBuffer.toString('utf-8');
    const diffDataFiles = JSON.parse(diffDataJson);

    // 返回数据
    return NextResponse.json({
      success: true,
      data: {
        id: coverage.id,
        subject: coverage.subject,
        subjectID: coverage.subjectID,
        diffData: diffDataFiles,
        createdAt: coverage.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error querying coverage data:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to query coverage data',
      },
      { status: 500 },
    );
  }
}
