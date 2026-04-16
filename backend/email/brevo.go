package email

import (
	"fmt"
	netmail "net/mail"
	"os"
	"strconv"
	"strings"

	"github.com/go-mail/mail"
)

var (
	fromHeader string
	fromName   string
	fromEmail  string
	dialer     *mail.Dialer
)

// Init reads Brevo SMTP settings from the environment. If required variables are missing,
// sending is disabled until they are set (Configured returns false).
func Init() {
	host := strings.TrimSpace(os.Getenv("BREVO_SMTP_HOST"))
	if host == "" {
		host = "smtp-relay.brevo.com"
	}

	port := 587
	if p := strings.TrimSpace(os.Getenv("BREVO_SMTP_PORT")); p != "" {
		if n, err := strconv.Atoi(p); err == nil && n > 0 {
			port = n
		}
	}

	user := strings.TrimSpace(os.Getenv("BREVO_SMTP_USER"))
	pass := strings.TrimSpace(os.Getenv("BREVO_SMTP_KEY"))
	fromHeader = strings.TrimSpace(os.Getenv("BREVO_SMTP_FROM"))
	fromName = ""
	fromEmail = ""
	if addr, err := netmail.ParseAddress(fromHeader); err == nil && addr != nil {
		fromName = strings.TrimSpace(addr.Name)
		fromEmail = strings.TrimSpace(addr.Address)
	}

	if user == "" || pass == "" || fromHeader == "" {
		dialer = nil
		return
	}

	d := mail.NewDialer(host, port, user, pass)
	d.StartTLSPolicy = mail.MandatoryStartTLS
	dialer = d
}

func Configured() bool {
	return dialer != nil
}

// SendHTML sends a single HTML email. The From address must match a verified sender in Brevo.
func SendHTML(to, subject, htmlBody string) error {
	if dialer == nil {
		return fmt.Errorf("email not configured: set BREVO_SMTP_USER, BREVO_SMTP_KEY, and BREVO_SMTP_FROM")
	}
	to = strings.TrimSpace(to)
	if to == "" {
		return fmt.Errorf("recipient address is empty")
	}
	m := mail.NewMessage()
	if fromEmail != "" {
		m.SetAddressHeader("From", fromEmail, fromName)
	} else {
		m.SetHeader("From", fromHeader)
	}
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", htmlBody)
	if err := dialer.DialAndSend(m); err == nil {
		return nil
	}

	// Brevo also supports implicit TLS on 465; use it as a fallback if STARTTLS fails.
	if strings.EqualFold(dialer.Host, "smtp-relay.brevo.com") && dialer.Port == 587 {
		fallback := mail.NewDialer(dialer.Host, 465, dialer.Username, dialer.Password)
		fallback.SSL = true
		fallback.StartTLSPolicy = mail.NoStartTLS
		if err := fallback.DialAndSend(m); err == nil {
			return nil
		} else {
			return fmt.Errorf("smtp send failed on 587 and 465: %w", err)
		}
	}

	return fmt.Errorf("smtp send failed: check BREVO_SMTP_* config and verified sender")
}
