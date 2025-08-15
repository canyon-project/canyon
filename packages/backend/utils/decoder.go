package utils

import (
	"encoding/base64"
)

// DecoderHelper 解码助手
type DecoderHelper struct{}

// NewDecoderHelper 创建解码助手
func NewDecoderHelper() *DecoderHelper {
	return &DecoderHelper{}
}

// DecodeBase64OrUseOriginal 尝试Base64解码，如果失败则使用原始字符串
func (d *DecoderHelper) DecodeBase64OrUseOriginal(input string) string {
	if input == "" {
		return input
	}

	decodedBytes, err := base64.StdEncoding.DecodeString(input)
	if err != nil {
		// 如果不是base64编码，直接使用原始字符串
		return input
	}
	
	return string(decodedBytes)
}

// 全局解码助手实例
var Decoder = NewDecoderHelper()