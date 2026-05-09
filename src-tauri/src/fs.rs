use crate::config::schema::ProjectState;
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum PathStatus {
    Ok,
    NotFound,
    PermissionDenied,
}

pub fn validate_path(path: &Path) -> PathStatus {
    if !path.exists() {
        return PathStatus::NotFound;
    }
    match std::fs::read_dir(path) {
        Ok(_) => PathStatus::Ok,
        Err(e) => {
            if e.kind() == std::io::ErrorKind::PermissionDenied {
                PathStatus::PermissionDenied
            } else {
                // Untuk error filesystem lainnya, asumsikan NotFound untuk kemudahan UI handling
                PathStatus::NotFound
            }
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct DisplayName {
    pub label: String,
    pub sublabel: Option<String>,
}

pub fn resolve_display_name(projects: &[ProjectState], project: &ProjectState) -> DisplayName {
    let has_duplicate = projects
        .iter()
        .any(|p| p.name == project.name && p.id != project.id);

    if has_duplicate {
        let sublabel = project.path.to_string_lossy().to_string();
        DisplayName {
            label: project.name.clone(),
            sublabel: Some(sublabel),
        }
    } else {
        DisplayName {
            label: project.name.clone(),
            sublabel: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;
    use tempfile::tempdir;
    use uuid::Uuid;

    #[test]
    fn test_validate_path_not_found() {
        let path = Path::new("/this/path/should/not/exist/12345");
        assert_eq!(validate_path(path), PathStatus::NotFound);
    }

    #[test]
    fn test_validate_path_ok() {
        let dir = tempdir().unwrap();
        assert_eq!(validate_path(dir.path()), PathStatus::Ok);
    }

    #[test]
    fn test_resolve_display_name_unique() {
        let p1 = ProjectState {
            id: Uuid::new_v4(),
            name: "MyProject".to_string(),
            path: PathBuf::from("/a/b/MyProject"),
            group: None,
            terminals: vec![],
            active_terminal: 0,
        };

        let projects = vec![p1.clone()];
        let display = resolve_display_name(&projects, &p1);
        
        assert_eq!(display.label, "MyProject");
        assert_eq!(display.sublabel, None);
    }

    #[test]
    fn test_resolve_display_name_duplicate() {
        let p1 = ProjectState {
            id: Uuid::new_v4(),
            name: "MyProject".to_string(),
            path: PathBuf::from("/a/b/MyProject"),
            group: None,
            terminals: vec![],
            active_terminal: 0,
        };

        let p2 = ProjectState {
            id: Uuid::new_v4(),
            name: "MyProject".to_string(), // Same name
            path: PathBuf::from("/x/y/MyProject"),
            group: None,
            terminals: vec![],
            active_terminal: 0,
        };

        let projects = vec![p1.clone(), p2.clone()];
        
        let display1 = resolve_display_name(&projects, &p1);
        assert_eq!(display1.label, "MyProject");
        // Di Windows bisa menggunakan `\`, di Linux `/`. Kita hanya cek format string.
        assert_eq!(display1.sublabel.unwrap(), PathBuf::from("/a/b/MyProject").to_string_lossy().to_string());

        let display2 = resolve_display_name(&projects, &p2);
        assert_eq!(display2.label, "MyProject");
        assert_eq!(display2.sublabel.unwrap(), PathBuf::from("/x/y/MyProject").to_string_lossy().to_string());
    }
}
