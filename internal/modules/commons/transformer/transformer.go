package transformer

// Transformer representa un traductor bidireccional puro y sin estado entre dos tipos.
// E (Entity) representa la estructura de persistencia/negocio.
// D (DTO) representa la estructura de transferencia de datos.
type Transformer[E any, D any] interface {
	// ToDTO convierte una entidad en su DTO correspondiente.
	ToDTO(entity E) D
	// ToEntity convierte un DTO en su entidad correspondiente.
	ToEntity(dto D) E
}

// MapSliceToDTO mapea un slice de entidades a un slice de DTOs utilizando el transformer provisto.
func MapSliceToDTO[E any, D any](t Transformer[E, D], entities []E) []D {
	if entities == nil {
		return nil
	}
	dtos := make([]D, len(entities))
	for i, entity := range entities {
		dtos[i] = t.ToDTO(entity)
	}
	return dtos
}

// MapSliceToEntity mapea un slice de DTOs a un slice de entidades utilizando el transformer provisto.
func MapSliceToEntity[E any, D any](t Transformer[E, D], dtos []D) []E {
	if dtos == nil {
		return nil
	}
	entities := make([]E, len(dtos))
	for i, dto := range dtos {
		entities[i] = t.ToEntity(dto)
	}
	return entities
}
