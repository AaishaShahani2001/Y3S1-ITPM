package utils

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"

	"github.com/skip2/go-qrcode"
)

func GenerateQR(regID uint, eventID uint, userID uint) (string, string, error) {

	data := map[string]uint{
		"id":       regID,
		"event_id": eventID,
		"user_id":  userID,
	}

	jsonData, _ := json.Marshal(data)

	// CREATE FOLDER
	err := os.MkdirAll("uploads/qr", os.ModePerm)
	if err != nil {
		return "", "", err
	}

	// FILE PATH
	filePath := fmt.Sprintf("uploads/qr/qr_%d.png", regID)

	// GENERATE PNG
	png, err := qrcode.Encode(string(jsonData), qrcode.Medium, 256)
	if err != nil {
		return "", "", err
	}

	// SAVE FILE
	err = os.WriteFile(filePath, png, 0644)
	if err != nil {
		return "", "", err
	}

	// BASE64 (FOR EMAIL)
	base64QR := base64.StdEncoding.EncodeToString(png)

	// URL (FOR FRONTEND)
	url := fmt.Sprintf("http://localhost:3000/%s", filePath)

	return base64QR, url, nil
}