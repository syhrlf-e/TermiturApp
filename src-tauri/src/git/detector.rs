use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum GitStatus {
    Initialized,
    NotInitialized,
}

pub fn detect_git(path: &Path) -> GitStatus {
    let git_dir = path.join(".git");
    if git_dir.exists() && git_dir.is_dir() {
        GitStatus::Initialized
    } else {
        GitStatus::NotInitialized
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn test_git_status_serialization() {
        let status = GitStatus::Initialized;
        let json = serde_json::to_string(&status).expect("Failed to serialize");
        assert_eq!(json, "\"Initialized\"");

        let deserialized: GitStatus = serde_json::from_str(&json).expect("Failed to deserialize");
        assert_eq!(status, deserialized);
    }

    #[test]
    fn folder_with_git_returns_initialized() {
        let dir = tempdir().unwrap();
        let git_dir = dir.path().join(".git");
        fs::create_dir(&git_dir).unwrap();

        assert_eq!(detect_git(dir.path()), GitStatus::Initialized);
    }

    #[test]
    fn folder_without_git_returns_not_initialized() {
        let dir = tempdir().unwrap();
        assert_eq!(detect_git(dir.path()), GitStatus::NotInitialized);
    }
}
