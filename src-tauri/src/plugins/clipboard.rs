use clipboard_rs::{
  common::RustImage, Clipboard, ClipboardContent, ClipboardContext, ClipboardHandler,
  ClipboardWatcher, ClipboardWatcherContext, ContentFormat, RustImageData, WatcherShutdown,
};
use std::{
    fs::{create_dir_all, File},
    hash::{DefaultHasher, Hash, Hasher},
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
    thread::spawn,
    io::{self, Read},
};
use tauri::{
  command, generate_handler,
  plugin::{Builder, TauriPlugin},
  AppHandle, Error, Manager, Result, State, Wry,
};

use base64;

struct ClipboardManager {
  context: ClipboardContext,
  watcher_shutdown: Arc<Mutex<Option<WatcherShutdown>>>,
}

impl ClipboardManager {
  fn new() -> Self {
      ClipboardManager {
          context: ClipboardContext::new().unwrap(),
          watcher_shutdown: Arc::default(),
      }
  }

  fn has(&self, format: ContentFormat) -> bool {
      self.context.has(format)
  }
}

#[derive(Debug, serde::Serialize)]
struct ReadImage {
    width: u32,
    height: u32,
    image: String,
}


// #[command]
// async fn start_listen(app_handle: AppHandle, manager: State<'_, ClipboardManager>) -> Result<()> {
//     let listener = ClipboardListen::new(app_handle.clone());

//     let mut watcher: ClipboardWatcherContext<ClipboardListen> =
//         ClipboardWatcherContext::new().unwrap();

//     let watcher_shutdown = watcher.add_handler(listener).get_shutdown_channel();

//     let mut watcher_shutdown_state = manager.watcher_shutdown.lock().unwrap();

//     if (*watcher_shutdown_state).is_some() {
//         return Ok(());
//     }

//     *watcher_shutdown_state = Some(watcher_shutdown);

//     spawn(move || {
//         watcher.start_watch();
//     });

//     Ok(())
// }

// #[command]
// async fn stop_listen(manager: State<'_, ClipboardManager>) -> Result<()> {
//     let mut watcher_shutdown = manager.watcher_shutdown.lock().unwrap();

//     if let Some(watcher_shutdown) = (*watcher_shutdown).take() {
//         watcher_shutdown.stop();
//     }

//     *watcher_shutdown = None;

//     Ok(())
// }

#[command]
async fn write_image(manager: State<'_, ClipboardManager>, value: String) -> Result<()> {
    print!("Hello!");
    format!("image value1: {}!", value);
    format!("image value: {}!", &value);
    // let image = RustImageData::from_path(&value).unwrap();

    // manager.context.set_image(image).unwrap();

    Ok(())
}
#[command]
async fn write_files(manager: State<'_, ClipboardManager>, value: Vec<String>) -> Result<()> {
    manager.context.set_files(value).unwrap();

    Ok(())
}

#[command]
async fn has_image(manager: State<'_, ClipboardManager>) -> Result<bool> {
    Ok(manager.has(ContentFormat::Image))
}

#[command]
async fn read_files(manager: State<'_, ClipboardManager>) -> Result<Vec<String>> {
    let mut files = manager.context.get_files().unwrap();

    files.iter_mut().for_each(|path| {
        *path = path.replace("file://", "");
    });

    Ok(files)
}

#[command]
// fn read_image2(path: &str) -> Result<String> {
fn read_image2(path: &str) -> Result<String> {
    let path = Path::new(path);
    // 打开文件
    let mut file = File::open(&path).map_err(|e| e.to_string()).unwrap();
    
    // 读取文件内容到缓冲区
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer).map_err(|e| e.to_string());
    
    // 将文件内容编码为 Base64
    Ok(base64::encode(buffer))
}


#[command]
async fn read_image(manager: State<'_, ClipboardManager>, dir: PathBuf) -> Result<ReadImage> {
    create_dir_all(&dir).unwrap();

    let image = manager.context.get_image().unwrap();

    let (width, height) = image.get_size();

    let thumbnail_image = image.thumbnail(width / 10, height / 10).unwrap();

    let bytes = thumbnail_image.to_png().unwrap().get_bytes().to_vec();

    let mut hasher = DefaultHasher::new();

    bytes.hash(&mut hasher);

    let hash = hasher.finish();

    let image_path = dir.join(format!("{hash}.png"));

    if let Some(path) = image_path.to_str() {
        image.save_to_path(path).unwrap();

        let image = path.to_string();

        return Ok(ReadImage {
            width,
            height,
            image,
        });
    }

    Err(Error::InvokeKey)
}

pub fn init() -> TauriPlugin<Wry> {
  Builder::new("clipboard")
      .setup(move |app| {
          app.manage(ClipboardManager::new());

          Ok(())
      })
      .invoke_handler(generate_handler![
        //   start_listen,
        //   stop_listen,
        read_files,
        has_image,
        write_image,
        read_image,
        read_image2,
      ])
      .build()
}
