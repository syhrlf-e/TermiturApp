use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub general: GeneralConfig,
    pub keybindings: KeybindingMap,
    pub projects: Vec<ProjectState>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeneralConfig {
    pub default_shell: Shell,
    pub font_size: u16,
    pub scrollback_lines: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum Shell {
    Bash,
    Zsh,
    PowerShell,
    Fish,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectState {
    pub id: Uuid,
    pub name: String,
    pub path: PathBuf,
    pub group: Option<String>,
    pub terminals: Vec<TerminalState>,
    pub active_terminal: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TerminalState {
    pub id: Uuid,
    pub name: String,
}

pub type KeybindingMap = HashMap<String, String>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn serialize_deserialize_config() {
        let config = Config {
            general: GeneralConfig {
                default_shell: Shell::Bash,
                font_size: 14,
                scrollback_lines: 1000,
            },
            keybindings: HashMap::from([("new_terminal".to_string(), "Ctrl+N".to_string())]),
            projects: vec![],
        };

        let toml_str = toml::to_string(&config).expect("Failed to serialize to TOML");
        let deserialized: Config = toml::from_str(&toml_str).expect("Failed to deserialize from TOML");

        assert_eq!(config.general.font_size, deserialized.general.font_size);
        assert_eq!(config.general.default_shell, deserialized.general.default_shell);
        assert_eq!(config.keybindings.get("new_terminal"), deserialized.keybindings.get("new_terminal"));
    }
}
