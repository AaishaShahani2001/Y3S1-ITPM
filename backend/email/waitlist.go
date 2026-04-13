package email

import (
	"fmt"
	"html"
	"strings"
)

// SendWaitlistSlotOpened notifies a student that a previously full slot is free to book.
func SendWaitlistSlotOpened(toEmail, studentName, counselorName, date, timeSlot string) error {
	toEmail = strings.TrimSpace(toEmail)
	if toEmail == "" {
		return nil
	}
	if !Configured() {
		return fmt.Errorf("email not configured: set BREVO_SMTP_* variables")
	}
	sn := strings.TrimSpace(studentName)
	if sn == "" {
		sn = "there"
	}
	cn := strings.TrimSpace(counselorName)
	if cn == "" {
		cn = "your counselor"
	}
	subject := fmt.Sprintf("A counseling slot is now available — %s %s", date, timeSlot)
	body := fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #222;">
  <p>Hi %s,</p>
  <p>A spot has opened for <strong>%s</strong> on <strong>%s</strong> at <strong>%s</strong>.</p>
  <p>Sign in to MindBridge and book this slot before someone else does.</p>
  <p style="color: #666; font-size: 14px;">This is an automated message. Please do not reply to this email.</p>
</body>
</html>`,
		html.EscapeString(sn),
		html.EscapeString(cn),
		html.EscapeString(date),
		html.EscapeString(timeSlot),
	)
	return SendHTML(toEmail, subject, body)
}
