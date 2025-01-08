const fs = require('fs');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');

// נתיב לקובץ ה-JSON המקורי
const jsonFilePath = './investment_event_data.json';
// נתיב לקובץ ה-Excel המעוצב
const excelFilePath = './phone_numbers_styled.xlsx';

// פרטי חשבון ה-Gmail לשליחה
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'fadyzarka978@gmail.com', // כתובת המייל שלך
    pass: 'qezi kmry gdcz wghm'    // סיסמת האפליקציה
  }
});

// פונקציה לעיבוד הנתונים ויצירת קובץ Excel מעוצב
async function processPhoneNumbersToStyledExcel() {
  try {
    // קריאת הקובץ המקורי
    const rawData = fs.readFileSync(jsonFilePath, 'utf8');
    const jsonData = JSON.parse(rawData);

    // שליפת מספרי הטלפון בלבד תוך סינון המספר שאינו נדרש
    const phoneNumbers = jsonData
      .map(item => item.phoneNumber)
      .filter(num => num && num !== '972542086830'); // סינון המספר 972542086830

    if (phoneNumbers.length === 0) {
      throw new Error('לא נמצאו מספרי טלפון תקינים בקובץ');
    }

    // יצירת workbook וגיליון
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('מספרי טלפון');

    // הוספת כותרות לעמודות
    worksheet.columns = [
      { header: 'מספר סידורי', key: 'serial', width: 50 },
      { header: 'מספר טלפון', key: 'phone', width: 50 }
    ];

    // הוספת שורות לנתונים
    phoneNumbers.forEach((num, index) => {
      worksheet.addRow({
        serial: index + 1,
        phone: num
      });
    });

    // עיצוב כותרות
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, size: 16 }; // כותרות בגופן גדול ובולט
      cell.alignment = { vertical: 'middle', horizontal: 'center' }; // יישור מרכזי
    });

    // עיצוב שורות הנתונים
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell(cell => {
          cell.font = { size: 40 }; // גופן מוגדל לנתונים
          cell.alignment = { vertical: 'middle', horizontal: 'center' }; // יישור מרכזי
        });
      }
    });

    // שמירת קובץ ה-Excel
    await workbook.xlsx.writeFile(excelFilePath);
    console.log(`קובץ ה-Excel המעוצב נשמר ב-${excelFilePath}`);
  } catch (error) {
    console.error('שגיאה בעיבוד מספרי הטלפון ל-Excel:', error.message);
  }
}

// פונקציה לשליחת המייל
async function sendEmailWithAttachment() {
  try {
    // בדיקה אם קובץ ה-Excel קיים
    if (!fs.existsSync(excelFilePath)) {
      throw new Error(`הקובץ ${excelFilePath} לא נמצא`);
    }

    // יצירת המייל עם הקובץ המצורף
    const mailOptions = {
      from: 'fadyzarka978@gmail.com', // כתובת השולח
      to: 'fadyzarka978@gmail.com, basheer@bsmartinvest.com',  // רשימת נמענים
      subject: 'מספרי טלפון של מתעניינים בכנס - קובץ Excel מעוצב',
      text: 'שלום, מצורף קובץ Excel עם מספרי הטלפון של מי שהתעניין בכנס.',
      attachments: [
        {
          filename: 'phone_numbers_styled.xlsx', // שם הקובץ המצורף
          path: excelFilePath                     // נתיב לקובץ
        }
      ]
    };

    // שליחת המייל
    const info = await transporter.sendMail(mailOptions);
    console.log('המייל נשלח בהצלחה:', info.response);
  } catch (error) {
    console.error('שגיאה בשליחת המייל:', error.message);
  }
}

// קריאה לפונקציות
(async () => {
  await processPhoneNumbersToStyledExcel();
  await sendEmailWithAttachment();
})();
