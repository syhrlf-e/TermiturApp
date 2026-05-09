use crate::config::schema::Shell;
use crate::terminal::session::{PtySession, SessionError};
use std::collections::HashMap;
use std::io::Read;
use std::path::PathBuf;
use tokio::sync::mpsc::UnboundedSender;
use uuid::Uuid;

pub struct SessionManager {
    pub sessions: HashMap<Uuid, PtySession>,
    pub output_tx: UnboundedSender<(Uuid, String)>,
}

impl SessionManager {
    pub fn new(output_tx: UnboundedSender<(Uuid, String)>) -> Self {
        Self {
            sessions: HashMap::new(),
            output_tx,
        }
    }

    pub fn spawn(
        &mut self,
        project_id: Uuid,
        name: String,
        shell: Shell,
        path: PathBuf,
    ) -> Result<Uuid, SessionError> {
        let id = Uuid::new_v4();
        let (session, mut reader) = PtySession::spawn_shell(id, project_id, name, shell, path)?;

        self.sessions.insert(id, session);

        let tx = self.output_tx.clone();
        let session_id = id;

        // PTY reader berjalan di background thread (tokio task)
        // output dikirim via channel, bukan blocking read di main thread
        tokio::task::spawn_blocking(move || {
            let mut buf = [0u8; 1024];
            while let Ok(n) = reader.read(&mut buf) {
                if n == 0 {
                    break;
                }
                let out = String::from_utf8_lossy(&buf[..n]).to_string();
                if tx.send((session_id, out)).is_err() {
                    // Receiver closed
                    break;
                }
            }
        });

        Ok(id)
    }

    pub fn write(&self, id: Uuid, input: &str) -> Result<(), SessionError> {
        if let Some(session) = self.sessions.get(&id) {
            session.write_to_shell(input)
        } else {
            Err(SessionError::NotFound)
        }
    }

    pub fn resize(&self, id: Uuid, cols: u16, rows: u16) -> Result<(), SessionError> {
        if let Some(session) = self.sessions.get(&id) {
            session.resize_pty(cols, rows)
        } else {
            Err(SessionError::NotFound)
        }
    }

    pub fn kill(&mut self, id: Uuid) -> Result<(), SessionError> {
        if let Some(session) = self.sessions.get(&id) {
            session.kill_session()?;
            self.sessions.remove(&id);
            Ok(())
        } else {
            Err(SessionError::NotFound)
        }
    }

    pub fn kill_all(&mut self) {
        for session in self.sessions.values() {
            let _ = session.kill_session();
        }
        self.sessions.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::sync::mpsc;
    use tokio::time::{timeout, Duration};

    #[tokio::test]
    async fn test_spawn_and_read_output() {
        let (tx, mut rx) = mpsc::unbounded_channel();
        let mut manager = SessionManager::new(tx);

        let shell = if cfg!(target_os = "windows") {
            Shell::PowerShell
        } else {
            Shell::Bash
        };

        let id = manager
            .spawn(
                Uuid::new_v4(),
                "test".into(),
                shell,
                PathBuf::from("."),
            )
            .expect("Failed to spawn");

        manager.write(id, "echo hello\n").expect("Failed to write");

        let result = timeout(Duration::from_secs(5), async {
            let mut output = String::new();
            while let Some((event_id, data)) = rx.recv().await {
                assert_eq!(id, event_id);
                output.push_str(&data);
                if output.contains("hello") {
                    return true;
                }
            }
            false
        })
        .await;

        assert!(result.is_ok(), "Test timed out");
        assert!(result.unwrap(), "Did not find 'hello' in output");

        manager.kill(id).unwrap();
    }

    #[tokio::test]
    async fn test_spawn_pwd() {
        let (tx, mut rx) = mpsc::unbounded_channel();
        let mut manager = SessionManager::new(tx);

        let (shell, cmd) = if cfg!(target_os = "windows") {
            (Shell::PowerShell, "pwd\n")
        } else {
            (Shell::Bash, "pwd\n")
        };

        let id = manager
            .spawn(
                Uuid::new_v4(),
                "pwd_test".into(),
                shell,
                PathBuf::from("."),
            )
            .expect("Failed to spawn");

        manager.write(id, cmd).expect("Failed to write");

        let result = timeout(Duration::from_secs(5), async {
            let mut output = String::new();
            while let Some((event_id, data)) = rx.recv().await {
                assert_eq!(id, event_id);
                output.push_str(&data);
                if output.len() > 10 { // Cukup memastikan ada respon dari command pwd
                    return true;
                }
            }
            false
        })
        .await;

        assert!(result.is_ok(), "Test timed out");
        assert!(result.unwrap(), "Did not receive sufficient output");

        manager.kill(id).unwrap();
    }
}
