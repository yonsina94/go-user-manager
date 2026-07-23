package email

import (
	"bytes"
	"context"
	"fmt"
	"net/smtp"

	"github.com/a-h/templ"
	"github.com/vanng822/go-premailer/premailer"
	emailtemplates "github.com/yonsina94/go-user-manager/templates/email"
)

type EmailService struct {
	smtpHost string
	smtpPort int
	fromAddr string
}

func NewEmailService(host string, port int, from string) *EmailService {
	if host == "" {
		host = "mailpit"
	}
	if port == 0 {
		port = 1025
	}
	if from == "" {
		from = "no-reply@gousermanager.local"
	}
	return &EmailService{
		smtpHost: host,
		smtpPort: port,
		fromAddr: from,
	}
}

// RenderAndInlineHTML renderiza un componente templ y le aplica inline de CSS usando go-premailer
func (s *EmailService) RenderAndInlineHTML(ctx context.Context, component templ.Component) (string, error) {
	var buf bytes.Buffer
	if err := component.Render(ctx, &buf); err != nil {
		return "", fmt.Errorf("error renderizando componente templ: %w", err)
	}

	prem, err := premailer.NewPremailerFromString(buf.String(), premailer.NewOptions())
	if err != nil {
		return "", fmt.Errorf("error creando premailer: %w", err)
	}

	inlinedHTML, err := prem.Transform()
	if err != nil {
		return "", fmt.Errorf("error transformando CSS inline: %w", err)
	}

	return inlinedHTML, nil
}

// SendPasswordResetEmail envía el correo de recuperación usando el componente templ y Mailpit (SMTP)
func (s *EmailService) SendPasswordResetEmail(ctx context.Context, toEmail, userName, resetURL string) error {
	props := emailtemplates.ResetPasswordProps{
		UserName: userName,
		ResetURL: resetURL,
	}

	component := emailtemplates.PasswordResetEmail(props)
	htmlBody, err := s.RenderAndInlineHTML(ctx, component)
	if err != nil {
		return fmt.Errorf("error preparando HTML de correo: %w", err)
	}

	subject := "Subject: Restablecimiento de Contraseña - GoUserManager\n"
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	msg := []byte(subject + mime + htmlBody)

	addr := fmt.Sprintf("%s:%d", s.smtpHost, s.smtpPort)

	// Enviar correo via SMTP a Mailpit (puerto 1025)
	if err := smtp.SendMail(addr, nil, s.fromAddr, []string{toEmail}, msg); err != nil {
		return fmt.Errorf("error enviando correo via SMTP: %w", err)
	}

	return nil
}
