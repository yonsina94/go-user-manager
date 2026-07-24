package logging

import (
	"context"
	"log/slog"
)

type MaskingHandler struct {
	handler      slog.Handler
	maskingRules MaskingRules
}

func NewMaskingHandler(h slog.Handler, rules MaskingRules) *MaskingHandler {
	return &MaskingHandler{handler: h, maskingRules: rules}
}

func (h *MaskingHandler) Enabled(ctx context.Context, level slog.Level) bool {
	return h.handler.Enabled(ctx, level)
}

func (h *MaskingHandler) Handle(ctx context.Context, r slog.Record) error {
	newRecord := slog.NewRecord(r.Time, r.Level, r.Message, r.PC)

	var processAttrs func(attrs []slog.Attr) []slog.Attr
	processAttrs = func(attrs []slog.Attr) []slog.Attr {
		processed := make([]slog.Attr, len(attrs))
		for i, attr := range attrs {
			if masker, ok := h.maskingRules[attr.Key]; ok {
				processed[i] = slog.Any(attr.Key, masker(attr.Value))
			} else if attr.Value.Kind() == slog.KindGroup {
				subAttrs := processAttrs(attr.Value.Group())
				anyAttrs := make([]any, len(subAttrs))
				for j, subAttr := range subAttrs {
					anyAttrs[j] = subAttr
				}
				processed[i] = slog.Group(attr.Key, anyAttrs...)
			} else {
				processed[i] = attr
			}
		}
		return processed
	}

	originalAttrs := getAttrs(r)
	finalAttrs := processAttrs(originalAttrs)
	newRecord.AddAttrs(finalAttrs...)

	return h.handler.Handle(ctx, newRecord)
}

func (h *MaskingHandler) WithAttrs(attrs []slog.Attr) slog.Handler {
	return NewMaskingHandler(h.handler.WithAttrs(attrs), h.maskingRules)
}

func (h *MaskingHandler) WithGroup(name string) slog.Handler {
	return NewMaskingHandler(h.handler.WithGroup(name), h.maskingRules)
}

func getAttrs(r slog.Record) []slog.Attr {
	var attrs []slog.Attr
	r.Attrs(func(a slog.Attr) bool {
		attrs = append(attrs, a)
		return true
	})
	return attrs
}
