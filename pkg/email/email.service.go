package email

import (
	"bytes"
	"context"
	"fmt"
	"mime"
	"net/smtp"
	"time"

	"github.com/a-h/templ"
	"github.com/vanng822/go-premailer/premailer"
	emailtemplates "github.com/yonsina94/go-user-manager/templates/email"
)

type EmailService struct {
	smtpHost string
	smtpPort int
	fromAddr string
	smtpUser string
	smtpPass string
}

func NewEmailService(host string, port int, from string, auth ...string) *EmailService {
	if host == "" {
		host = "mailpit"
	}
	if port == 0 {
		port = 1025
	}
	if from == "" {
		from = "no-reply@gousermanager.local"
	}
	var user, pass string
	if len(auth) > 0 {
		user = auth[0]
	}
	if len(auth) > 1 {
		pass = auth[1]
	}
	return &EmailService{
		smtpHost: host,
		smtpPort: port,
		fromAddr: from,
		smtpUser: user,
		smtpPass: pass,
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

	subjectText := "Restablecimiento de Contraseña - GoUserManager"
	return s.sendMail(toEmail, subjectText, htmlBody)
}

// sendMail construye cabeceras RFC 5322 con codificación MIME UTF-8 y saltos de línea CRLF (\r\n)
func (s *EmailService) sendMail(toEmail, subjectText, htmlBody string) error {
	encodedSubject := mime.BEncoding.Encode("UTF-8", subjectText)
	msgID := fmt.Sprintf("<%d.%s>", time.Now().UnixNano(), s.fromAddr)

	var msg bytes.Buffer
	msg.WriteString(fmt.Sprintf("From: %s\r\n", s.fromAddr))
	msg.WriteString(fmt.Sprintf("To: %s\r\n", toEmail))
	msg.WriteString(fmt.Sprintf("Subject: %s\r\n", encodedSubject))
	msg.WriteString(fmt.Sprintf("Date: %s\r\n", time.Now().Format(time.RFC1123Z)))
	msg.WriteString(fmt.Sprintf("Message-ID: %s\r\n", msgID))
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString("Content-Type: text/html; charset=UTF-8\r\n")
	msg.WriteString("Content-Transfer-Encoding: 8bit\r\n")
	msg.WriteString("\r\n")
	msg.WriteString(htmlBody)

	addr := fmt.Sprintf("%s:%d", s.smtpHost, s.smtpPort)

	var auth smtp.Auth
	if s.smtpUser != "" && s.smtpPass != "" {
		auth = smtp.PlainAuth("", s.smtpUser, s.smtpPass, s.smtpHost)
	}

	if err := smtp.SendMail(addr, auth, s.fromAddr, []string{toEmail}, msg.Bytes()); err != nil {
		return fmt.Errorf("error enviando correo via SMTP: %w", err)
	}

	return nil
}

