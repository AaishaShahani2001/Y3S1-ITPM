package email

import (
	"fmt"
	"html"
	"strings"
)

func sendCounsellorLocationEmail(toEmail, counsellorName, subject, intro, workplace, reason string) error {
	toEmail = strings.TrimSpace(toEmail)
	if toEmail == "" {
		return nil
	}
	if !Configured() {
		return fmt.Errorf("email not configured: set BREVO_SMTP_* variables")
	}

	name := strings.TrimSpace(counsellorName)
	if name == "" {
		name = "Counselor"
	}
	workplace = strings.TrimSpace(workplace)
	if workplace == "" {
		workplace = "Not Assigned"
	}

	reasonBlock := ""
	if strings.TrimSpace(reason) != "" {
		reasonBlock = fmt.Sprintf("<p><strong>Note:</strong> %s</p>", html.EscapeString(reason))
	}

	body := fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #222;">
  <p>Hi %s,</p>
  <p>%s</p>
  <p><strong>Assigned location:</strong> %s</p>
  %s
  <p style="color: #666; font-size: 14px;">This is an automated message from MindBridge.</p>
</body>
</html>`,
		html.EscapeString(name),
		html.EscapeString(intro),
		html.EscapeString(workplace),
		reasonBlock,
	)

	return SendHTML(toEmail, subject, body)
}

// SendCounsellorLocationAssigned emails counselor when location is assigned for the first time.
func SendCounsellorLocationAssigned(toEmail, counsellorName, workplace, reason string) error {
	subject := "MindBridge location assigned"
	intro := "Your counseling location has been assigned."
	return sendCounsellorLocationEmail(toEmail, counsellorName, subject, intro, workplace, reason)
}

// SendCounsellorLocationChanged emails counselor when location changes from previous value.
func SendCounsellorLocationChanged(toEmail, counsellorName, workplace, reason string) error {
	subject := "MindBridge location updated"
	intro := "Your counseling location has been updated."
	return sendCounsellorLocationEmail(toEmail, counsellorName, subject, intro, workplace, reason)
}
