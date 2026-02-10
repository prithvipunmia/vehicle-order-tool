import { google } from "googleapis";

function getAuth() {
  return new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  );
}

export async function getBikes() {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Catalog!A:H", // fetch all 8 columns
    });

    const rows = res.data.values || [];
    console.log("Rows from Google Sheets:", rows);

    // Skip header row (first row) and map the rest
return rows.slice(1).map((row) => ({
  id: row[0],              // Bike_id
  name: row[1],            // Vehicle_name
  variant: row[2],         // Variant
  exShowroom: row[3],      // Ex_showroom_p
  taxRate: row[4],         // Tax_rate
  insuranceRate: row[5],   // Insurance_rate
  ewRate: row[6],          // Ew_rate
  onRoadPrice: row[7],     // On_road_price
}));

  } catch (err) {
    console.error("❌ Error fetching bikes:", err);
    return [];
  }
}
