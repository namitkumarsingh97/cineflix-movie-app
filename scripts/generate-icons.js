import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const input = path.join(__dirname, "../public/icon.svg");
const output192 = path.join(__dirname, "../public/icon-192.png");
const output512 = path.join(__dirname, "../public/icon-512.png");

async function generate() {
  try {
    await sharp(input).resize(192, 192).png().toFile(output192);
    await sharp(input).resize(512, 512).png().toFile(output512);
    console.log("✅ Icons generated successfully!");
  } catch (err) {
    console.error("❌ Error generating icons:", err);
  }
}

generate();
