package email

import (
	"fmt"
	"html"
	"strings"
	"time"
)

// helper to parse slot datetime from date and time slot string
func parseSlotDateTime(date, timeSlot string) (time.Time, error) {
	date = strings.TrimSpace(date)
	timeSlot = strings.TrimSpace(timeSlot)
	if date == "" || timeSlot == "" {
		return time.Time{}, fmt.Errorf("date/time slot is empty")
	}

	slotDate, err := time.Parse("2006-01-02", date)
	if err != nil {
		return time.Time{}, err
	}

	timeLayouts := []string{"03:04 PM", "3:04 PM", "15:04"}
	var slotClock time.Time
	var parseErr error
	for _, layout := range timeLayouts {
		slotClock, parseErr = time.Parse(layout, timeSlot)
		if parseErr == nil {
			slotDateTime := time.Date(
				slotDate.Year(),
				slotDate.Month(),
				slotDate.Day(),
				slotClock.Hour(),
				slotClock.Minute(),
				0,
				0,
				time.Local,
			)
			return slotDateTime, nil
		}
	}

	return time.Time{}, parseErr
}

// format booking window message for the email
func formatBookingWindowMessage(date, timeSlot string) string {
	slotDateTime, err := parseSlotDateTime(date, timeSlot)
	if err != nil {
		return "Please book as soon as possible to avoid losing this slot."
	}

	now := time.Now()
	if !slotDateTime.After(now) {
		return "This slot time has already passed. Please choose another available slot."
	}

	remaining := time.Until(slotDateTime).Round(time.Minute)
	if remaining < 0 {
		return "This slot time has already passed. Please choose another available slot."
	}

	hours := int(remaining.Hours())
	minutes := int(remaining.Minutes()) % 60

	if hours == 0 {
		return fmt.Sprintf("Time left to book: %d minutes.", minutes)
	}
	if minutes == 0 {
		return fmt.Sprintf("Time left to book: %d hour(s).", hours)
	}
	return fmt.Sprintf("Time left to book: %d hour(s) %d minute(s).", hours, minutes)
}

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
	timeGapMessage := formatBookingWindowMessage(date, timeSlot)
	body := fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 24px; background: #f6f8fb; font-family: Arial, sans-serif; color: #1f2937;">
  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width: 640px; margin: 0 auto;">
    <tr>
      <td style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
        <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 22px;">A waitlist slot is now open</h2>
        <p style="margin: 0 0 16px; font-size: 15px;">Hi %s,</p>
        <p style="margin: 0 0 16px; font-size: 15px;">
          Great news. A counseling slot with <strong>%s</strong> has become available.
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin: 0 0 16px;">
          <p style="margin: 0 0 6px; font-size: 14px;"><strong>Date:</strong> %s</p>
          <p style="margin: 0; font-size: 14px;"><strong>Time:</strong> %s</p>
        </div>

        <p style="margin: 0 0 14px; font-size: 15px; color: #b45309;">
          <strong>%s</strong>
        </p>

        <p style="margin: 0 0 18px; font-size: 15px;">
          Please sign in to MindBridge and confirm your booking as soon as possible.
        </p>

        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          This is an automated message from MindBridge. Please do not reply to this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
		html.EscapeString(sn),
		html.EscapeString(cn),
		html.EscapeString(date),
		html.EscapeString(timeSlot),
		html.EscapeString(timeGapMessage),
	)
	return SendHTML(toEmail, subject, body)
}
