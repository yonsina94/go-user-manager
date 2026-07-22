package query

import (
	"fmt"
	"strings"

	"gorm.io/gorm"
)

// QueryOperator define los operadores de comparación SQL como cadenas legibles (string).
type QueryOperator string

const (
	EQUAL            QueryOperator = "EQUAL"
	NOT_EQUAL        QueryOperator = "NOT_EQUAL"
	GREATER_THAN     QueryOperator = "GREATER_THAN"
	LESS_THAN        QueryOperator = "LESS_THAN"
	GREATER_OR_EQUAL QueryOperator = "GREATER_OR_EQUAL"
	LESS_OR_EQUAL    QueryOperator = "LESS_OR_EQUAL"
	CONTAINS         QueryOperator = "CONTAINS"
	STARTS_WITH      QueryOperator = "STARTS_WITH"
	ENDS_WITH        QueryOperator = "ENDS_WITH"
	IN_SET           QueryOperator = "IN_SET"
	NOT_IN_SET       QueryOperator = "NOT_IN_SET"
	IS_NULL          QueryOperator = "IS_NULL"
	IS_NOT_NULL      QueryOperator = "IS_NOT_NULL"
	BETWEEN          QueryOperator = "BETWEEN"
)

// FilterCondition representa una condición de comparación individual.
type FilterCondition struct {
	Operator QueryOperator `json:"operator"`
	Value    any           `json:"value"`
}

// Search estructura criterios de agrupación lógica usando mapas AND y OR.
type Search struct {
	And map[string]FilterCondition `json:"and,omitempty"`
	Or  map[string]FilterCondition `json:"or,omitempty"`
}

// OrderInfo configura reglas de ordenamiento de columnas en camelCase.
type OrderInfo struct {
	Order    string `json:"order"` // "ASC" o "DESC"
	IsJSON   bool   `json:"isJson,omitempty"`
	SQLQuery string `json:"sqlQuery,omitempty"`
}

// Pagination especifica los límites de paginación de la consulta.
type Pagination struct {
	Length int32 `json:"length"` // Límite por página (limit)
	Page   int32 `json:"page"`   // Página 1-indexed (offset = (page - 1) * length)
}

// JoinCondition configura declaraciones explícitas de SQL JOIN.
type JoinCondition struct {
	Field string `json:"field"`
	Alias string `json:"alias,omitempty"`
}

// QueryFilter es la estructura generalizada para consultas dinámicas usando estrictamente camelCase.
type QueryFilter struct {
	Pagination *Pagination          `json:"pagination,omitempty"`
	Filters    map[string]any       `json:"filters,omitempty"`
	Search     *Search              `json:"search,omitempty"`
	OrderBy    map[string]OrderInfo `json:"orderBy,omitempty"`
	With       []string             `json:"with,omitempty"`
	Select     []string             `json:"select,omitempty"`
	Join       []JoinCondition      `json:"join,omitempty"`
}

// ApplyQueryFilter devuelve un GORM Scope para aplicar el filtro dinámico a cualquier consulta.
func ApplyQueryFilter(filter *QueryFilter) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if filter == nil {
			return db
		}

		// 1. SELECT columnas específicas
		if len(filter.Select) > 0 {
			var selectedCols []string
			for _, col := range filter.Select {
				selectedCols = append(selectedCols, toSnakeCase(col))
			}
			db = db.Select(selectedCols)
		}

		// 2. JOIN dinámicos
		for _, j := range filter.Join {
			if j.Alias != "" {
				db = db.Joins(fmt.Sprintf("%s AS %s", j.Field, j.Alias))
			} else {
				db = db.Joins(j.Field)
			}
		}

		// 3. PRELOAD relaciones (Equivalent to `with`)
		for _, relation := range filter.With {
			db = db.Preload(relation)
		}

		// 4. FILTROS RÁPIDOS IGUALDAD (map[string]value) - Soporta "user.name", "user.role", etc.
		for field, val := range filter.Filters {
			db = db.Where(fmt.Sprintf("%s = ?", toSnakeCase(field)), val)
		}

		// 5. BÚSQUEDA AVANZADA (AND / OR dentro de Search)
		if filter.Search != nil {
			for field, cond := range filter.Search.And {
				db = buildCondition(db, toSnakeCase(field), cond, false)
			}
			for field, cond := range filter.Search.Or {
				db = buildCondition(db, toSnakeCase(field), cond, true)
			}
		}

		// 6. ORDENAMIENTO (ORDER BY)
		for field, orderInfo := range filter.OrderBy {
			direction := strings.ToUpper(orderInfo.Order)
			if direction != "ASC" && direction != "DESC" {
				direction = "ASC"
			}

			if orderInfo.SQLQuery != "" {
				db = db.Order(orderInfo.SQLQuery)
			} else {
				db = db.Order(fmt.Sprintf("%s %s", toSnakeCase(field), direction))
			}
		}

		// 7. PAGINACIÓN (LIMIT & OFFSET)
		if filter.Pagination != nil && filter.Pagination.Length > 0 {
			page := filter.Pagination.Page
			if page < 1 {
				page = 1
			}
			offset := (page - 1) * filter.Pagination.Length
			db = db.Limit(int(filter.Pagination.Length)).Offset(int(offset))
		}

		return db
	}
}

