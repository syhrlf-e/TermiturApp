# PRD — Termitur v2.0.0 (Tauri Edition)
> **"Your terminal, now structured."**

---

## 1. Overview

**Termitur** adalah aplikasi desktop terminal manager yang dirancang untuk developer enthusiast yang sering bekerja dengan banyak project sekaligus. Termitur menyelesaikan masalah terminal yang berceceran dan kehilangan konteks project dengan menghadirkan sistem project-based terminal management — sidebar untuk navigasi project, terminal tabs per project, git detection, dan persistent session state.

Termitur dibangun dengan Tauri v2 (Rust backend + React frontend) — jauh lebih ringan dari solusi berbasis Electron seperti Connexio, dengan target resource usage yang minimal.

---

## 2. Target Platform

| Platform | Status |
|---|---|
| Windows | ✅ Fase 1 |
| Linux | ✅ Fase 1 |
| macOS | ⏳ Future |

---

## 3. Tech Stack

### Backend (Rust)
| Komponen | Teknologi |
|---|---|
| Desktop Framework | Tauri v2 |
| PTY Handling | portable-pty |
| Config Serialization | serde + toml |
| Config Path Detection | dirs |
| Git Detection | cek folder `.git` (tanpa git2) |
| Logging | tracing + tracing-appender |

### Frontend (React)
| Komponen | Teknologi |
|---|---|
| UI Framework | React 18 |
| Styling | Tailwind CSS v4 |
| State Management | Zustand |
| Terminal Renderer | xterm.js + xterm-addon-fit |

---

## 4. Tagline & Branding

- **Nama:** Termitur
- **Tagline:** Your terminal, now structured.
- **Tema:** Dark only — warna dark yang enak dipandang, bukan hitam keras
- **Window Style:** Frameless (custom titlebar)

---

## 5. Konsep Dua Level

Termitur memiliki dua level organisasi yang berbeda:

```
Level 1 — Project (Sidebar)
    Setiap folder/project yang dibuka menjadi 
    satu entry di sidebar.

Level 2 — Terminal Tab (Tab bar di dalam project)
    Setiap project bisa punya beberapa terminal 
    tab yang berjalan secara independen.
```

Visualisasi:
```
┌──────────────┬─────────────────────────────────────┐
│              │ [terminal 1] [terminal 2]  +         │
│   Sidebar    ├─────────────────────────────────────┤
│              │                                     │
│ • Termitur 🟢│   xterm.js terminal area            │
│ • Imarah     │   (shell aktif berjalan di sini)    │
│ • my-app  🟢│                                     │
│              │                                     │
│              │                                     │
├──────────────┤                                     │
│ + New Project│                                     │
└──────────────┴─────────────────────────────────────┘
```

---

## 6. Arsitektur Folder Project

