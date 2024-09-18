import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { name, version } from "./package.json";

const __dirname = dirname(fileURLToPath(import.meta.url));



const updateCargoVersion = () => {
	const upadateJSON = resolve(__dirname, "package.json");
	let upadateJSONObj = JSON.parse(readFileSync(upadateJSON, "utf-8"));

	const signaturePath = resolve(__dirname, "src-tauri", "target", "release", "bundle", "msi", `${name}_${version}_x64_zh-CN.msi.zip.sig`);
	let content = readFileSync(signaturePath, "utf-8");

	upadateJSONObj.notes = version;
	upadateJSONObj.platforms['windows-x86_64']['signature'] = content;
	upadateJSONObj.platforms['windows-x86_64']['url'] = content;

	writeFileSync(resolve(__dirname, "update.json"), JSON.stringify(upadateJSONObj, null, 2));

};

updateCargoVersion();
