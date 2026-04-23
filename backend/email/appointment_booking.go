package email

import (
	"fmt"
	"html"
	"strings"
)

// SendAppointmentConfirmed notifies a student after counselor confirms a booking.
func SendAppointmentConfirmed(toEmail, studentName, counselorName, date, timeSlot string) error {
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

	subject := "MindBridge appointment confirmed"
	body := fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f6f8fb;font-family:Arial,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;">
    <tr>
      <td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;">
        <h2 style="margin:0 0 12px;color:#0f172a;font-size:22px;">Your appointment is confirmed</h2>
        <p style="margin:0 0 16px;font-size:15px;">Hi %s,</p>
        <p style="margin:0 0 16px;font-size:15px;">Your appointment with <strong>%s</strong> has been confirmed.</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin:0 0 16px;">
          <p style="margin:0 0 6px;font-size:14px;"><strong>Date:</strong> %s</p>
          <p style="margin:0;font-size:14px;"><strong>Time:</strong> %s</p>
        </div>
        <p style="margin:0;font-size:12px;color:#6b7280;">This is an automated message from MindBridge.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
		html.EscapeString(sn),
		html.EscapeString(cn),
		html.EscapeString(date),
		html.EscapeString(timeSlot),
	)
	return SendHTML(toEmail, subject, body)
}

// SendAppointmentCancelledByCounselor notifies a student when counselor cancels with a reason.
func SendAppointmentCancelledByCounselor(toEmail, studentName, counselorName, date, timeSlot, note string) error {
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

	noteBlock := ""
	if strings.TrimSpace(note) != "" {
		noteBlock = fmt.Sprintf(
			`<p style="margin:0 0 12px;font-size:14px;"><strong>Reason:</strong> %s</p>`,
			html.EscapeString(note),
		)
	}

	subject := "MindBridge appointment cancelled by counselor"
	body := fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f6f8fb;font-family:Arial,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;">
    <tr>
      <td style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;">
        <h2 style="margin:0 0 12px;color:#991b1b;font-size:22px;">Appointment cancelled</h2>
        <p style="margin:0 0 16px;font-size:15px;">Hi %s,</p>
        <p style="margin:0 0 16px;font-size:15px;">Your appointment with <strong>%s</strong> has been cancelled by the counselor.</p>
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 16px;margin:0 0 16px;">
          <p style="margin:0 0 6px;font-size:14px;"><strong>Date:</strong> %s</p>
          <p style="margin:0 0 6px;font-size:14px;"><strong>Time:</strong> %s</p>
          %s
        </div>
        <p style="margin:0;font-size:12px;color:#6b7280;">Please rebook through MindBridge if needed.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
		html.EscapeString(sn),
		html.EscapeString(cn),
		html.EscapeString(date),
		html.EscapeString(timeSlot),
		noteBlock,
	)
	return SendHTML(toEmail, subject, body)
}