```
TermiturApp/
├── context_product/                  # Dokumentasi proyek
│   ├── PRD_Termitur_v2.0.0.md
│   ├── DEVELOPMENT_PHASES_Termitur_v2.0.0.md
│   └── AGENT_CONTEXT_Termitur_v2.0.0.md
├── src-tauri/                    # Rust backend
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── main.rs               # Entry point Tauri
│       ├── lib.rs                # Tauri commands & events registration
│       ├── config/
│       │   ├── mod.rs
│       │   ├── loader.rs         # Baca/tulis config, path detection
│       │   └── schema.rs         # Struct Config, ProjectState, dll
│       ├── terminal/
│       │   ├── mod.rs
│       │   ├── session.rs        # PTY session management
│       │   └── manager.rs        # Manage multiple PTY sessions
│       ├── git/
│       │   └── detector.rs       # Deteksi .git folder
│       ├── updater.rs            # Cek GitHub Releases
│       └── logging.rs            # Setup tracing + tracing-appender
├── src/                          # React frontend
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root component
│   ├── store/
│   │   ├── projectStore.ts       # Zustand store untuk projects
│   │   └── terminalStore.ts      # Zustand store untuk terminal tabs
│   ├── components/
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx       # Container sidebar
│   │   │   ├── ProjectItem.tsx   # Item project di sidebar
│   │   │   └── ContextMenu.tsx   # Right-click context menu
│   │   ├── Terminal/
│   │   │   ├── TerminalArea.tsx  # Container terminal + tab bar
│   │   │   ├── TerminalTab.tsx   # Tab individual terminal
│   │   │   └── TerminalPane.tsx  # xterm.js instance
│   │   ├── Titlebar/
│   │   │   └── Titlebar.tsx      # Custom frameless titlebar
│   │   └── Onboarding/
│   │       └── OnboardingModal.tsx # First run modal
│   ├── hooks/
│   │   ├── useTerminal.ts        # Hook untuk PTY interaction
│   │   └── useTauri.ts           # Hook untuk Tauri commands/events
│   └── styles/
│       └── globals.css           # Global styles + Tailwind v4 via @import
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 7. IPC Architecture (Frontend ↔ Backend)

Komunikasi antara React frontend dan Rust backend menggunakan dua mekanisme Tauri v2:

### Frontend → Backend (Tauri Commands)
Dipanggil saat user melakukan aksi:
```
invoke('spawn_shell', { projectId, shell, path })
invoke('write_to_shell', { sessionId, input })
invoke('resize_pty', { sessionId, cols, rows })
invoke('kill_session', { sessionId })
invoke('get_config')
invoke('save_config', { config })
invoke('detect_git', { path })
invoke('open_folder_dialog')
invoke('check_update')
```

### Backend → Frontend (Tauri Events)
Di-emit Rust secara realtime:
```
'pty-output'      → data output PTY dikirim ke xterm.js
'git-status'      → update status git sebuah project
'session-exit'    → shell process mati/crash
'update-available'→ notifikasi versi baru tersedia
```

---

## 8. Fitur & Behavior

### 8.1 Sidebar (Project Level)

- Daftar project yang dibuka, persistent antar sesi
- Setiap project item menampilkan:
  - Nama folder (parent directory) di kiri
  - Badge 🟢 di kanan jika folder memiliki `.git`
  - Badge 🔴 jika folder tidak ditemukan atau permission error
- Scrollable jika project lebih dari visible area
- Tombol `+ New Project` di bagian bawah sidebar
- **Naming conflict:** Jika dua project punya nama folder sama, tampilkan sub-label path singkat saat di-hover
- **Drag & drop** untuk reorder project di sidebar
- **Right-click context menu** pada project item:
  ```
  ┌──────────────────┐
  │ Rename    Ctrl+R │
  │ Add Group Ctrl+G │
  │ Delete    Ctrl+W │
  └──────────────────┘
  ```

### 8.2 Terminal Area (Terminal Tab Level)

- Tab bar di atas area terminal untuk navigasi antar terminal dalam satu project
- Setiap project bisa punya **banyak terminal tab** secara independen
- Tab bisa di-rename (double-click atau `Ctrl+R`)
- Tab bisa di-drag untuk reorder
- Tombol `+` di tab bar untuk buka terminal baru dalam project aktif
- xterm.js merender output PTY secara realtime
- Font: JetBrains Mono (bundled)
- Font size: 14px default, adjustable di settings
- Scrollback: 1000 baris default, adjustable di settings

### 8.3 Custom Titlebar

- Frameless window dengan custom titlebar
- Konten titlebar: nama app + window controls (minimize, maximize, close)
- Drag area untuk memindahkan window

### 8.4 Onboarding (First Run)

Muncul saat `config.toml` belum ada:

```
┌─────────────────────────────────┐
│   Welcome to Termitur           │
│   Your terminal, now structured │
│                                 │
│   Choose your default shell:    │
│                                 │
│   ● bash   ○ zsh                │
│   ○ powershell  ○ fish          │
│                                 │
│        [ Get Started ]          │
└─────────────────────────────────┘
```

- Pilih default shell → simpan ke config → masuk app
- Tidak muncul lagi setelah first run selesai

### 8.5 Settings

Accessible via settings icon atau menu. Konfigurasi yang tersedia:
- Default shell (bash/zsh/powershell/fish)
- Font size terminal (default: 14px)
- Scrollback lines (default: 1000)

---

## 9. Keybinding

| Shortcut | Aksi |
|---|---|
| `Ctrl+N` | Terminal baru dalam project aktif |
| `Ctrl+Shift+N` | Project baru di sidebar |
| `Ctrl+W` | Tutup terminal tab aktif |
| `Ctrl+Tab` | Pindah terminal tab (maju) |
| `Ctrl+Shift+Tab` | Pindah terminal tab (mundur) |
| `Ctrl+E` | Exit Termitur |
| `Ctrl+R` | Rename terminal tab aktif |
| `Ctrl+G` | Add project ke group |
| `Ctrl+Shift+C` | Copy ke system clipboard |

> Semua keybinding dapat di-customize via `config.toml`.

---

## 10. PTY & Shell

- Shell di-spawn menggunakan `portable-pty` di Rust backend
- Shell inherit semua env vars dari parent process (Termitur)
- Shell di-spawn dengan `cd` otomatis ke path project
- PTY output di-stream ke frontend via Tauri event `pty-output` secara realtime
- Input dari xterm.js dikirim ke PTY via Tauri command `write_to_shell`
- PTY di-resize saat window atau terminal area di-resize via `resize_pty`
- Platform: Windows menggunakan ConPTY, Linux menggunakan Unix PTY — transparan via `portable-pty`

---

## 11. Git Detection

- Deteksi dilakukan di Rust backend dengan cek keberadaan folder `.git`
- Tidak menggunakan crate `git2` — cukup filesystem check
- Hasil dikirim ke frontend via Tauri event `git-status`
- Badge 🟢 muncul di sidebar jika `detect_git` return `Initialized`
- Re-check dilakukan saat project dibuka atau di-refresh

---

## 12. Config File

- Format: **TOML**
- Path: **auto-detect** berdasarkan platform
  ```
  Linux   → ~/.config/termitur/config.toml
  Windows → %AppData%\termitur\config.toml
  ```
- First run detection: cek keberadaan `config.toml`
- Isi config:

```toml
[general]
default_shell = "bash"
font_size = 14
scrollback_lines = 1000

