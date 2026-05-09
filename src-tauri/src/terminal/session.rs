use crate::config::schema::Shell;
use portable_pty::{native_pty_system, Child, CommandBuilder, MasterPty, PtySize};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

#[derive(Debug, thiserror::Error)]
pub enum SessionError {
    #[error("Gagal spawn shell: {0}")]
    SpawnError(String),

    #[error("Gagal menulis ke PTY: {0}")]
    WriteError(String),

    #[error("Gagal resize PTY: {0}")]
    ResizeError(String),

    #[error("Gagal menghentikan PTY: {0}")]
    KillError(String),

    #[error("Session tidak ditemukan")]
    NotFound,
}

pub struct PtyHandles {
    pub master: Box<dyn MasterPty + Send>,
    pub child: Box<dyn Child + Send + Sync>,
    pub writer: Box<dyn std::io::Write + Send>,
}

impl std::fmt::Debug for PtyHandles {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "PtyHandles {{ ... }}")
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PtySession {
    pub id: Uuid,
    pub project_id: Uuid,
    pub name: String,
    pub shell: Shell,
    pub path: PathBuf,

    #[serde(skip)]
    pub handles: Option<Arc<Mutex<PtyHandles>>>,
}

impl PtySession {
    pub fn spawn_shell(
        id: Uuid,
        project_id: Uuid,
        name: String,
        shell: Shell,
        path: PathBuf,
    ) -> Result<(Self, Box<dyn std::io::Read + Send>), SessionError> {
        let pty_system = native_pty_system();
        let pair = pty_system
            .openpty(PtySize {
                rows: 24,
                cols: 80,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| SessionError::SpawnError(e.to_string()))?;

        let shell_cmd = match shell {
            Shell::Bash => "bash",
            Shell::Zsh => "zsh",
            Shell::PowerShell => "powershell",
            Shell::Fish => "fish",
        };

        let mut cmd = CommandBuilder::new(shell_cmd);
        cmd.cwd(&path);

        let child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|e| SessionError::SpawnError(e.to_string()))?;

        let reader = pair
            .master
            .try_clone_reader()
            .map_err(|e| SessionError::SpawnError(e.to_string()))?;

        let writer = pair
            .master
            .take_writer()
            .map_err(|e| SessionError::SpawnError(e.to_string()))?;

        let handles = PtyHandles {
            master: pair.master,
            child,
            writer,
        };

        let session = PtySession {
            id,
            project_id,
            name,
            shell,
            path,
            handles: Some(Arc::new(Mutex::new(handles))),
        };

        Ok((session, reader))
    }

    pub fn write_to_shell(&self, input: &str) -> Result<(), SessionError> {
        if let Some(handles) = &self.handles {
            let mut handles = handles.lock().unwrap();
            handles
                .writer
                .write_all(input.as_bytes())
                .map_err(|e| SessionError::WriteError(e.to_string()))?;
            Ok(())
        } else {
            Err(SessionError::NotFound)
        }
    }

    pub fn resize_pty(&self, cols: u16, rows: u16) -> Result<(), SessionError> {
        if let Some(handles) = &self.handles {
            let handles = handles.lock().unwrap();
            handles
                .master
                .resize(PtySize {
                    rows,
                    cols,
                    pixel_width: 0,
                    pixel_height: 0,
                })
                .map_err(|e| SessionError::ResizeError(e.to_string()))?;
            Ok(())
        } else {
            Err(SessionError::NotFound)
        }
    }

    pub fn kill_session(&self) -> Result<(), SessionError> {
        if let Some(handles) = &self.handles {
            let mut handles = handles.lock().unwrap();
            handles
                .child
                .kill()
                .map_err(|e| SessionError::KillError(e.to_string()))?;
            Ok(())
        } else {
            Err(SessionError::NotFound)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn serialize_deserialize_pty_session() {
        let session = PtySession {
            id: Uuid::new_v4(),
            project_id: Uuid::new_v4(),
            name: "test_tab".to_string(),
            shell: Shell::Bash,
            path: PathBuf::from("/home/user"),
            handles: None,
        };

        let json = serde_json::to_string(&session).expect("Failed to serialize");
        let deserialized: PtySession = serde_json::from_str(&json).expect("Failed to deserialize");

        assert_eq!(session.id, deserialized.id);
        assert_eq!(session.name, deserialized.name);
        assert!(deserialized.handles.is_none());
    }
}
