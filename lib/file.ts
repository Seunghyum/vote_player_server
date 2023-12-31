import fs from "fs";
import path from "path";
import archiver from "archiver";
import { defaultTimeFormat } from "./date";
import { ElementHandle } from "puppeteer";

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

export async function writeImageByElement({
  fileName,
  folderPath,
  element,
}: writeImageByElementProps) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  try {
    await element.screenshot({ path: `${folderPath}/${fileName}` });
  } catch (e) {
    console.log(e);
  }
}
interface writeImageByElementProps {
  element: ElementHandle<Element>;
  fileName: string;
  folderPath: string;
}

export function zipDirectory(sourceDirPath: string, outPath: string) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(outPath);

  return new Promise<void>((resolve, reject) => {
    archive
      .directory(sourceDirPath, false)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve());
    archive.finalize();
  });
}

export function removeDirIfExist(path: string) {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
  }
}
