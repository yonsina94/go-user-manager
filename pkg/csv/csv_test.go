package csv_test

import (
	"strings"
	"testing"
	"time"

	"github.com/yonsina94/go-user-manager/pkg/csv"
)

type RichTestItem struct {
	ID        uint      `csv:"ID"`
	Name      string    `csv:"Nombre;case:title"`
	Role      string    `csv:"Rol;case:upper"`
	Active    bool      `csv:"Estado;boolean:Activo/Inactivo"`
	Bio       string    `csv:"Biografía;default:Sin biografía;truncate:15"`
	Price     float64   `csv:"Precio;prefix:$"`
	Rating    int       `csv:"Calificación;suffix: pts"`
	CreatedAt time.Time `csv:"Fecha;date_format:02/01/2006"`
	Secret    string    `csv:"-"`
}

func TestMarshalCSV_RichAttributes(t *testing.T) {
	t.Parallel()

	now := time.Date(2026, 7, 25, 14, 30, 0, 0, time.UTC)

	items := []RichTestItem{
		{
			ID:        1,
			Name:      "juan carlos",
			Role:      "admin",
			Active:    true,
			Bio:       "", // Debe usar el default: "Sin biografía"
			Price:     99.99,
			Rating:    5,
			CreatedAt: now,
			Secret:    "super_secret",
		},
		{
			ID:        2,
			Name:      "maría lópez",
			Role:      "user",
			Active:    false,
			Bio:       "Desarrolladora senior de software con amplia experiencia", // Debe truncarse
			Price:     49.50,
			Rating:    4,
			CreatedAt: now,
			Secret:    "secret_2",
		},
	}

	data, err := csv.MarshalCSV(items)
	if err != nil {
		t.Fatalf("unexpected error marshaling rich CSV: %v", err)
	}

	content := string(data)

	// Verificaciones
	expectedHeader := "ID,Nombre,Rol,Estado,Biografía,Precio,Calificación,Fecha"
	if !strings.Contains(content, expectedHeader) {
		t.Errorf("Header no coincide. Obtenido:\n%s\nEsperado:\n%s", content, expectedHeader)
	}

	// Juan Carlos (title, upper, boolean:Activo, default:Sin biografía, prefix:$, suffix: pts, date_format:25/07/2026)
	expectedRow1 := "1,Juan Carlos,ADMIN,Activo,Sin biografía,$99.99,5 pts,25/07/2026"
	if !strings.Contains(content, expectedRow1) {
		t.Errorf("Fila 1 no coincide. Obtenido:\n%s\nEsperado:\n%s", content, expectedRow1)
	}

	// María López (truncate:15 -> "Desarrollado...")
	if !strings.Contains(content, "Desarrollado...") {
		t.Errorf("Truncado no aplicado correctamente en Fila 2. Obtenido:\n%s", content)
	}

	// Inactivo
	if !strings.Contains(content, "Inactivo") {
		t.Errorf("Boolean Inactivo no traducido correctamente. Obtenido:\n%s", content)
	}

	// Campo secreto debe estar ignorado
	if strings.Contains(content, "super_secret") {
		t.Errorf("El campo marcado con csv:\"-\" no fue ignorado")
	}
}
