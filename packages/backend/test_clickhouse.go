package main

import (
	"backend/db"
	"backend/services"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(".env"); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize database connection
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Initialize ClickHouse
	db.InitClickHouse()

	// Create coverage final service
	coverageService := services.NewCoverageFinalService(database)

	// Test coverage map query
	params := services.CoverageQueryParams{
		Provider: "gitlab",
		RepoID:   "test-repo",
		SHA:      "abc123def456",
	}

	log.Println("Testing coverage map query...")
	coverageMap, err := coverageService.GetCoverageMap(params)
	if err != nil {
		log.Printf("Coverage map query failed: %v", err)
	} else {
		log.Printf("Coverage map query successful, got %d files", len(coverageMap))
	}

	log.Println("Testing coverage summary map query...")
	summaryMap, err := coverageService.GetCoverageSummaryMap(params)
	if err != nil {
		log.Printf("Coverage summary map query failed: %v", err)
	} else {
		log.Printf("Coverage summary map query successful, got %d files", len(summaryMap))
	}

	log.Println("Test completed")
}