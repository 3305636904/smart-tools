import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dayjs from 'dayjs'

const __dirname = dirname(fileURLToPath(import.meta.url));

const updateCargoVersion = () => {
	const packageJSON = resolve(__dirname, "package.json");
	const packageObj = JSON.parse(readFileSync(packageJSON, "utf-8"));
	const { name, version } = packageObj;

	const upadateJSON = resolve(__dirname, "update.json");
	let upadateJSONObj = JSON.parse(readFileSync(upadateJSON, "utf-8"));

	const signaturePath = resolve(__dirname, "src-tauri", "target", "release", "bundle", "msi", `${name}_${version}_x64_zh-CN.msi.zip.sig`);
	let content = readFileSync(signaturePath, "utf-8");

	upadateJSONObj.version = version;
	upadateJSONObj.pub_date = dayjs().format('YYYY-MM-DDTHH:mm:ssZ');
	upadateJSONObj.platforms['windows-x86_64']['signature'] = content;
	upadateJSONObj.platforms['windows-x86_64']['url'] = `http://111.229.144.150/web/download/${name}_${version}_x64_zh-CN.msi.zip`;

	writeFileSync(resolve(__dirname, "update.json"), JSON.stringify(upadateJSONObj, null, 2));

};

updateCargoVersion();
