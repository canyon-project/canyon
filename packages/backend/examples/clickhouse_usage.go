package main

import (
	"backend/db"
	"backend/models"
	"backend/services"
	"log"
	"time"
)

// Example usage of ClickHouse integration
func main() {
	// Initialize database connections
	db.InitDB()

	// Create service
	chService := services.NewClickHouseService()

	// Example 1: Insert single coverage hit
	hit := &models.CoverageHit{
		CoverageID:   "test-coverage-123",
		FullFilePath: "/src/main.js",
		S:            map[uint32]uint32{1: 5, 2: 3, 3: 0},
		F:            map[uint32]uint32{1: 1, 2: 1},
		B:            map[uint32]uint32{1: 2, 2: 0},
		Ts:           time.Now(),
	}

	if err := chService.InsertCoverageHit(hit); err != nil {
		log.Printf("Failed to insert coverage hit: %v", err)
	} else {
		log.Println("Coverage hit inserted successfully")
	}

	// Example 2: Batch insert coverage hits
	hits := []models.CoverageHit{
		{
			CoverageID:   "test-coverage-123",
			FullFilePath: "/src/utils.js",
			S:            map[uint32]uint32{1: 10, 2: 8},
			F:            map[uint32]uint32{1: 2},
			B:            map[uint32]uint32{1: 4},
			Ts:           time.Now(),
		},
		{
			CoverageID:   "test-coverage-123",
			FullFilePath: "/src/api.js",
			S:            map[uint32]uint32{1: 15, 2: 12, 3: 5},
			F:            map[uint32]uint32{1: 3, 2: 2},
			B:            map[uint32]uint32{1: 6, 2: 2},
			Ts:           time.Now(),
		},
	}

	if err := chService.BatchInsertCoverageHits(hits); err != nil {
		log.Printf("Failed to batch insert coverage hits: %v", err)
	} else {
		log.Printf("Batch inserted %d coverage hits successfully", len(hits))
	}

	// Example 3: Insert coverage map
	coverageMap := &models.CoverageMap{
		Hash:         "abc123def456",
		StatementMap: map[uint32][4]uint32{1: {1, 0, 1, 10}},
		Ts:           time.Now(),
	}

	if err := chService.InsertCoverageMap(coverageMap); err != nil {
		log.Printf("Failed to insert coverage map: %v", err)
	} else {
		log.Println("Coverage map inserted successfully")
	}

	// Example 4: Query aggregated coverage data
	results, err := chService.GetCoverageAggregation("test-coverage-123")
	if err != nil {
		log.Printf("Failed to get coverage aggregation: %v", err)
	} else {
		log.Printf("Found %d aggregated coverage results", len(results))
		for _, result := range results {
			log.Printf("File: %s, Statements: %v", result.FullFilePath, result.S)
		}
	}

	// Example 5: Query coverage hits by time range
	endTime := time.Now()
	startTime := endTime.Add(-1 * time.Hour)
	
	timeRangeHits, err := chService.GetCoverageHitsByTimeRange("test-coverage-123", startTime, endTime)
	if err != nil {
		log.Printf("Failed to get coverage hits by time range: %v", err)
	} else {
		log.Printf("Found %d coverage hits in the last hour", len(timeRangeHits))
	}
}