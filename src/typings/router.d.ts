import type { WindowOptions } from "@tauri-apps/api/window";
import { RouteRecordRaw } from "vue-router";

export type RoutePath =
	| "/"
	| "/home"
	| "/setting";

export interface Route extends RouteRecordRaw {
	path: RoutePath;
	component: ComponentType;
	children?: Route[];
	meta?: {
		icon?: string;
		title?: string;
		windowOptions?: WindowOptions;
	};
}
