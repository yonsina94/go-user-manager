package csv

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"reflect"
	"strconv"
	"strings"
	"time"
)

// TagOptions representa la configuración extraída de etiquetas como `csv:"Nombre;default:N/A;case:title;date_format:02/01/2006"`
type TagOptions struct {
	Header     string
	Ignored    bool
	Default    string
	Case       string
	DateFormat string
	BoolTrue   string
	BoolFalse  string
	Prefix     string
	Suffix     string
	Truncate   int
	Format     string
	Params     map[string]string
}

func parseCSVTag(tag string) TagOptions {
	opts := TagOptions{
		Params: make(map[string]string),
	}

	if tag == "" || tag == "-" {
		opts.Ignored = true
		return opts
	}

	parts := strings.Split(tag, ";")
	header := strings.TrimSpace(parts[0])

	if header == "-" {
		opts.Ignored = true
		return opts
	}

	opts.Header = header

	for _, part := range parts[1:] {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}

		kv := strings.SplitN(part, ":", 2)
		if len(kv) == 2 {
			key := strings.TrimSpace(strings.ToLower(kv[0]))
			val := strings.TrimSpace(kv[1])
			opts.Params[key] = val

			switch key {
			case "default":
				opts.Default = val
			case "case":
				opts.Case = strings.ToLower(val)
			case "date_format":
				opts.DateFormat = val
			case "boolean":
				boolParts := strings.SplitN(val, "/", 2)
				if len(boolParts) == 2 {
					opts.BoolTrue = boolParts[0]
					opts.BoolFalse = boolParts[1]
				}
			case "prefix":
				opts.Prefix = kv[1]
			case "suffix":
				opts.Suffix = kv[1]
			case "truncate":
				if n, err := strconv.Atoi(val); err == nil && n > 0 {
					opts.Truncate = n
				}
			case "format":
				opts.Format = val
			}
		} else {
			opts.Params[strings.ToLower(part)] = "true"
		}
	}

	return opts
}

// MarshalCSV convierte un slice de structs etiquetados con `csv:"..."` a un buffer CSV en UTF-8 con BOM.
func MarshalCSV[T any](items []T) ([]byte, error) {
	var empty T
	typ := reflect.TypeOf(empty)

	if typ.Kind() == reflect.Ptr {
		typ = typ.Elem()
	}

	if typ.Kind() != reflect.Struct {
		return nil, fmt.Errorf("MarshalCSV requiere un slice de structs, se obtuvo %s", typ.Kind())
	}

	var headers []string
	var fieldIndices []int
	var parsedOptions []TagOptions

	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)
		tag := field.Tag.Get("csv")
		opts := parseCSVTag(tag)

		if opts.Ignored {
			continue
		}

		headers = append(headers, opts.Header)
		fieldIndices = append(fieldIndices, i)
		parsedOptions = append(parsedOptions, opts)
	}

	buf := new(bytes.Buffer)
	// Escribir BOM de UTF-8 para compatibilidad nativa con Microsoft Excel
	buf.Write([]byte{0xEF, 0xBB, 0xBF})
	writer := csv.NewWriter(buf)

	// Escribir fila de encabezados
	if err := writer.Write(headers); err != nil {
		return nil, fmt.Errorf("error escribiendo encabezados CSV: %w", err)
	}

	// Si no hay elementos, devolver solo los encabezados
	if len(items) == 0 {
		writer.Flush()
		return buf.Bytes(), writer.Error()
	}

	// Escribir filas de datos
	for _, item := range items {
		itemVal := reflect.ValueOf(item)
		if itemVal.Kind() == reflect.Ptr {
			itemVal = itemVal.Elem()
		}

		row := make([]string, len(fieldIndices))
		for idx, fieldIdx := range fieldIndices {
			fieldVal := itemVal.Field(fieldIdx)
			opts := parsedOptions[idx]

			row[idx] = formatFieldValue(fieldVal, opts)
		}

		if err := writer.Write(row); err != nil {
			return nil, fmt.Errorf("error escribiendo fila CSV: %w", err)
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return nil, fmt.Errorf("error en flush de CSV: %w", err)
	}

	return buf.Bytes(), nil
}

func formatFieldValue(v reflect.Value, opts TagOptions) string {
	var result string

	switch v.Kind() {
	case reflect.Bool:
		if opts.BoolTrue != "" || opts.BoolFalse != "" {
			if v.Bool() {
				result = opts.BoolTrue
			} else {
				result = opts.BoolFalse
			}
		} else if opts.Format == "status" || opts.Format == "" {
			if v.Bool() {
				result = "Activo"
			} else {
				result = "Inactivo"
			}
		} else {
			result = strconv.FormatBool(v.Bool())
		}
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		result = strconv.FormatInt(v.Int(), 10)
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		result = strconv.FormatUint(v.Uint(), 10)
	case reflect.Float32, reflect.Float64:
		result = strconv.FormatFloat(v.Float(), 'f', -1, 64)
	case reflect.String:
		result = v.String()
		// Formateo de fecha si es string en formato ISO/Timestamp y date_format está configurado
		if opts.DateFormat != "" && result != "" {
			if parsedTime, err := parseDateString(result); err == nil {
				result = parsedTime.Format(opts.DateFormat)
			}
		}
	case reflect.Struct:
		if t, ok := v.Interface().(time.Time); ok {
			if opts.DateFormat != "" {
				result = t.Format(opts.DateFormat)
			} else {
				result = t.Format("2006-01-02 15:04:05")
			}
		} else {
			result = fmt.Sprintf("%v", v.Interface())
		}
	default:
		result = fmt.Sprintf("%v", v.Interface())
	}

	// 1. Aplicar valor por defecto si está vacío
	if result == "" && opts.Default != "" {
		result = opts.Default
	}

	// 2. Aplicar transformación de Mayúsculas / Minúsculas / Title
	if result != "" {
		switch opts.Case {
		case "upper":
			result = strings.ToUpper(result)
		case "lower":
			result = strings.ToLower(result)
		case "title":
			result = toTitleCase(result)
		}
	}

	// 3. Aplicar truncado si excede la longitud especificada
	if opts.Truncate > 0 {
		runes := []rune(result)
		if len(runes) > opts.Truncate {
			if opts.Truncate > 3 {
				result = string(runes[:opts.Truncate-3]) + "..."
			} else {
				result = string(runes[:opts.Truncate])
			}
		}
	}

	// 4. Aplicar prefijo y sufijo si el resultado no está vacío
	if result != "" {
		if opts.Prefix != "" {
			result = opts.Prefix + result
		}
		if opts.Suffix != "" {
			result = result + opts.Suffix
		}
	}

	return result
}

func parseDateString(str string) (time.Time, error) {
	formats := []string{
		time.RFC3339,
		"2006-01-02T15:04:05Z07:00",
		"2006-01-02 15:04:05",
		"2006-01-02",
	}

	for _, f := range formats {
		if t, err := time.Parse(f, str); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("unrecognized date format: %s", str)
}

func toTitleCase(s string) string {
	words := strings.Fields(s)
	for i, w := range words {
		if len(w) > 0 {
			words[i] = strings.ToUpper(w[:1]) + strings.ToLower(w[1:])
		}
	}
	return strings.Join(words, " ")
}
