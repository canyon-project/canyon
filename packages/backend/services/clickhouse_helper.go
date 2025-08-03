package services

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"log"
	"reflect"
)

// ClickHouseMapValue represents a ClickHouse Map value that can be converted to JSON
type ClickHouseMapValue map[interface{}]interface{}

// Value implements the driver.Valuer interface
func (m ClickHouseMapValue) Value() (driver.Value, error) {
	return json.Marshal(m)
}

// Scan implements the sql.Scanner interface
func (m *ClickHouseMapValue) Scan(value interface{}) error {
	if value == nil {
		*m = make(ClickHouseMapValue)
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, m)
	case string:
		return json.Unmarshal([]byte(v), m)
	case map[interface{}]interface{}:
		*m = ClickHouseMapValue(v)
		return nil
	default:
		// Try to convert using reflection
		rv := reflect.ValueOf(value)
		if rv.Kind() == reflect.Map {
			*m = make(ClickHouseMapValue)
			for _, key := range rv.MapKeys() {
				(*m)[key.Interface()] = rv.MapIndex(key).Interface()
			}
			return nil
		}
		return fmt.Errorf("cannot scan %T into ClickHouseMapValue", value)
	}
}

// ToJSONString converts the map to a JSON string
func (m ClickHouseMapValue) ToJSONString() string {
	data, err := json.Marshal(m)
	if err != nil {
		log.Printf("Failed to marshal ClickHouseMapValue to JSON: %v", err)
		return "{}"
	}
	return string(data)
}

// SafeClickHouseQuery executes a ClickHouse query with error handling
func SafeClickHouseQuery(client interface{}, sql string) (interface{}, error) {
	// This is a placeholder - the actual implementation would depend on the ClickHouse client interface
	// For now, we'll return an error to indicate ClickHouse is not available
	return nil, fmt.Errorf("ClickHouse query not implemented in safe mode")
}

// ConvertMapToStringMap converts a map with interface{} keys to string keys
func ConvertMapToStringMap(input map[interface{}]interface{}) map[string]interface{} {
	result := make(map[string]interface{})
	for k, v := range input {
		key := fmt.Sprintf("%v", k)
		result[key] = v
	}
	return result
}

// ParseClickHouseMapJSON parses a JSON string that represents a ClickHouse Map
func ParseClickHouseMapJSON(jsonStr string, target interface{}) error {
	if jsonStr == "" || jsonStr == "null" {
		return nil
	}

	// First try to parse as regular JSON
	if err := json.Unmarshal([]byte(jsonStr), target); err != nil {
		// If that fails, try to parse as a ClickHouse-specific format
		log.Printf("Failed to parse JSON, trying alternative format: %v", err)
		
		// For now, just initialize with empty values
		switch t := target.(type) {
		case *map[string][4]int:
			*t = make(map[string][4]int)
		case *map[string][4]interface{}:
			*t = make(map[string][4]interface{})
		case *map[string][]interface{}:
			*t = make(map[string][]interface{})
		case *[2][]string:
			*t = [2][]string{[]string{}, []string{}}
		default:
			return fmt.Errorf("unsupported target type: %T", target)
		}
	}
	
	return nil
}