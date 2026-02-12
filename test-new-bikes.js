const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

async function testBikes() {
  try {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Catalog!A:H'
    });

    const rows = res.data.values || [];
    console.log('✅ Total rows in Google Sheet:', rows.length);
    console.log('   (1 header row + ' + (rows.length - 1) + ' bike rows)');
    console.log('\n📋 First 5 bikes:');
    rows.slice(1, 6).forEach((row, i) => {
      console.log('   ' + (i+1) + '. ' + row[1] + ' (' + row[2] + ') - ₹' + row[7]);
    });
    
    if (rows.length > 6) {
      console.log('   ...');
      console.log('   Last bike:');
      const last = rows[rows.length-1];
      console.log('   ' + (rows.length - 1) + '. ' + last[1] + ' (' + last[2] + ') - ₹' + last[7]);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testBikes();
