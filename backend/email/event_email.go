package email

import (
	"fmt"
	"html"
)

func SendEventRegistrationEmail(to, name, title, date, location, qrURL string, status string) error {

	subject := ""
	if status == "waitlist" {
		subject = "You are on the waitlist"
	} else {
		subject = "Event Registration Confirmed"
	}

	// USE BASE64 (CORRECT)
	qrImage := ""
	if qrURL != "" {
		qrImage = fmt.Sprintf(`
		<div style="text-align:center; margin-top:20px;">
			<img src="%s" width="200"/>
		</div>
		`, qrURL)
	}

	var body string

	// =====================
	// WAITLIST EMAIL
	// =====================
	if status == "waitlist" {

		body = fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<body style="font-family:Arial; background:#f5f7fb; padding:20px;">
			<div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:10px;">

				<h2 style="color:orange;">⏳ Waitlist Confirmation</h2>

				<p>Hi <strong>%s</strong>,</p>

				<p>You are currently on the waitlist for:</p>

				<p><strong>%s</strong></p>
				<p>%s | %s</p>

				<p>If a slot opens, you will be notified.</p>

				<hr/>
				<p style="font-size:12px; color:#666;">MindBridge</p>

			</div>
		</body>
		</html>
		`,
			html.EscapeString(name),
			html.EscapeString(title),
			html.EscapeString(date),
			html.EscapeString(location),
		)

	} else {

		// =====================
		// CONFIRMED EMAIL
		// =====================
		body = fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<body style="font-family:Arial; background:#f4f4f4; padding:20px;">
			<div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:10px;">

				<h2 style="color:#4CAF50;">🎉 Registration Confirmed</h2>

				<p>Hi %s,</p>
				<p>Your registration is <b>confirmed!</b></p>

				<div style="background:#eef2f7; padding:15px; border-radius:8px;">
					<p><b>📌 Event:</b> %s</p>
					<p><b>📅 Date:</b> %s</p>
					<p><b>📍 Location:</b> %s</p>
				</div>

				<p style="margin-top:20px;">Show this QR at the event:</p>

				%s

				<hr/>
				<p style="font-size:12px; color:gray;">MindBridge</p>

			</div>
		</body>
		</html>
		`,
			html.EscapeString(name),
			html.EscapeString(title),
			html.EscapeString(date),
			html.EscapeString(location),
			qrImage,
		)
	}

	return SendHTML(to, subject, body)
}