package audit

import (
	"context"
	"log/slog"

	"github.com/yonsina94/go-user-manager/internal/logging"
	"github.com/yonsina94/go-user-manager/internal/modules/audit/entities"
	"github.com/yonsina94/go-user-manager/internal/modules/enums"
	"github.com/yonsina94/go-user-manager/pkg/query"
	"gorm.io/gorm"
)

type LogActionParams struct {
	UserID    *uint
	UserEmail string
	Action    enums.AuditAction
	Entity    enums.AuditEntity
	EntityID  *uint
	Status    enums.AuditStatus
	Method    string
	Path      string
	Details   string
	Payload   string
	IP        string
	UserAgent string
}

type AuditService struct {
	db     *gorm.DB
	logger *slog.Logger
}

func NewAuditService(db *gorm.DB, lf *logging.LoggerFactory) *AuditService {
	logger := lf.CreateLogger(logging.ComponentDetails{
		Name:        "AuditService",
		Type:        "Service",
		Description: "Servicio para registrar y consultar logs de auditoría",
	})

	if db != nil {
		_ = db.AutoMigrate(&entities.AuditLog{})
	}

	return &AuditService{
		db:     db,
		logger: logger,
	}
}

// LogAction inserta una nueva entrada de auditoría detallada en la base de datos
func (s *AuditService) LogAction(ctx context.Context, params LogActionParams) {
	if s.db == nil {
		return
	}

	status := params.Status
	if status == "" {
		status = enums.AuditStatusSuccess
	}

	logEntry := entities.AuditLog{
		UserID:    params.UserID,
		UserEmail: params.UserEmail,
		Action:    params.Action,
		Entity:    params.Entity,
		EntityID:  params.EntityID,
		Status:    status,
		Method:    params.Method,
		Path:      params.Path,
		Details:   params.Details,
		Payload:   params.Payload,
		IPAddress: params.IP,
		UserAgent: params.UserAgent,
	}

	go func() {
		if err := s.db.Create(&logEntry).Error; err != nil {
			s.logger.Error("Error guardando log de auditoría", slog.Any("error", err))
		}
	}()
}

// FindAll busca y pagina logs de auditoría utilizando el motor QueryFilter con sesiones limpias de GORM
func (s *AuditService) FindAll(ctx context.Context, filter *query.QueryFilter) ([]entities.AuditLog, int64, error) {
	var logs []entities.AuditLog
	var total int64

	if s.db == nil {
		return []entities.AuditLog{}, 0, nil
	}

	// 1. Conteo total con filtro aislado en sesión limpia
	countDb := s.db.WithContext(ctx).Model(&entities.AuditLog{})
	if filter != nil {
		if len(filter.Filters) > 0 || (filter.Search != nil && (len(filter.Search.And) > 0 || len(filter.Search.Or) > 0)) {
			countFilter := *filter
			countFilter.Pagination = nil
			countFilter.OrderBy = nil
			countDb = countDb.Scopes(query.ApplyQueryFilter(&countFilter))
		}
	}

	if err := countDb.Count(&total).Error; err != nil {
		s.logger.ErrorContext(ctx, "Error contando logs de auditoría", slog.Any("error", err))
		return nil, 0, err
	}

	// 2. Orden por defecto: Fecha descendente (últimos registros primero)
	if filter != nil && len(filter.OrderBy) == 0 {
		filter.OrderBy = map[string]query.OrderInfo{
			"createdAt": {Order: "DESC"},
		}
	}

	// 3. Consulta de registros con sesión limpia
	err := s.db.WithContext(ctx).
		Model(&entities.AuditLog{}).
		Scopes(query.ApplyQueryFilter(filter)).
		Find(&logs).Error

	if err != nil {
		s.logger.ErrorContext(ctx, "Error buscando logs de auditoría", slog.Any("error", err))
		return nil, 0, err
	}

	return logs, total, nil
}
