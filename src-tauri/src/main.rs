#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::env;
use tauri::{
    Window, Manager
};

// mod tray;
mod plugins;

// use plugins::clipboard;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

pub const AUTO_LAUNCH_ARG: &str = "--auto-launch";
pub static SETTINGS_WINDOW_LABEL: &str = "settings";

#[tauri::command]
fn close_settings(window: tauri::Window) {
    // 关闭启动视图
    if let Some(settings) = window.get_window("settings") {
        settings.close().unwrap();
    }
    // 展示主视图
    window.get_window("main").unwrap().show().unwrap();
}

#[tauri::command]
fn show_settings(window: tauri::Window) {
    print!("show window");
    let setting_window = window.get_window("settings").unwrap();
    setting_window.show().unwrap();
    setting_window.unminimize().unwrap();
    setting_window.set_focus().unwrap();
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // 在开发环境中启动时打开控制台：https://tauri.app/v1/guides/debugging/application/#opening-devtools-programmatically
            #[cfg(debug_assertions)]
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
            }
            // 判断是否为自动启动
            // let args: Vec<String> = env::args().collect();
            // if !args.contains(&AUTO_LAUNCH_ARG.to_string()) {
                // let window = app.get_window("settings").unwrap();
                // window.hide().unwrap();
            // }
            Ok(())
        })
        // .system_tray(tray::main_menu())
        // .on_system_tray_event(tray::handler)
        // 自定义剪切板插件
        // .plugin(clipboard::init())
        // .invoke_handler(tauri::generate_handler![show_settings])
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
