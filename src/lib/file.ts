import fs from "fs";
import archiver from "archiver";
import { defaultTimeFormat } from "@lib/date";
import { ElementHandle } from "puppeteer";

export const filenameTime = defaultTimeFormat(new Date())
const filePath = `../../data/candidates-${filenameTime}`

export function writeJsonFile({
  obj,
  fileName,
  folderPath,
}: writeJsonFileProps) {
  const json = JSON.stringify(obj);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  fs.writeFileSync(`${folderPath}/${fileName}`, json);
}

interface writeJsonFileProps {
  obj: object | Object[];
  fileName: string;
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
  const stream = fs.createWriteStream(`${outPath}-${filePath}`);

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
