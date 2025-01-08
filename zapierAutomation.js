const axios = require('axios');
const fs = require('fs');

// נתיב לקובץ ה-JSON שנוצר
const jsonFilePath = './investment_event_data.json'; // עדכן לנתיב הקובץ החדש

// כתובת ה-Webhook של Zapier
const zapierWebhookUrl = 'https://hooks.zapier.com/hooks/catch/21067376/28zo5s9/';

async function sendToZapier() {
  try {
    // קריאת תוכן הקובץ
    const extractedData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    // שליחת הנתונים ל-Zapier
    const response = await axios.post(zapierWebhookUrl, {
      data: extractedData // שליחת הנתונים תחת פרמטר 'data'
    });

    console.log('הבקשה נשלחה בהצלחה:', response.data);
  } catch (error) {
    console.error('שגיאה בשליחה ל-Zapier:', error.message);
    if (error.response) {
      console.error('פרטי שגיאה:', error.response.data);
    }
  }
}

// קריאה לשליחת הנתונים
sendToZapier();
