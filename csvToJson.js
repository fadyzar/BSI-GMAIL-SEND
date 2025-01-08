const csvtojson = require('csvtojson');
const fs = require('fs');

const csvFilePath = '/Users/fadyzarka/Desktop/CRM-work/Zapier request/22-1event.csv';

// המשפט החדש לסינון
const targetSentence = 'תודה רבה על התעניינותך בכנס ההשקעות שלנו!';

// שם קובץ ה-JSON הסופי
const jsonFilePath = './investment_event_data.json';

async function extractPhoneNumbersAndDays() {
  try {
    const jsonArray = await csvtojson().fromFile(csvFilePath);
    console.log('JSON Array Loaded');

    const uniquePhoneNumbers = new Set(); // מעקב אחר מספרי טלפון ייחודיים בלבד
    const extractedData = [];

    jsonArray.forEach((row, index) => {
      console.log(`שורה ${index + 1}:`, row); // הצגת השורה הנוכחית בקובץ

      // חיפוש מספר טלפון שמתחיל ב-972
      const phoneNumber = row['recipient'] && row['recipient'].trim() ? row['recipient'] : null;

      // חיפוש שם הלקוח משדה profile_name
      const profileName = row['profile_name'] && row['profile_name'].trim() ? row['profile_name'] : 'לא ידוע';
      console.log(`שם הלקוח שנמצא: ${profileName}`); // הדפסת שם הלקוח שנמצא

      // חיפוש אם השדה מכיל את המשפט החדש
      const dayRequested = row['message_text'] && row['message_text'].includes(targetSentence)
        ? row['message_text']
        : null;

      // אם יש מספר טלפון, שם הלקוח, והמשפט נמצא
      if (phoneNumber && dayRequested) {
        // בדיקה אם המספר כבר קיים
        if (!uniquePhoneNumbers.has(phoneNumber)) {
          uniquePhoneNumbers.add(phoneNumber); // הוספת המספר ל-Set
          extractedData.push({
            phoneNumber,
            profileName,
            dayRequested
          });
        }
      }
    });

    console.log('Extracted Data:', extractedData);

    // שמירת התוצאה לקובץ JSON
    fs.writeFileSync(jsonFilePath, JSON.stringify(extractedData, null, 2));
    console.log(`הנתונים נשמרו לקובץ JSON: ${jsonFilePath}`);
  } catch (error) {
    console.error('שגיאה במהלך העיבוד:', error.message);
  }
}

// קריאה לפונקציה לשלוף את הנתונים
extractPhoneNumbersAndDays();
