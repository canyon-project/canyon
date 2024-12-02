export async function compressDataWithStream (data) {
  const textEncoder = new TextEncoder()
  const input = textEncoder.encode(data)

  const compressionStream = new CompressionStream('gzip')
  const writer = compressionStream.writable.getWriter()
  writer.write(input)
  writer.close()

  const compressedData = []
  const reader = compressionStream.readable.getReader()
  let result
  while (!(result = await reader.read()).done) {
    compressedData.push(result.value)
  }
  return new Blob(compressedData) // 压缩后的数据为 Blob
}