// Helper para construir la cláusula SQL según el operador (soporta mapas {"from": "...", "to": "..."} para BETWEEN)
func buildCondition(db *gorm.DB, field string, cond FilterCondition, isOr bool) *gorm.DB {
	var query string
	var args []any

	op := strings.ToUpper(strings.TrimSpace(string(cond.Operator)))

	switch op {
	case "EQUAL", "=":
		query, args = fmt.Sprintf("%s = ?", field), []any{cond.Value}
	case "NOT_EQUAL", "!=":
		query, args = fmt.Sprintf("%s != ?", field), []any{cond.Value}
	case "GREATER_THAN", ">":
		query, args = fmt.Sprintf("%s > ?", field), []any{cond.Value}
	case "LESS_THAN", "<":
		query, args = fmt.Sprintf("%s < ?", field), []any{cond.Value}
	case "GREATER_OR_EQUAL", ">=":
		query, args = fmt.Sprintf("%s >= ?", field), []any{cond.Value}
	case "LESS_OR_EQUAL", "<=":
		query, args = fmt.Sprintf("%s <= ?", field), []any{cond.Value}
	case "CONTAINS", "LIKE", "ILIKE":
		query, args = fmt.Sprintf("%s ILIKE ?", field), []any{fmt.Sprintf("%%%v%%", cond.Value)}
	case "STARTS_WITH":
		query, args = fmt.Sprintf("%s ILIKE ?", field), []any{fmt.Sprintf("%v%%", cond.Value)}
	case "ENDS_WITH":
		query, args = fmt.Sprintf("%s ILIKE ?", field), []any{fmt.Sprintf("%%%v", cond.Value)}
	case "IN_SET", "IN":
		query, args = fmt.Sprintf("%s IN (?)", field), []any{cond.Value}
	case "NOT_IN_SET", "NOT_IN":
		query, args = fmt.Sprintf("%s NOT IN (?)", field), []any{cond.Value}
	case "IS_NULL":
		query = fmt.Sprintf("%s IS NULL", field)
	case "IS_NOT_NULL":
		query = fmt.Sprintf("%s IS NOT NULL", field)
	case "BETWEEN":
		if vals, ok := cond.Value.([]any); ok && len(vals) == 2 {
			query, args = fmt.Sprintf("%s BETWEEN ? AND ?", field), vals
		} else if valMap, ok := cond.Value.(map[string]any); ok {
			from, hasFrom := valMap["from"]
			if !hasFrom {
				from, hasFrom = valMap["start"]
			}
			to, hasTo := valMap["to"]
			if !hasTo {
				to, hasTo = valMap["end"]
			}
			if hasFrom && hasTo {
				query, args = fmt.Sprintf("%s BETWEEN ? AND ?", field), []any{from, to}
			}
		}
	}

	if query == "" {
		return db
	}

	if isOr {
		return db.Or(query, args...)
	}
	return db.Where(query, args...)
}

// toSnakeCase convierte automáticamente cualificaciones con punto como "user.createAt" -> "user.create_at" y "createdAt" -> "created_at"
func toSnakeCase(str string) string {
	if strings.Contains(str, ".") {
		parts := strings.SplitN(str, ".", 2)
		return toSnakeCase(parts[0]) + "." + toSnakeCase(parts[1])
	}
	var builder strings.Builder
	for i, r := range str {
		if i > 0 && r >= 'A' && r <= 'Z' {
			builder.WriteRune('_')
		}
		builder.WriteRune(r)
	}
	return strings.ToLower(builder.String())
}
