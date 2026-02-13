import { google } from "googleapis";

function getAuth() {
  // Remove quotes if present (from dotenv)
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }

  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });
}

export async function getBikes() {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Catalog!A:O", // fetch columns A-O (includes colors in I-O)
    });

    const rows = res.data.values || [];
    console.log("Rows from Google Sheets:", rows);

    // Skip header row (first row) and map the rest
return rows.slice(1).map((row) => {
  // Filter out empty color cells (columns I-O are indices 8-14)
  const colors = (row.slice(8, 15) || []).filter((color) => color && color.trim());
  
  return {
    BikeId: row[0],            // Bike_id
    VehicleName: row[1],       // Vehicle_name
    Variant: row[2],           // Variant
    ExShowroomPrice: row[3],   // Ex_showroom_p
    Tax: row[4],               // Tax_rate
    Insurance: row[5],         // Insurance_rate
    Ew: row[6],                // Ew_rate
    OnRoadPrice: row[7],       // On_road_price
    Colors: colors,            // Colors from columns I-O
  };
});


  } catch (err) {
    console.error("❌ Error fetching bikes:", err);
    return [];
  }
}
