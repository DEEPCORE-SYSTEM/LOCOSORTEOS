import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import JavaScriptObfuscator from "javascript-obfuscator";

const assetsDir = path.resolve("public/build/assets");

const options = {
  compact: true,
  sourceMap: false,
  ignoreImports: true,
  renameGlobals: false,
  simplify: true,
  selfDefending: false,
  stringArray: true,
  stringArrayThreshold: 0.75,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  splitStrings: false,
  unicodeEscapeSequence: false,
};

async function run() {
  try {
    await fs.access(assetsDir);
  } catch {
    console.error(`No existe la carpeta de assets: ${assetsDir}`);
    console.error("Ejecuta primero: npm run build");
    process.exit(1);
  }

  const entries = await fs.readdir(assetsDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
    .map((entry) => path.join(assetsDir, entry.name));

  if (files.length === 0) {
    console.error("No se encontraron archivos .js en public/build/assets");
    process.exit(1);
  }

  console.log(`Ofuscando ${files.length} archivos JS...`);

  for (const filePath of files) {
    const code = await fs.readFile(filePath, "utf8");
    const result = JavaScriptObfuscator.obfuscate(code, options);
    await fs.writeFile(filePath, result.getObfuscatedCode(), "utf8");
    console.log(`OK  ${path.basename(filePath)}`);
  }

  console.log("Ofuscacion completada.");
}

run().catch((error) => {
  console.error("Error durante la ofuscacion:", error);
  process.exit(1);
});

