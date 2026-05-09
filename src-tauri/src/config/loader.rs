use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use crate::config::schema::{Config, GeneralConfig, Shell};

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("Gagal mendapatkan direktori config system")]
    DirNotFound,

    #[error("Gagal membaca config dari {path}: {source}")]
    ReadError { path: PathBuf, source: std::io::Error },

    #[error("Gagal menulis config ke {path}: {source}")]
    WriteError { path: PathBuf, source: std::io::Error },

    #[error("Config tidak valid: {0}")]
    ParseError(#[from] toml::de::Error),

    #[error("Gagal menserialisasi config: {0}")]
    SerializeError(#[from] toml::ser::Error),
}

/// Mendapatkan path absolut ke file `config.toml` berdasarkan OS.
pub fn get_config_path() -> Result<PathBuf, ConfigError> {
    let config_dir = dirs::config_dir().ok_or(ConfigError::DirNotFound)?;
    let termitur_dir = config_dir.join("termitur");
    Ok(termitur_dir.join("config.toml"))
}

/// Mengecek apakah file config sudah pernah dibuat (First run detection).
pub fn config_exists() -> bool {
    if let Ok(path) = get_config_path() {
        path.exists()
    } else {
        false
    }
}

/// Membaca file config dari path sistem dan me-return Config struct.
pub fn load_config() -> Result<Config, ConfigError> {
    let path = get_config_path()?;
    let content = fs::read_to_string(&path).map_err(|e| ConfigError::ReadError {
        path: path.clone(),
        source: e,
    })?;

    let config: Config = toml::from_str(&content)?;
    Ok(config)
}

/// Menulis Config struct ke dalam file sistem `config.toml`.
pub fn save_config(config: &Config) -> Result<(), ConfigError> {
    let path = get_config_path()?;

    if let Some(parent) = path.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent).map_err(|e| ConfigError::WriteError {
                path: parent.to_path_buf(),
                source: e,
            })?;
        }
    }

    let content = toml::to_string_pretty(config)?;
    fs::write(&path, content).map_err(|e| ConfigError::WriteError { path, source: e })?;

    Ok(())
}

/// Membuat konfigurasi default.
pub fn create_default_config(shell: Shell) -> Config {
    let mut keybindings = HashMap::new();
    keybindings.insert("new_terminal".to_string(), "Ctrl+N".to_string());
    keybindings.insert("new_project".to_string(), "Ctrl+Shift+N".to_string());
    keybindings.insert("close_terminal".to_string(), "Ctrl+W".to_string());
    keybindings.insert("next_terminal".to_string(), "Ctrl+Tab".to_string());
    keybindings.insert("prev_terminal".to_string(), "Ctrl+Shift+Tab".to_string());
    keybindings.insert("exit".to_string(), "Ctrl+E".to_string());
    keybindings.insert("rename".to_string(), "Ctrl+R".to_string());
    keybindings.insert("add_group".to_string(), "Ctrl+G".to_string());
    keybindings.insert("copy".to_string(), "Ctrl+Shift+C".to_string());

    Config {
        general: GeneralConfig {
            default_shell: shell,
            font_size: 14,
            scrollback_lines: 1000,
        },
        keybindings,
        projects: vec![],
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn config_exists_returns_false_for_nonexistent_file() {
        // Tes ini hanya memastikan fungsi tidak panic.
        // Dalam kondisi normal, jika kita mendelete file-nya (jika ada di temp), dia harus return false.
        let _ = config_exists();
    }

    #[test]
    fn create_default_config_generates_valid_struct() {
        let config = create_default_config(Shell::Zsh);
        assert_eq!(config.general.default_shell, Shell::Zsh);
        assert_eq!(config.general.font_size, 14);
        assert_eq!(config.general.scrollback_lines, 1000);
        assert_eq!(
            config.keybindings.get("new_terminal").unwrap(),
            "Ctrl+N"
        );
    }

    #[test]
    fn config_serializes_to_toml_correctly() {
        let config = create_default_config(Shell::Bash);
        let toml_str = toml::to_string(&config).expect("Failed to serialize to TOML");
        assert!(toml_str.contains("default_shell = \"Bash\""));
    }

    #[test]
    fn config_deserializes_from_toml_correctly() {
        let config = create_default_config(Shell::Fish);
        let toml_str = toml::to_string(&config).expect("Failed to serialize to TOML");
        let deserialized: Config = toml::from_str(&toml_str).expect("Failed to deserialize from TOML");
        assert_eq!(config.general.font_size, deserialized.general.font_size);
        assert_eq!(
            config.general.default_shell,
            deserialized.general.default_shell
        );
    }

    #[test]
    fn get_config_path_returns_correct_platform_path() {
        let path = get_config_path().unwrap();
        let path_str = path.to_string_lossy();
        assert!(path_str.contains("termitur"));
        assert!(path_str.ends_with("config.toml"));
    }
}
