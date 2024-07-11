// use tauri::{AppHandle, CustomMenuItem, SystemTrayMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu};

// // 加载菜单
// pub fn main_menu() -> SystemTray {
//     let tray_menu: SystemTrayMenu = SystemTrayMenu::new()
//         .add_item(CustomMenuItem::new("show".to_string(), "显示"))
//         .add_native_item(SystemTrayMenuItem::Separator)
//         .add_item(CustomMenuItem::new("quit".to_string(), "退出"));

//     SystemTray::new().with_menu(tray_menu)
// }

// // 菜单事件
// pub fn handler(app: &AppHandle, event: SystemTrayEvent) {
//     let window = app.get_window("main").unwrap();

//     match event {
//         SystemTrayEvent::LeftClick { .. } => {
//             window.show().unwrap();
//             window.set_focus().unwrap();
//         }
//         SystemTrayEvent::RightClick { .. } => {
//             println!("右键点击图标");
//         }
//         SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
//             "show" => app.windows().values().for_each(|window| {
//                 window.show().unwrap();
//                 window.set_focus().unwrap();
//             }),
//             "quit" => app.exit(0),
//             _ => {}
//         },
//         _ => {}
//     }
// }