[keybindings]
new_terminal = "Ctrl+N"
new_project = "Ctrl+Shift+N"
close_terminal = "Ctrl+W"
next_terminal = "Ctrl+Tab"
prev_terminal = "Ctrl+Shift+Tab"
exit = "Ctrl+E"
rename = "Ctrl+R"
add_group = "Ctrl+G"
copy = "Ctrl+Shift+C"

[projects]
# Di-generate otomatis oleh aplikasi
```

---

## 13. Persistence

Saat Termitur ditutup dan dibuka kembali, yang di-restore:

| Data | Disimpan |
|---|---|
| Daftar project (path, nama) | ✅ |
| Urutan project di sidebar | ✅ |
| Group project | ✅ |
| Project aktif terakhir | ✅ |
| Jumlah terminal tab per project | ✅ |
| Nama terminal tab | ✅ |
| Terminal tab aktif per project | ✅ |
| Isi terminal / output history | ❌ (proses sudah mati) |
| Running process | ❌ (proses sudah mati) |

---

## 14. Error Handling UX

### Skenario 1 — Folder tidak ditemukan
```
Sidebar   : badge 🔴
Terminal  : ⚠ Folder tidak ditemukan: ~/projects/Termitur
              [Relocate Folder]  [Close Project]
```
- `Relocate Folder` → buka folder picker → update path project

### Skenario 2 — Shell crash
```
Terminal  : ⚠ Shell process terminated unexpectedly
              [Restart Shell]  [Close Tab]
```

### Skenario 3 — Permission denied
```
Sidebar   : badge 🔴
Terminal  : ⚠ Permission denied: ~/projects/Termitur
              [Close Project]
```

---

## 15. Logging

- Menggunakan crate `tracing` + `tracing-appender`
- Log disimpan di:
  ```
  Linux   → ~/.config/termitur/logs/termitur.log
  Windows → %AppData%\termitur\logs\termitur.log
  ```
- Default log level: ERROR + WARN
- Bisa dinaikkan via flag: `termitur --log-level debug`
- Log rotation otomatis: harian atau saat ukuran mencapai 10MB

---

## 16. Update Mechanism

- Cek versi terbaru dari GitHub Releases saat startup secara async
- Jika ada update, tampilkan notifikasi toast di app:
  ```
  New version available: v2.1.0
  Download at github.com/[user]/termitur/releases
  ```
- Keputusan update tetap di tangan user
- Tidak ada auto-update — user download manual dari GitHub Releases
- Jika tidak ada koneksi, app tetap berjalan normal (silent fail)

---

## 17. Distribusi

| Fase | Platform | Format |
|---|---|---|
| Fase 1 | Windows | `.exe` installer via GitHub Releases |
| Fase 1 | Linux | `.AppImage` via GitHub Releases |
| Fase 2 | Windows | winget |
| Fase 2 | Linux | AUR |

Build pipeline via **GitHub Actions** — auto-build saat push tag.

```
GitHub Releases
├── Termitur_2.0.0_windows_x64.exe
├── Termitur_2.0.0_linux_x86_64.AppImage
└── checksums.txt
```

---

## 18. Performance Target

| Metrik | Target |
|---|---|
| Startup time | < 1 detik |
| Memory usage (idle) | < 80MB |
| Binary size | < 10MB (tanpa webview) |

> Termitur dengan Tauri secara signifikan lebih ringan dari solusi Electron (yang baseline-nya 150MB+).

---

## 19. Yang Tidak Ada di v2.0.0

Fitur berikut sengaja tidak dimasukkan untuk menjaga fokus:

- ❌ Split pane (dihapus — digantikan oleh multiple terminal tabs)
- ❌ SSH Manager (future version)
- ❌ Task Runner (future version)
- ❌ Multiple themes (dark only untuk sekarang)
- ❌ Auto-update installer (manual download)

---

## 20. Architectural Decisions

### IPC Pattern
- Frontend memanggil backend via `invoke()` untuk aksi user
- Backend push ke frontend via `emit()` untuk data realtime (PTY output, git status)
- Tidak ada polling dari frontend — semua realtime data via events

### State Management
- **Zustand** untuk state di frontend (project list, active terminal, dll)
- **TOML config** untuk persistence di backend
- Tidak ada database — config file sebagai single source of truth

### Terminal Rendering
- xterm.js menerima raw PTY output langsung dari Tauri event
- `xterm-addon-fit` handle auto-resize saat window di-resize
- Frontend tidak memproses atau menginterpret PTY output — langsung pass ke xterm.js

---

*PRD ini adalah dokumen hidup untuk Termitur v2.0.0 (Tauri Edition). Dibuat berdasarkan PRD v1.0.0 dengan penyesuaian untuk arsitektur Tauri v2, React 18, dan Tailwind CSS v4.*
