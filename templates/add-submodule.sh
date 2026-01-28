#!/bin/bash

# 添加模板仓库作为 git submodule 的脚本
# 使用方法: ./add-submodule.sh <template-name> <repository-url>

if [ $# -ne 2 ]; then
  echo "使用方法: $0 <template-name> <repository-url>"
  echo "示例: $0 report-template-playwright https://github.com/canyon-project/report-template-playwright.git"
  exit 1
fi

TEMPLATE_NAME=$1
REPO_URL=$2
TEMPLATE_DIR="templates/$TEMPLATE_NAME"

echo "正在添加子模块: $TEMPLATE_NAME"
echo "仓库地址: $REPO_URL"
echo "目标目录: $TEMPLATE_DIR"

git submodule add "$REPO_URL" "$TEMPLATE_DIR"

if [ $? -eq 0 ]; then
  echo "✅ 成功添加子模块 $TEMPLATE_NAME"
  echo ""
  echo "提示:"
  echo "1. 在 GitHub 上，templates/$TEMPLATE_NAME 文件夹会显示一个链接图标"
  echo "2. 点击该文件夹可以跳转到对应的子仓库"
  echo "3. 提交更改: git commit -m 'Add template submodule: $TEMPLATE_NAME'"
else
  echo "❌ 添加子模块失败"
  exit 1
fi
