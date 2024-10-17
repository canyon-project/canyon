# Zstd+Protobuf 压缩与 Zstd 直接压缩比较

安装pnpm、nodejs18以上版本后，执行以下命令：

```bash
pnpm install
cd packages/canyon-backend
pnpm run do-test
```

## 一、压缩耗时
- **Zstd+Protobuf 压缩**：11 ms
- **Zstd 直接压缩**：2 ms

可以看出 Zstd 直接压缩在压缩耗时上更具优势。

## 二、压缩前大小
两种压缩方式的压缩前大小均为 72971b。

## 三、压缩后大小
- **Zstd+Protobuf 压缩**：9596b
- **Zstd 直接压缩**：11292b

Zstd+Protobuf 压缩后的大小更小。

## 四、压缩率
- **Zstd+Protobuf 压缩**：86.85%
- **Zstd 直接压缩**：84.53%

Zstd+Protobuf 压缩的压缩率更高。

备注：
1. zstd压缩等级不生效，待解决。
2. protobuf压缩耗时方面，待优化。一些coverageData的枚举值，可以通过数字代替，减少序列化时的字符串长度。
