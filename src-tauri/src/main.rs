#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// mod tray;
mod plugins;

// use plugins::clipboard;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

// 主窗口的名称
pub static MAIN_WINDOW_LABEL: &str = "main";

fn main() {
    tauri::Builder::default()
        // .setup(|_app| {
        //     // 在开发环境中启动时打开控制台：https://tauri.app/v1/guides/debugging/application/#opening-devtools-programmatically
        //     #[cfg(debug_assertions)]
        //     {
        //         let window = _app.get_window(MAIN_WINDOW_LABEL).unwrap();
        //         window.open_devtools();
        //     }
        //     Ok(())
        // })
        // .system_tray(tray::main_menu())
        // .on_system_tray_event(tray::handler)
        // 自定义剪切板插件
        // .plugin(clipboard::init())
        .invoke_handler(tauri::generate_handler![greet])
        // 让 app 保持在后台运行：https://tauri.app/v1/guides/features/system-tray/#preventing-the-app-from-closing
        // .on_window_event(|event| match event.event() {
        //     WindowEvent::CloseRequested { api, .. } => {
        //         event.window().hide().unwrap();
        //         api.prevent_close();
        //     }
        //     _ => {}
        // })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
