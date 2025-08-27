import * as fs from "fs";
import { parse } from "csv-parse";

interface InputFeature {
  [key: string]: any;
  longitude: number;
  latitude: number;
}

interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: Record<string, any>;
}

interface GeoJSON {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

async function jsonToGeoJSON(inputPath: string, outputPath: string) {
  let data:InputFeature[];
  if (inputPath.endsWith(".csv")) {
    try {
      const jsonData = await csvToJson(inputPath);
      fs.writeFileSync("tmpfile.json", JSON.stringify(jsonData, null, 2), "utf-8");
      const raw = fs.readFileSync("tmpfile.json", "utf-8");    
      data = JSON.parse(raw);
      // data  = JSON.stringify(jsonData, null, 2)
    }catch (error) {
      console.error("Erreur lors de la conversion :", error);
      throw error;
    }
  }
  else {
    const raw = fs.readFileSync(inputPath, "utf-8");    
    data = JSON.parse(raw);
  }

  const features: GeoJSONFeature[] = data.map((item) => {
    const { longitude, latitude, ...properties } = item;

    return {
      type: "Feature",
      geometry: { type: "Point", coordinates: [longitude, latitude] },
      properties
    };
  });

  const geojson: GeoJSON = { type: "FeatureCollection", features };
  fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2), "utf-8");
  console.log(`✅ Conversion terminée : ${outputFile}`);
}

// Fonction pour convertir un CSV en JSON
async function csvToJson(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const records: any[] = [];

    fs.createReadStream(filePath)
      .pipe(parse({
         columns: true,
         skip_empty_lines: true,
         relax_column_count: true,
         delimiter: ";",
         cast: (value, context) => {
            if (value === "") return null; // ✅ valeur vide → null

            // ✅ si c'est un nombre valide → number
            if (!isNaN(Number(value)) && value.trim() !== "") {
              return Number(value);
            }

            return value; // sinon garder en string
            }
        }))
      .on("data", (row) => {
        records.push(row);
      })
      .on("end", () => {
        resolve(records);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

// --- CLI ---
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node convert.js <input.json> <output.geojson>");
  process.exit(1);
}

const [inputFile, outputFile] = args;
jsonToGeoJSON(inputFile, outputFile);

