package services

import (
	"backend/models"
	"math"

	"gorm.io/gorm"
)

type CoverageService struct {
	db *gorm.DB
}

func NewCoverageService(db *gorm.DB) *CoverageService {
	return &CoverageService{
		db: db,
	}
}

// GetCoverageList retrieves paginated coverage data with optional filters
func (s *CoverageService) GetCoverageList(req models.CoverageListRequest) (*models.CoverageListResponse, error) {
	var coverages []models.Coverage
	var total int64

	// Build query with filters
	query := s.db.Model(&models.Coverage{})

	if req.ProjectID != "" {
		query = query.Where("project_id = ?", req.ProjectID)
	}
	if req.Branch != "" {
		query = query.Where("branch = ?", req.Branch)
	}
	if req.Provider != "" {
		query = query.Where("provider = ?", req.Provider)
	}
	if req.CovType != "" {
		query = query.Where("cov_type = ?", req.CovType)
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, err
	}

	// Calculate offset
	offset := (req.Page - 1) * req.PageSize

	// Get paginated data
	if err := query.Order("created_at DESC").
		Offset(offset).
		Limit(req.PageSize).
		Find(&coverages).Error; err != nil {
		return nil, err
	}

	// Calculate total pages
	totalPages := int(math.Ceil(float64(total) / float64(req.PageSize)))

	return &models.CoverageListResponse{
		Data:       coverages,
		Total:      total,
		Page:       req.Page,
		PageSize:   req.PageSize,
		TotalPages: totalPages,
	}, nil
}

// GetCoverageByID retrieves a single coverage record by ID
func (s *CoverageService) GetCoverageByID(id string) (*models.Coverage, error) {
	var coverage models.Coverage

	if err := s.db.Where("id = ?", id).First(&coverage).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	return &coverage, nil
}
