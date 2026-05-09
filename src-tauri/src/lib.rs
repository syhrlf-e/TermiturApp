pub mod config;
pub mod fs;
pub mod git;
pub mod terminal;

use crate::config::schema::{Config, Shell};
use crate::fs::PathStatus;
use crate::git::detector::GitStatus;
use crate::terminal::manager::SessionManager;

use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};
use tokio::sync::mpsc;
use uuid::Uuid;

// --- Config Commands ---

#[tauri::command]
fn get_config() -> Result<Config, String> {
    crate::config::loader::load_config().map_err(|e| e.to_string())
}

#[tauri::command]
fn save_config(config: Config) -> Result<(), String> {
    crate::config::loader::save_config(&config).map_err(|e| e.to_string())
}

#[tauri::command]
fn is_first_run() -> bool {
    !crate::config::loader::config_exists()
}

// --- Terminal Commands ---

struct AppState {
    session_manager: Mutex<SessionManager>,
}

#[tauri::command]
fn spawn_shell(
    project_id: String,
    shell: Shell,
    path: PathBuf,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let mut manager = state.session_manager.lock().unwrap();
    let project_uuid = Uuid::parse_str(&project_id).map_err(|e| e.to_string())?;
    
    let session_id = manager
        .spawn(project_uuid, "Terminal".into(), shell, path)
        .map_err(|e| e.to_string())?;
        
    Ok(session_id.to_string())
}

#[tauri::command]
fn write_to_shell(session_id: String, input: String, state: State<'_, AppState>) -> Result<(), String> {
    let session_uuid = Uuid::parse_str(&session_id).map_err(|e| e.to_string())?;
    let manager = state.session_manager.lock().unwrap();
    
    manager.write(session_uuid, &input).map_err(|e| e.to_string())
}

#[tauri::command]
fn resize_pty(session_id: String, cols: u16, rows: u16, state: State<'_, AppState>) -> Result<(), String> {
    let session_uuid = Uuid::parse_str(&session_id).map_err(|e| e.to_string())?;
    let manager = state.session_manager.lock().unwrap();
    
    manager.resize(session_uuid, cols, rows).map_err(|e| e.to_string())
}

#[tauri::command]
fn kill_session(session_id: String, state: State<'_, AppState>) -> Result<(), String> {
    let session_uuid = Uuid::parse_str(&session_id).map_err(|e| e.to_string())?;
    let mut manager = state.session_manager.lock().unwrap();
    
    manager.kill(session_uuid).map_err(|e| e.to_string())
}

// --- File System & Git Commands ---

#[tauri::command]
fn detect_git(path: PathBuf) -> Result<GitStatus, String> {
    Ok(crate::git::detector::detect_git(&path))
}

#[tauri::command]
fn validate_path(path: PathBuf) -> Result<PathStatus, String> {
    Ok(crate::fs::validate_path(&path))
}

#[tauri::command]
fn open_folder_dialog(app: AppHandle) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;
    if let Some(folder) = app.dialog().file().blocking_pick_folder() {
        Ok(Some(folder.to_string()))
    } else {
        Ok(None)
    }
}

// --- Updater Command ---

#[tauri::command]
async fn check_update() -> Result<Option<String>, String> {
    // Stub for Phase 14
    Ok(None)
}

// --- Setup ---

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let (tx, mut rx) = mpsc::unbounded_channel();
            
            app.manage(AppState {
                session_manager: Mutex::new(SessionManager::new(tx)),
            });

            let app_handle = app.handle().clone();
            
            // Background task for PTY output events
            tauri::async_runtime::spawn(async move {
                while let Some((session_id, data)) = rx.recv().await {
                    #[derive(serde::Serialize, Clone)]
                    struct PtyOutputPayload {
                        session_id: String,
                        data: String,
                    }
                    
                    let _ = app_handle.emit("pty-output", PtyOutputPayload {
                        session_id: session_id.to_string(),
                        data,
                    });
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_config,
            save_config,
            is_first_run,
            spawn_shell,
            write_to_shell,
            resize_pty,
            kill_session,
            detect_git,
            validate_path,
            open_folder_dialog,
            check_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
