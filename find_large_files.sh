#!/bin/bash

# 查找较大文件的Shell脚本，排除node_modules目录
# 使用方法: ./find_large_files.sh [目录路径] [大小阈值(MB)] [显示数量]

# 设置要搜索的目录，默认为当前目录
SEARCH_DIR="${1:-.}"

# 设置大小阈值，默认为10MB
SIZE_THRESHOLD="${2:-1}"

# 设置显示数量，默认为前20个
LIMIT="${3:-20}"

# 执行查找命令
echo "正在查找目录 '${SEARCH_DIR}' 中大于 ${SIZE_THRESHOLD}MB 的文件..."
echo "将显示前 ${LIMIT} 个最大的文件"
echo "跳过目录: node_modules"
echo "----------------------------------------"

# 查找大于指定大小的文件并按大小排序，同时排除node_modules目录
find "$SEARCH_DIR" \( -name 'node_modules' -type d -prune \) -o \( -type f -size +"${SIZE_THRESHOLD}"M -exec du -h {} + \) | sort -rh | head -n "$LIMIT"

# 显示统计信息
file_count=$(find "$SEARCH_DIR" \( -name 'node_modules' -type d -prune \) -o \( -type f -size +"${SIZE_THRESHOLD}"M \) | wc -l)
echo "----------------------------------------"
echo "共找到 ${file_count} 个大于 ${SIZE_THRESHOLD}MB 的文件"
echo "已显示前 ${LIMIT} 个"
