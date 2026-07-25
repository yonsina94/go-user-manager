package audit

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yonsina94/go-user-manager/internal/logging"
	"github.com/yonsina94/go-user-manager/pkg/dto"
	"github.com/yonsina94/go-user-manager/pkg/query"
)

type AuditController struct {
	service *AuditService
	logger  *slog.Logger
}

func NewAuditController(rg *gin.RouterGroup, service *AuditService, lf *logging.LoggerFactory) *AuditController {
	logger := lf.CreateLogger(logging.ComponentDetails{
		Name:        "AuditController",
		Type:        "Controller",
		Description: "Controlador HTTP para consulta de auditoría",
	})

	controller := &AuditController{
		service: service,
		logger:  logger,
	}

	rg.POST("/search", controller.searchLogs)
	return controller
}

func (c *AuditController) searchLogs(ctx *gin.Context) {
	var filter query.QueryFilter
	if err := ctx.ShouldBindJSON(&filter); err != nil {
		filter = query.QueryFilter{}
	}

	logs, total, err := c.service.FindAll(ctx.Request.Context(), &filter)
	if err != nil {
		c.logger.ErrorContext(ctx.Request.Context(), "Error buscando logs de auditoría", slog.Any("error", err))
		ctx.JSON(http.StatusInternalServerError, dto.NewErrorResponse(err.Error(), "Error al consultar logs de auditoría"))
		return
	}

	ctx.JSON(http.StatusOK, dto.NewSuccessResponse(gin.H{
		"items": logs,
		"total": total,
	}, "Logs de auditoría obtenidos exitosamente"))
}
