package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// doJSONRequest is a small helper to perform JSON HTTP requests with timeout and headers.
func doJSONRequest(method, url string, headers map[string]string) (*http.Response, error) {
	client := &http.Client{Timeout: 30 * time.Second}
	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %v", err)
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	return client.Do(req)
}

func decodeJSON[T any](resp *http.Response, out *T) error {
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("请求失败: %s, 响应: %s", resp.Status, string(b))
	}
	if err := json.NewDecoder(resp.Body).Decode(out); err != nil {
		return fmt.Errorf("解析响应失败: %v", err)
	}
	return nil
}
