package modules

import (
	"github.com/gin-gonic/gin"
	"github.com/yonsina94/go-user-manager/internal/logging"
	"github.com/yonsina94/go-user-manager/internal/modules/user"
	"gorm.io/gorm"
)

func InitModules(db *gorm.DB, lf *logging.LoggerFactory, engine *gin.Engine) {
	rgApi := engine.Group("/api")

	user.NewUserController(rgApi.Group("/user"), user.NewUserService(db, lf), lf)
}
