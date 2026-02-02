import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { extractBase64FromJsFile } from '../../../../lib/parseJsFile';
import { decompressAndParse } from '../../../../lib/decompress';

export async function POST(request: NextRequest) {
  try {
    // 解析 multipart/form-data
    const formData = await request.formData();
    
    // 获取文件（支持多种字段名）
    let reportDataFile = formData.get('report-data.js') as File | null;
    let diffDataFile = formData.get('diff-data.js') as File | null;
    
    // 如果使用其他字段名，尝试获取
    if (!reportDataFile) {
      reportDataFile = formData.get('reportData') as File | null;
    }
    if (!diffDataFile) {
      diffDataFile = formData.get('diffData') as File | null;
    }
    
    // 获取必要的参数
    const provider = formData.get('provider') as string;
    const org = formData.get('org') as string;
    const repo = formData.get('repo') as string;
    const subject = formData.get('subject') as string;
    const subjectID = formData.get('subjectID') as string;
    
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
    
    // 验证文件是否存在
    if (!reportDataFile || !diffDataFile) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required files: report-data.js and diff-data.js',
        },
        { status: 400 },
      );
    }
    
    // 读取文件内容
    const reportDataContent = await reportDataFile.text();
    const diffDataContent = await diffDataFile.text();
    
    // 解析 report-data.js（这是 JSON 对象，不需要解压）
    // 虽然我们不需要存储 report-data.js 的内容，但需要验证文件格式是否正确
    const reportDataJsonStr = extractBase64FromJsFile(reportDataContent, 'reportData');
    
    if (!reportDataJsonStr) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to parse report-data.js',
        },
        { status: 400 },
      );
    }
    
    // 验证 JSON 格式是否正确（可选，用于验证文件完整性）
    try {
      const reportData = JSON.parse(reportDataJsonStr);
      // 验证必要字段是否存在
      if (!reportData.hasOwnProperty('files')) {
        return NextResponse.json(
          {
            success: false,
            message: 'report-data.js must contain files field',
          },
          { status: 400 },
        );
      }
    } catch (e) {
      return NextResponse.json(
        {
          success: false,
          message: 'report-data.js is not valid JSON',
        },
        { status: 400 },
      );
    }
    
    // 解析 diff-data.js（这是压缩的 base64 字符串）
    const diffDataBase64 = extractBase64FromJsFile(diffDataContent, 'diffData');
    
    if (!diffDataBase64 || diffDataBase64 === '') {
      return NextResponse.json(
        {
          success: false,
          message: 'diff-data.js is empty or invalid',
        },
        { status: 400 },
      );
    }
    
    // 解压 diff-data.js
    const diffDataFiles = decompressAndParse(diffDataBase64);
    
    // 确保 diffDataFiles 是数组
    if (!Array.isArray(diffDataFiles)) {
      return NextResponse.json(
        {
          success: false,
          message: 'diff-data.js must contain an array',
        },
        { status: 400 },
      );
    }
    
    // 构建 ID：provider+repoID|subject|subjectID
    // 需要先获取或创建 repo
    const repoId = `${provider}-${org}/${repo}`;
    const repoPathWithNamespace = `${org}/${repo}`;
    
    // 确保 repo 存在
    await prisma.repo.upsert({
      where: { id: repoId },
      create: {
        id: repoId,
        pathWithNamespace: repoPathWithNamespace,
        createdAt: new Date(),
      },
      update: {},
    });
    
    // 构建 coverage ID
    const coverageId = `${repoId}|${subject}|${subjectID}`;
    
    // 将 diffDataFiles 转换为 JSON 字符串，然后转换为 Buffer
    const diffDataJson = JSON.stringify(diffDataFiles);
    const diffDataBuffer = Buffer.from(diffDataJson, 'utf-8');
    
    // 存储或更新 coverage 数据
    await prisma.coverage.upsert({
      where: { id: coverageId },
      create: {
        id: coverageId,
        subject,
        subjectID,
        diffData: diffDataBuffer,
        noDiffData: Buffer.alloc(0), // 不需要 no-diff-data，使用空 Buffer
        createdAt: new Date(),
      },
      update: {
        diffData: diffDataBuffer,
        noDiffData: Buffer.alloc(0), // 不需要 no-diff-data，使用空 Buffer
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Coverage data uploaded successfully',
      data: {
        coverageId,
        diffFilesCount: diffDataFiles.length,
      },
    });
  } catch (error: any) {
    console.error('Error uploading coverage data:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to upload coverage data',
      },
      { status: 500 },
    );
  }
}
