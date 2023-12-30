import fs from "fs";
import path from "path";
import { defaultTimeFormat } from "./date";

export function writeJsonFile({
  obj,
  fileName,
  folderPath,
  dateTime = new Date(),
}: writeJsonFileProps) {
  const json = JSON.stringify(obj);
  const folderName = defaultTimeFormat(dateTime);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  fs.writeFileSync(`${folderPath}/${fileName}`, json);
}

interface writeJsonFileProps {
  obj: object;
  fileName: string;
  dateTime: Date;
  folderPath: string;
}
