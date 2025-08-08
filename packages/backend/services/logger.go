package services

import (
	"backend/db"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"
)

// RequestLogService 写入请求追踪日志到 Postgres
type RequestLogService struct {
	sqlDB *sql.DB
}

func NewRequestLogService() *RequestLogService {
	return &RequestLogService{sqlDB: db.GetSqlDB()}
}

// RequestLogStep 入库一条步骤日志
// level: DEBUG/INFO/WARN/ERROR
// statusCode 可为 0 表示中间步骤
func (s *RequestLogService) RequestLogStep(
	id string,
	provider string,
	serviceName string,
	route string,
	method string,
	statusCode int,
	requestID string,
	traceID string,
	spanID string,
	parentSpanID string,
	level string,
	message string,
	attributes map[string]interface{},
	errors map[string]interface{},
	repoID string,
	sha string,
	start time.Time,
	end time.Time,
) error {
	if s == nil || s.sqlDB == nil {
		return fmt.Errorf("request log service not initialized")
	}

	attrsJSON := []byte("{}")
	errsJSON := []byte("{}")
	var err error
	if attributes != nil {
		attrsJSON, err = json.Marshal(attributes)
		if err != nil {
			attrsJSON = []byte("{}")
		}
	}
	if errors != nil {
		errsJSON, err = json.Marshal(errors)
		if err != nil {
			errsJSON = []byte("{}")
		}
	}

	duration := end.Sub(start).Milliseconds()

	_, execErr := s.sqlDB.Exec(
		`INSERT INTO public.canyonjs_request_log
        (id, provider, service_name, route, method, status_code, request_id, trace_id, span_id, parent_span_id,
         start_time, end_time, duration_ms, level, message, attributes, errors, repo_id, sha)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, $16::jsonb, $17::jsonb, $18,$19)`,
		id, provider, serviceName, route, method, statusCode, requestID, traceID, spanID, parentSpanID,
		start, end, duration, level, message, string(attrsJSON), string(errsJSON), repoID, sha,
	)
	return execErr
}
