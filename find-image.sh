#!/bin/bash

# 查找图片文件的Shell脚本
# 使用方法: ./find_images.sh [目录路径]

# 设置要搜索的目录，默认为当前目录
SEARCH_DIR="${1:-.}"

# 定义图片文件扩展名（忽略大小写）
IMAGE_EXTENSIONS=(
  "jpg" "jpeg" "png" "gif" "bmp" "tiff" "tif"
  "webp" "svg" "ico" "heic" "heif" "avif"
)

# 构建find命令的参数
EXTENSION_PARAMS=""
for ext in "${IMAGE_EXTENSIONS[@]}"; do
  if [ -z "$EXTENSION_PARAMS" ]; then
    EXTENSION_PARAMS="-iname \"*.${ext}\""
  else
    EXTENSION_PARAMS="${EXTENSION_PARAMS} -o -iname \"*.${ext}\""
  fi
done

# 执行查找命令
echo "正在查找目录 '${SEARCH_DIR}' 中的图片文件..."
echo "支持的图片格式: ${IMAGE_EXTENSIONS[*]}"
echo "跳过目录: node_modules"
echo "----------------------------------------"

# 使用eval执行命令，因为我们需要动态构建参数
# 添加-prune选项跳过node_modules目录
eval "find \"${SEARCH_DIR}\" \( -name 'node_modules' -type d -prune \) -o \( -type f \( ${EXTENSION_PARAMS} \) -print \)"

# 显示统计信息
file_count=$(eval "find \"${SEARCH_DIR}\" \( -name 'node_modules' -type d -prune \) -o \( -type f \( ${EXTENSION_PARAMS} \) -print \) | wc -l")
echo "----------------------------------------"
echo "共找到 ${file_count} 个图片文件"
