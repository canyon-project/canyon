package utils

import (
	"fmt"
	"strings"

	"gorm.io/gorm"
)

// QueryBuilder 查询构建器
type QueryBuilder struct {
	db *gorm.DB
}

// NewQueryBuilder 创建查询构建器
func NewQueryBuilder(db *gorm.DB) *QueryBuilder {
	return &QueryBuilder{db: db}
}

// BuildWhereClause 构建WHERE子句
func (qb *QueryBuilder) BuildWhereClause(conditions map[string]interface{}) *gorm.DB {
	query := qb.db
	for field, value := range conditions {
		if value != nil && value != "" {
			query = query.Where(fmt.Sprintf("%s = ?", field), value)
		}
	}
	return query
}

// BuildInClause 构建IN子句
func (qb *QueryBuilder) BuildInClause(field string, values []string) string {
	if len(values) == 0 {
		return ""
	}

	quotedValues := make([]string, len(values))
	for i, value := range values {
		quotedValues[i] = fmt.Sprintf("'%s'", strings.ReplaceAll(value, "'", "''"))
	}

	return fmt.Sprintf("%s IN (%s)", field, strings.Join(quotedValues, ", "))
}

// BuildSelectQuery 构建SELECT查询
func (qb *QueryBuilder) BuildSelectQuery(table string, fields []string, conditions map[string]interface{}) string {
	selectFields := "*"
	if len(fields) > 0 {
		selectFields = strings.Join(fields, ", ")
	}

	query := fmt.Sprintf("SELECT %s FROM %s", selectFields, table)

	var whereClauses []string
	for field, value := range conditions {
		if value != nil && value != "" {
			whereClauses = append(whereClauses, fmt.Sprintf("%s = '%v'", field, value))
		}
	}

	if len(whereClauses) > 0 {
		query += " WHERE " + strings.Join(whereClauses, " AND ")
	}

	return query
}

// SafeString 安全处理字符串，防止SQL注入
func (qb *QueryBuilder) SafeString(input string) string {
	return strings.ReplaceAll(input, "'", "''")
}

// 全局查询构建器工具函数
var Query = struct {
	BuildInClause   func(field string, values []string) string
	BuildSelectQuery func(table string, fields []string, conditions map[string]interface{}) string
	SafeString      func(input string) string
}{
	BuildInClause: func(field string, values []string) string {
		if len(values) == 0 {
			return ""
		}
		quotedValues := make([]string, len(values))
		for i, value := range values {
			quotedValues[i] = fmt.Sprintf("'%s'", strings.ReplaceAll(value, "'", "''"))
		}
		return fmt.Sprintf("%s IN (%s)", field, strings.Join(quotedValues, ", "))
	},
	BuildSelectQuery: func(table string, fields []string, conditions map[string]interface{}) string {
		selectFields := "*"
		if len(fields) > 0 {
			selectFields = strings.Join(fields, ", ")
		}
		query := fmt.Sprintf("SELECT %s FROM %s", selectFields, table)
		var whereClauses []string
		for field, value := range conditions {
			if value != nil && value != "" {
				whereClauses = append(whereClauses, fmt.Sprintf("%s = '%v'", field, value))
			}
		}
		if len(whereClauses) > 0 {
			query += " WHERE " + strings.Join(whereClauses, " AND ")
		}
		return query
	},
	SafeString: func(input string) string {
		return strings.ReplaceAll(input, "'", "''")
	},
}