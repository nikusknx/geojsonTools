import fs from "fs";
import { parse } from "csv-parse";

interface Entry {
  sensor_id: string;
  date: string;
  X_WGS84?:string;
  Y_WGS84?: string;
  [key: string]: string| undefined;
}

const inputFile = "examples/chroniques.csv";
const outputFile = "examples/output.json";
  /**
 * Convertit une date du format "DD/MM/YYYY HH:mm:ss" en objet Date
 */
const parseCustomDate = (dateStr: string): Date => {
  const [datePart, timePart] = dateStr.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
};

const keepLatestPerSensor = async (): Promise<void> => {
  const fileContent = fs.readFileSync(inputFile, "utf8");

  const records: Entry[] = await new Promise((resolve, reject) => {
    parse(
      fileContent,
      {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: ","
      },
      (err, output) => {
        if (err) reject(err);
        else resolve(output as Entry[]);
      }
    );
  });


  // 🔍 Étape 1 : filtrer les entrées incomplètes
  const validRecords = records.filter(
    (r) => r.X_WGS84 && r.X_WGS84.trim() !== ""
);

  // 🔁 Étape 2 : garder la date la plus récente pour chaque capteur
  // Regrouper et garder la date la plus récente
  const latestBySensor = Object.values(
    validRecords.reduce<Record<string, Entry>>((acc, entry) => {
      const id = entry.sensor_id;
    const currentDate = parseCustomDate(entry.date);
      const previousDate = acc[id] ? parseCustomDate(acc[id].date) : null;

      if (!acc[id] || currentDate > (previousDate as Date)) {
        acc[id] = entry;
      }
      return acc;
    }, {})
  );

    // 🔢 Étape 3 : convertir les champs numériques
  const converted = latestBySensor.map((e) => ({
    ...e,
    X_WGS84: e.X_WGS84 ? Number(e.X_WGS84) : null,
    Y_WGS84: e.Y_WGS84 ? Number(e.Y_WGS84) : null,
    value: e.value ? Number(e.value) : null,
  }));

  fs.writeFileSync(outputFile, JSON.stringify(converted, null, 2), "utf8");
  console.log(`✅ Fichier JSON créé : ${outputFile}`);
};

keepLatestPerSensor().catch(console.error);
