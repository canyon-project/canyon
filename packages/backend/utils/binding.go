package utils

import (
	"reflect"

	"github.com/gin-gonic/gin"
)

// BindingHelper 绑定助手
type BindingHelper struct{}

// NewBindingHelper 创建绑定助手
func NewBindingHelper() *BindingHelper {
	return &BindingHelper{}
}

// BindAndValidate 绑定并验证请求参数
func (b *BindingHelper) BindAndValidate(c *gin.Context, obj interface{}) error {
	// 根据请求方法选择绑定方式
	if c.Request.Method == "GET" {
		if err := c.ShouldBindQuery(obj); err != nil {
			return err
		}
	} else {
		if err := c.ShouldBindJSON(obj); err != nil {
			return err
		}
	}

	// 设置RequestID（如果对象有RequestID字段）
	if err := b.setRequestID(c, obj); err != nil {
		return err
	}

	return nil
}

// setRequestID 设置RequestID到对象中
func (b *BindingHelper) setRequestID(c *gin.Context, obj interface{}) error {
	requestID := c.GetString("requestID")
	if requestID == "" {
		return nil
	}

	// 使用反射设置RequestID字段
	v := reflect.ValueOf(obj)
	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}

	if v.Kind() != reflect.Struct {
		return nil
	}

	field := v.FieldByName("RequestID")
	if field.IsValid() && field.CanSet() && field.Kind() == reflect.String {
		field.SetString(requestID)
	}

	return nil
}

// ValidateStruct 验证结构体字段
func (b *BindingHelper) ValidateStruct(obj interface{}) []string {
	var errors []string
	
	v := reflect.ValueOf(obj)
	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}

	if v.Kind() != reflect.Struct {
		return errors
	}

	t := v.Type()
	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		fieldType := t.Field(i)
		
		// 检查required标签
		if tag := fieldType.Tag.Get("binding"); tag == "required" {
			if field.Kind() == reflect.String && field.String() == "" {
				errors = append(errors, fieldType.Name+" is required")
			}
		}
	}

	return errors
}

// 全局绑定助手实例
var Binding = NewBindingHelper()