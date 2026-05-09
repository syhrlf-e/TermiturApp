# Development Phases — Termitur v2.0.0 (Tauri Edition)
> **"Your terminal, now structured."**
> Bottom-up development approach — fondasi dulu, tampilan terakhir.

---

## Overview

| Phase | Nama | Kategori | Status |
|---|---|---|---|
| 0 | Project Setup & Tooling | Foundation | ⏳ Todo |
| 1 | Core Data Layer (Rust) | Foundation | ⏳ Todo |
| 2 | Config System (Rust) | Foundation | ⏳ Todo |
| 3 | PTY & Shell Engine (Rust) | Core Engine | ⏳ Todo |
| 4 | Git Detector & File System (Rust) | Core Engine | ⏳ Todo |
| 5 | Tauri Commands & Events Bridge | Core Engine | ⏳ Todo |
| 6 | Frontend Foundation (React) | UI Layer | ⏳ Todo |
| 7 | Sidebar Component | UI Layer | ⏳ Todo |
| 8 | Terminal Area & xterm.js | UI Layer | ⏳ Todo |
| 9 | Custom Titlebar & Frameless Window | UI Layer | ⏳ Todo |
| 10 | Onboarding Modal & Settings | UI Layer | ⏳ Todo |
| 11 | Keybinding & Context Menu | UI Layer | ⏳ Todo |
| 12 | Error Handling & Logging | Hardening | ⏳ Todo |
| 13 | Persistence | Hardening | ⏳ Todo |
| 14 | Update Checker | Hardening | ⏳ Todo |
| 15 | Polish & Distribution | Release | ⏳ Todo |

---

## Phase 0 — Project Setup & Tooling

**Tujuan:** Menyiapkan fondasi project Tauri v2 yang siap dikembangkan, dengan struktur folder yang benar dan semua tooling terkonfigurasi.

### Tasks:
- [ ] Buat folder root `TermiturApp/` dan masuk ke dalamnya
- [ ] Buat folder `context_product/` dan letakkan ketiga file dokumentasi di sini:
  ```
  TermiturApp/
  └── context_product/
      ├── PRD_Termitur_v2.0.0.md
      ├── DEVELOPMENT_PHASES_Termitur_v2.0.0.md
      └── AGENT_CONTEXT_Termitur_v2.0.0.md
  ```
- [ ] Install Tauri v2 CLI: `cargo install tauri-cli --version "^2.0"`
- [ ] Scaffold project Tauri dari dalam `TermiturApp/`:
  ```bash
  cargo tauri init
  # productName: Termitur
  # window title: Termitur
  # frontend dist: ../dist
  # dev server url: http://localhost:1420
  ```
- [ ] Setup frontend dengan Vite + React 18 + TypeScript:
  ```bash
  npm create vite@latest . -- --template react-ts
  ```
- [ ] Install frontend dependencies:
  ```bash
  # React 18 (stable)
  npm install react@18 react-dom@18
  npm install -D @types/react@18 @types/react-dom@18

  # Tailwind CSS v4
  npm install -D tailwindcss@4 @tailwindcss/vite

  # State & Terminal
  npm install zustand
  npm install @xterm/xterm @xterm/addon-fit

  # Tauri
  npm install @tauri-apps/api@2 @tauri-apps/plugin-dialog
  ```
- [ ] Setup Tailwind CSS v4 — **tidak ada `tailwind.config.js`**:
  - [ ] Update `vite.config.ts` untuk pakai Tailwind v4 plugin:
    ```typescript
    import tailwindcss from '@tailwindcss/vite'
    export default defineConfig({
      plugins: [react(), tailwindcss()],
    })
    ```
  - [ ] Update `src/styles/globals.css`:
    ```css
    @import "tailwindcss";
    ```
- [ ] Setup `tsconfig.json` yang strict:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noImplicitReturns": true
    }
  }
  ```
- [ ] Verifikasi struktur folder sesuai PRD:
  ```
  TermiturApp/
  ├── context_product/   ← dokumentasi
  ├── src-tauri/         ← Rust backend
  ├── src/               ← React frontend
  ├── package.json
  ├── vite.config.ts
  └── tsconfig.json
  ```
- [ ] Update `src-tauri/Cargo.toml` dengan dependencies awal:
  ```toml
  [dependencies]
  tauri = { version = "2", features = [] }
  portable-pty = "0.8"
  serde = { version = "1", features = ["derive"] }
  serde_json = "1"
  toml = "0.8"
  dirs = "5"
  tracing = "0.1"
  tracing-appender = "0.2"
  tracing-subscriber = "0.3"
  tokio = { version = "1", features = ["full"] }
  uuid = { version = "1", features = ["v4", "serde"] }
  thiserror = "1"
  ```
- [ ] Update `tauri.conf.json`:
  - [ ] Set `productName: "Termitur"`
  - [ ] Set `version: "2.0.0"`
  - [ ] Set `bundle.identifier: "com.termitur.app"`
  - [ ] Konfigurasi window: `decorations: false` (frameless)
  - [ ] Set window size default: `width: 1200, height: 800`
  - [ ] Set `minWidth: 800, minHeight: 600`
- [ ] Setup `.gitignore` (target/, node_modules/, dist/, .env, *.log)
- [ ] Setup `rustfmt.toml` dan `clippy.toml`
- [ ] Inisialisasi Git repository
- [ ] Buat `README.md` dasar
- [ ] Verifikasi `cargo tauri dev` berjalan tanpa error

### Deliverable:
`cargo tauri dev` berjalan, muncul window kosong frameless. `cargo build` dan `npm run build` sukses tanpa error. Tailwind v4 utility classes berfungsi di komponen React.

---

## Phase 1 — Core Data Layer (Rust)

**Tujuan:** Mendefinisikan semua struct dan enum inti di Rust backend sebagai kontrak data seluruh aplikasi. Murni tipe data — tidak ada logic, tidak ada IO.

### Tasks:
- [ ] Buat `src-tauri/src/terminal/mod.rs`
- [ ] Buat `src-tauri/src/terminal/session.rs` — struct `PtySession`:
  ```rust
  pub struct PtySession {
      pub id: Uuid,
      pub project_id: Uuid,
      pub name: String,
      pub shell: Shell,
      pub path: PathBuf,
      // PTY handles ditambahkan di Phase 3
  }
  ```
- [ ] Buat `src-tauri/src/config/schema.rs` — semua struct config:
  ```rust
  pub struct Config {
      pub general: GeneralConfig,
      pub keybindings: KeybindingMap,
      pub projects: Vec<ProjectState>,
  }

  pub struct GeneralConfig {
      pub default_shell: Shell,
      pub font_size: u16,
      pub scrollback_lines: u32,
  }

  pub enum Shell {
      Bash,
      Zsh,
      PowerShell,
      Fish,
  }

  pub struct ProjectState {
      pub id: Uuid,
      pub name: String,
      pub path: PathBuf,
      pub group: Option<String>,
      pub terminals: Vec<TerminalState>,
      pub active_terminal: usize,
  }

  pub struct TerminalState {
      pub id: Uuid,
      pub name: String,
  }

  pub type KeybindingMap = HashMap<String, String>;
  ```
- [ ] Buat `src-tauri/src/git/detector.rs` — enum `GitStatus`:
  ```rust
  pub enum GitStatus {
      Initialized,
      NotInitialized,
  }
  ```
- [ ] Semua struct implement `Serialize`, `Deserialize`, `Clone`, `Debug`
- [ ] Tulis unit tests serialize/deserialize untuk semua struct

### Deliverable:
`cargo test` hijau. Semua tipe data terdefinisi dengan benar.

---

## Phase 2 — Config System (Rust)

**Tujuan:** Backend dapat membaca dan menulis config TOML, mendeteksi first run, dan auto-detect config path berdasarkan platform.

### Tasks:
- [ ] Buat `src-tauri/src/config/loader.rs`:
  - [ ] `get_config_path()` → `Result<PathBuf, ConfigError>`
    - Linux: `~/.config/termitur/config.toml` (XDG)
    - Windows: `%AppData%\termitur\config.toml`
  - [ ] `config_exists()` → `bool` — first run detection
  - [ ] `load_config()` → `Result<Config, ConfigError>`
  - [ ] `save_config(config: &Config)` → `Result<(), ConfigError>`
  - [ ] `create_default_config(shell: Shell)` → `Config`
- [ ] Buat `src-tauri/config/default.toml`:
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
  ```
- [ ] Custom error type `ConfigError` menggunakan `thiserror`
- [ ] Tulis unit tests:
  - [ ] `config_exists()` return false jika file tidak ada
  - [ ] `create_default_config()` menghasilkan config yang valid
  - [ ] Config berhasil di-serialize ke TOML string
  - [ ] Config berhasil di-deserialize dari TOML string
  - [ ] `get_config_path()` return path yang benar per platform

### Deliverable:
`cargo test` hijau. Config dapat dibuat, dibaca, dan ditulis ke disk.

---

## Phase 3 — PTY & Shell Engine (Rust)

**Tujuan:** Backend dapat spawn shell process dengan PTY, inherit environment, dan melakukan I/O secara realtime.

### Tasks:
- [ ] Buat `src-tauri/src/terminal/session.rs` — implementasi penuh:
  - [ ] Extend `PtySession` dengan PTY handles:
    ```rust
    pub struct PtySession {
        pub id: Uuid,
        pub project_id: Uuid,
        pub name: String,
        pub shell: Shell,
        pub path: PathBuf,
        master: Box<dyn MasterPty + Send>,
        child: Box<dyn Child + Send + Sync>,
        writer: Mutex<Box<dyn Write + Send>>,
    }
    ```
  - [ ] `spawn_shell(id, project_id, name, shell, path)` → `Result<PtySession, SessionError>`
  - [ ] `write_to_shell(session, input)` → `Result<(), SessionError>`
  - [ ] `resize_pty(session, cols, rows)` → `Result<(), SessionError>`
  - [ ] `kill_session(session)` → `Result<(), SessionError>`
- [ ] Buat `src-tauri/src/terminal/manager.rs` — manage multiple sessions:
  ```rust
  pub struct SessionManager {
      sessions: HashMap<Uuid, PtySession>,
  }

  impl SessionManager {
      pub fn spawn(&mut self, ...) -> Result<Uuid, SessionError>
      pub fn write(&self, id: Uuid, input: &str) -> Result<()>
      pub fn resize(&self, id: Uuid, cols: u16, rows: u16) -> Result<()>
      pub fn kill(&mut self, id: Uuid) -> Result<()>
      pub fn kill_all(&mut self)
  }
  ```
- [ ] PTY reader berjalan di background thread (tokio task) — output dikirim via channel, bukan blocking read
- [ ] Handle Windows ConPTY vs Linux PTY secara transparan
- [ ] Custom error type `SessionError` menggunakan `thiserror`
- [ ] Tulis integration tests:
  - [ ] Spawn shell → write `echo hello\n` → terima `hello` di output
  - [ ] Spawn dengan path tertentu → verifikasi `pwd` sesuai

### Deliverable:
Shell dapat di-spawn, menerima input, menghasilkan output via channel. `cargo test` hijau.

---

## Phase 4 — Git Detector & File System (Rust)

**Tujuan:** Backend dapat mendeteksi status git sebuah folder dan memvalidasi keberadaan folder.

### Tasks:
- [ ] Implementasi `src-tauri/src/git/detector.rs`:
  - [ ] `detect_git(path: &Path)` → `GitStatus`
  - [ ] Logic: cek `path/.git` exist sebagai directory
  - [ ] Tidak ada recursive ke parent — cek di path yang diberikan saja
- [ ] Implementasi folder validation:
  - [ ] `validate_path(path: &Path)` → `PathStatus`
  - [ ] Enum `PathStatus { Ok, NotFound, PermissionDenied }`
- [ ] Implementasi naming conflict detection:
  - [ ] `resolve_display_name(projects: &[ProjectState], project: &ProjectState)` → `DisplayName`
  - [ ] Struct `DisplayName { label: String, sublabel: Option<String> }`
  - [ ] Nama unik → `sublabel: None`
  - [ ] Nama duplikat → sublabel berisi path singkat
- [ ] Tulis unit tests:
  - [ ] Folder dengan `.git` → `GitStatus::Initialized`
  - [ ] Folder tanpa `.git` → `GitStatus::NotInitialized`
  - [ ] Path tidak ada → `PathStatus::NotFound`
  - [ ] Dua project nama sama → keduanya punya sublabel berbeda

### Deliverable:
Git detection akurat, path validation berjalan di Windows dan Linux. `cargo test` hijau.

---

## Phase 5 — Tauri Commands & Events Bridge

**Tujuan:** Mendefinisikan dan mengimplementasikan semua Tauri commands dan events sebagai jembatan antara Rust backend dan React frontend.

### Tasks:

#### Tauri Commands (Frontend → Backend):
- [ ] `get_config()` → `Result<Config>`
- [ ] `save_config(config: Config)` → `Result<()>`
- [ ] `is_first_run()` → `bool`
- [ ] `spawn_shell(project_id, shell, path)` → `Result<Uuid>` (return session id)
- [ ] `write_to_shell(session_id, input)` → `Result<()>`
- [ ] `resize_pty(session_id, cols, rows)` → `Result<()>`
- [ ] `kill_session(session_id)` → `Result<()>`
- [ ] `detect_git(path)` → `Result<GitStatus>`
- [ ] `validate_path(path)` → `Result<PathStatus>`
- [ ] `open_folder_dialog()` → `Result<Option<String>>` (path yang dipilih user)
- [ ] `check_update()` → `Result<Option<String>>` (versi baru jika ada)

#### Tauri Events (Backend → Frontend):
- [ ] `pty-output` — payload: `{ session_id: string, data: string }`
- [ ] `session-exit` — payload: `{ session_id: string, project_id: string }`
- [ ] `update-available` — payload: `{ version: string }`

#### Setup:
- [ ] Register semua commands di `src-tauri/src/lib.rs`
- [ ] Setup `SessionManager` sebagai Tauri managed state (`tauri::Manager`)
- [ ] Background task untuk stream PTY output ke frontend via event `pty-output`
- [ ] Tulis integration test untuk setiap command

### Deliverable:
Semua commands bisa dipanggil dari frontend (verifikasi via `cargo tauri dev` + browser console). Events ter-emit dari backend dan bisa di-listen di frontend.

---

## Phase 6 — Frontend Foundation (React)

**Tujuan:** Setup React 18 app dengan Zustand stores, Tauri hooks, dan layout dasar yang siap diisi komponen.

### Tasks:

#### Zustand Stores:
- [ ] Buat `src/store/projectStore.ts`:
  ```typescript
  interface ProjectStore {
    projects: ProjectState[]
    activeProjectId: string | null
    setProjects: (projects: ProjectState[]) => void
    addProject: (project: ProjectState) => void
    removeProject: (id: string) => void
    setActiveProject: (id: string) => void
  }
  ```
- [ ] Buat `src/store/terminalStore.ts`:
  ```typescript
  interface TerminalStore {
    sessions: Record<string, PtySession>
    activeSessionId: Record<string, string> // projectId → sessionId
    addSession: (session: PtySession) => void
    removeSession: (id: string) => void
    setActiveSession: (projectId: string, sessionId: string) => void
  }
  ```

#### Tauri Hooks:
- [ ] Buat `src/hooks/useTauri.ts` — wrapper untuk semua `invoke()` calls
- [ ] Buat `src/hooks/useTerminal.ts` — hook untuk PTY interaction + listen event `pty-output`

#### Layout Dasar:
- [ ] Buat `src/App.tsx` — layout utama:
  ```
  ┌──────────────┬─────────────────────┐
  │   Sidebar    │   Terminal Area     │
  │   (240px)    │   (flex-1)          │
  └──────────────┴─────────────────────┘
  ```
- [ ] Pastikan Tailwind v4 dark theme berfungsi via `globals.css`:
  ```css
  @import "tailwindcss";

  :root {
    color-scheme: dark;
  }

  body {
    @apply bg-neutral-900 text-neutral-100;
  }
  ```
- [ ] Setup font JetBrains Mono — bundle lokal atau via CSS import
- [ ] Setup TypeScript types di `src/types/index.ts` yang match dengan Rust structs

### Deliverable:
App render layout dua kolom dengan Tailwind v4. Zustand stores terinisialisasi. Tauri hooks bisa dipanggil tanpa error. Dark theme aktif.

---

## Phase 7 — Sidebar Component

**Tujuan:** Sidebar fungsional dengan daftar project, git badge, drag & drop, dan right-click context menu.

### Tasks:
- [ ] Buat `src/components/Sidebar/Sidebar.tsx`:
  - [ ] Load projects dari config via `invoke('get_config')`
  - [ ] Render daftar `ProjectItem`
  - [ ] Scrollable jika overflow
  - [ ] Tombol `+ New Project` di bawah sidebar → `invoke('open_folder_dialog')`
- [ ] Buat `src/components/Sidebar/ProjectItem.tsx`:
  - [ ] Nama project di kiri
  - [ ] Badge 🟢/🔴 di kanan sesuai git status
  - [ ] Highlight jika project aktif
  - [ ] Sub-label path singkat saat hover jika naming conflict
  - [ ] Double-click → rename inline
  - [ ] Drag & drop untuk reorder
- [ ] Buat `src/components/Sidebar/ContextMenu.tsx`:
  - [ ] Muncul saat right-click pada `ProjectItem`
  - [ ] Menu items: Rename, Add Group, Delete
  - [ ] Keyboard shortcut hint di setiap item
  - [ ] Auto-close saat klik di luar atau tekan Escape
- [ ] Git status: panggil `invoke('detect_git', { path })` saat project dibuka
- [ ] Tulis unit tests untuk logic naming conflict di frontend

### Deliverable:
Sidebar menampilkan daftar project. Git badge muncul. Right-click context menu fungsional. Drag & drop reorder berjalan.

---

## Phase 8 — Terminal Area & xterm.js

**Tujuan:** Area terminal fungsional dengan xterm.js, tab bar per project, dan PTY output realtime.

### Tasks:

#### Terminal Area:
- [ ] Buat `src/components/Terminal/TerminalArea.tsx`:
  - [ ] Tab bar di atas dengan daftar terminal tab
  - [ ] Tombol `+` di tab bar → buka terminal baru (`invoke('spawn_shell', ...)`)
  - [ ] Render `TerminalPane` sesuai tab aktif

#### Terminal Tab:
- [ ] Buat `src/components/Terminal/TerminalTab.tsx`:
  - [ ] Label nama tab
  - [ ] Tombol close (×)
  - [ ] Double-click → rename inline
  - [ ] Drag & drop untuk reorder tab
  - [ ] Highlight jika tab aktif

#### Terminal Pane (xterm.js):
- [ ] Buat `src/components/Terminal/TerminalPane.tsx`:
  - [ ] Inisialisasi `xterm.Terminal` dengan konfigurasi:
    ```typescript
    const terminal = new Terminal({
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: config.font_size,
      scrollback: config.scrollback_lines,
      theme: { background: '#1a1a1a', ... }
    })
    ```
  - [ ] Attach `FitAddon` untuk auto-resize
  - [ ] Listen event `pty-output` → `terminal.write(data)`
  - [ ] Input dari xterm.js → `invoke('write_to_shell', { sessionId, input })`
  - [ ] Handle resize → `invoke('resize_pty', { sessionId, cols, rows })`
  - [ ] Cleanup: kill session saat komponen unmount

### Deliverable:
Buka project → klik `+` → terminal spawn → bisa ketik command → output muncul realtime di xterm.js. Pindah tab → terminal yang benar muncul.

---

## Phase 9 — Custom Titlebar & Frameless Window

**Tujuan:** Window frameless dengan custom titlebar yang bisa drag dan punya window controls.

### Tasks:
- [ ] Pastikan `tauri.conf.json` sudah set `decorations: false`
- [ ] Buat `src/components/Titlebar/Titlebar.tsx`:
  - [ ] Area drag (data-tauri-drag-region)
  - [ ] Label nama app "Termitur" di tengah atau kiri
  - [ ] Window controls di kanan: minimize, maximize, close
  - [ ] Styling yang clean, tidak mencolok
- [ ] Integrasikan Titlebar di `App.tsx` sebagai fixed bar paling atas
- [ ] Handle double-click titlebar → maximize/restore
- [ ] Pastikan window controls memanggil Tauri window API yang benar:
  ```typescript
  import { getCurrentWindow } from '@tauri-apps/api/window'
  const win = getCurrentWindow()
  win.minimize() / win.maximize() / win.close()
  ```

### Deliverable:
Window bisa di-drag via titlebar. Window controls berfungsi. Tampilan bersih dan tidak mengganggu.

---

## Phase 10 — Onboarding Modal & Settings

**Tujuan:** Modal onboarding muncul saat first run, dan settings bisa diakses untuk ubah konfigurasi dasar.

### Tasks:

#### Onboarding Modal:
- [ ] Buat `src/components/Onboarding/OnboardingModal.tsx`:
  - [ ] Cek `invoke('is_first_run')` saat app load
  - [ ] Jika true → tampilkan modal
  - [ ] Konten: welcome text + pilihan default shell
  - [ ] Tombol `Get Started` → `invoke('save_config', { config })` → tutup modal
  - [ ] Modal tidak bisa di-dismiss tanpa memilih shell (tidak ada tombol close)
- [ ] Setelah onboarding → load projects (kosong) dan masuk app utama

#### Settings:
- [ ] Buat settings panel/modal (accessible via icon atau keybinding)
- [ ] Field yang tersedia:
  - [ ] Default shell (dropdown)
  - [ ] Font size (number input, min 10, max 24)
  - [ ] Scrollback lines (number input)
- [ ] Perubahan settings → `invoke('save_config', ...)` → apply ke terminal aktif

### Deliverable:
First run → onboarding modal muncul → pilih shell → masuk app. Settings bisa dibuka dan perubahan tersimpan.

---

## Phase 11 — Keybinding & Context Menu

**Tujuan:** Semua keybinding berfungsi dan dapat di-customize via config.

### Tasks:
- [ ] Buat `src/hooks/useKeybinding.ts`:
  - [ ] Load keybinding map dari config
  - [ ] Listen `keydown` event global
  - [ ] Map key combo → action function
- [ ] Implementasi semua keybinding:
  - [ ] `Ctrl+N` → buka terminal baru dalam project aktif
  - [ ] `Ctrl+Shift+N` → buka folder dialog → tambah project baru
  - [ ] `Ctrl+W` → tutup terminal tab aktif
  - [ ] `Ctrl+Tab` → pindah terminal tab (maju)
  - [ ] `Ctrl+Shift+Tab` → pindah terminal tab (mundur)
  - [ ] `Ctrl+E` → exit app (`win.close()`)
  - [ ] `Ctrl+R` → rename terminal tab aktif
  - [ ] `Ctrl+G` → add project ke group
  - [ ] `Ctrl+Shift+C` → copy selection ke clipboard
- [ ] Handle konflik keybinding dengan xterm.js (xterm intercept beberapa key)
- [ ] Pastikan keybinding tidak aktif saat user sedang rename (input focused)

### Deliverable:
Semua keybinding berfungsi. Tidak ada konflik dengan xterm.js input.

---

## Phase 12 — Error Handling & Logging

**Tujuan:** Semua skenario error tertangani dengan UI yang informatif, logging berjalan di backend.

### Tasks:

#### Logging (Rust):
- [ ] Setup `tracing` + `tracing-appender` di `src-tauri/src/logging.rs`
- [ ] Log path auto-detect sesuai platform
- [ ] Log rotation: harian atau per 10MB
- [ ] Default level: ERROR + WARN
- [ ] Tambahkan log di semua titik kritis

#### Error Handling UI (React):
- [ ] Skenario 1 — Folder tidak ditemukan:
  - [ ] Listen event `session-exit` atau validate saat startup
  - [ ] Badge 🔴 di ProjectItem sidebar
  - [ ] Overlay di TerminalPane:
    ```
    ⚠ Folder tidak ditemukan
    [Relocate Folder]  [Close Project]
    ```
  - [ ] `Relocate Folder` → `invoke('open_folder_dialog')` → update project path
- [ ] Skenario 2 — Shell crash:
  - [ ] Listen event `session-exit`
  - [ ] Overlay di TerminalPane:
    ```
    ⚠ Shell process terminated unexpectedly
    [Restart Shell]  [Close Tab]
    ```
- [ ] Skenario 3 — Permission denied:
  - [ ] Badge 🔴 di ProjectItem sidebar
  - [ ] Overlay di TerminalPane:
    ```
    ⚠ Permission denied
    [Close Project]
    ```

### Deliverable:
Semua skenario error menampilkan UI yang informatif dan actionable. Log tersimpan di disk.

---

## Phase 13 — Persistence

**Tujuan:** State project dan terminal tab tersimpan saat app ditutup dan ter-restore saat dibuka kembali.

### Tasks:
- [ ] Saat app close → `invoke('save_config', { config })` dengan state terkini:
  - [ ] Daftar project (path, nama, group)
  - [ ] Urutan project
  - [ ] Project aktif terakhir
  - [ ] Jumlah terminal tab per project + nama tab
  - [ ] Terminal tab aktif per project
- [ ] Saat app buka → load config → restore state:
  - [ ] Baca projects dari config
  - [ ] Validasi setiap path via `invoke('validate_path')`
  - [ ] Path invalid → tampilkan error state (Phase 12)
  - [ ] Spawn shell untuk terminal tab yang ter-restore
  - [ ] Set active project dan terminal tab sesuai yang tersimpan
- [ ] Handle config korup → fallback ke default, log warning
- [ ] Tulis test untuk serialisasi/deserialisasi ProjectState lengkap

### Deliverable:
Tutup Termitur → buka lagi → semua project dan terminal tab ter-restore. Shell baru di-spawn di path yang benar.

---

## Phase 14 — Update Checker

**Tujuan:** Termitur mengecek versi terbaru dari GitHub Releases saat startup dan menampilkan notifikasi.

### Tasks:
- [ ] Tambah HTTP client di Rust (`ureq` atau `reqwest` minimal features)
- [ ] Implementasi `check_update()` command di Rust:
  - [ ] Hit `https://api.github.com/repos/[user]/termitur/releases/latest`
  - [ ] Parse `tag_name` dari JSON response
  - [ ] Compare dengan `CARGO_PKG_VERSION`
  - [ ] Timeout 3 detik — silent fail jika tidak ada koneksi
  - [ ] Return `Option<String>` (versi baru jika ada)
- [ ] Panggil `check_update()` saat app startup secara async
- [ ] Jika ada update, emit event `update-available` ke frontend
- [ ] Buat komponen notifikasi toast di React:
  ```
  New version available: v2.1.0
  Download at github.com/[user]/termitur/releases  [×]
  ```
- [ ] Toast bisa di-dismiss

### Deliverable:
Jika ada versi baru, toast notifikasi muncul. Jika tidak ada koneksi, app tetap berjalan normal.

---

## Phase 15 — Polish & Distribution

**Tujuan:** Termitur siap dirilis — binary bersih, CI/CD berjalan, dokumentasi lengkap.

### Tasks:

#### Polish:
- [ ] Review semua UI — konsistensi warna, spacing, typography
- [ ] Review semua error message — informatif dan konsisten
- [ ] Review semua keybinding — tidak ada konflik tersembunyi
- [ ] Performance check:
  - [ ] Startup time < 1 detik
  - [ ] Memory usage idle < 80MB
  - [ ] PTY output tidak lag saat output deras (misal `cat large_file`)
- [ ] Test di Windows 10/11 dan Ubuntu/Debian
- [ ] Fix semua `cargo clippy -- -D warnings`
- [ ] Fix semua TypeScript strict errors

#### CI/CD (GitHub Actions):
- [ ] Workflow `test.yml` — `cargo test` di setiap push/PR
- [ ] Workflow `clippy.yml` — `cargo clippy -- -D warnings` di setiap push/PR
- [ ] Workflow `typecheck.yml` — `tsc --noEmit` di setiap push/PR
- [ ] Workflow `release.yml` — trigger saat push tag `v*`:
  ```yaml
  - cargo tauri build --target x86_64-pc-windows-msvc
  - cargo tauri build --target x86_64-unknown-linux-gnu
  - Upload installer ke GitHub Releases
  - Generate checksums.txt
  ```

#### Dokumentasi:
- [ ] Update `README.md`:
  - [ ] Screenshot app
  - [ ] Installation (download installer)
  - [ ] Usage (cara pakai, keybinding cheatsheet)
  - [ ] Building from source
- [ ] Buat `CHANGELOG.md` untuk v2.0.0
- [ ] Buat `CONTRIBUTING.md`

#### Release:
- [ ] Tag `v2.0.0` di Git
- [ ] Push tag → GitHub Actions build otomatis
- [ ] Verifikasi installer Windows dan Linux berjalan dengan benar
- [ ] Publish GitHub Release dengan release notes

### Deliverable:
Installer `Termitur_2.0.0_windows_x64.exe` dan `Termitur_2.0.0_linux_x86_64.AppImage` tersedia di GitHub Releases dan siap didownload.

---

## Dependency Map

```
Phase 0 (Project Setup)
    └── Phase 1 (Core Data Layer)
            ├── Phase 2 (Config System)
            │       └── Phase 5 (Tauri Bridge)
            ├── Phase 3 (PTY Engine)
            │       └── Phase 5 (Tauri Bridge)
            └── Phase 4 (Git Detector)
                    └── Phase 5 (Tauri Bridge)
                            └── Phase 6 (Frontend Foundation)
                                    ├── Phase 7 (Sidebar)
                                    ├── Phase 8 (Terminal Area)
                                    │       └── Phase 9 (Titlebar)
                                    │               └── Phase 10 (Onboarding & Settings)
                                    │                       └── Phase 11 (Keybinding)
                                    │                               ├── Phase 12 (Error Handling)
                                    │                               ├── Phase 13 (Persistence)
                                    │                               └── Phase 14 (Update Checker)
                                    │                                       └── Phase 15 (Polish & Release)
```

---

## Definition of Done (per Phase)

Sebuah phase dianggap **selesai** jika:

- [ ] Semua tasks ter-checklist
- [ ] `cargo build` sukses tanpa error
- [ ] `cargo test` hijau (semua test pass)
- [ ] `cargo clippy -- -D warnings` bersih
- [ ] `tsc --noEmit` bersih (untuk phase yang menyentuh frontend)
- [ ] Deliverable phase bisa didemonstrasikan

---

*Dokumen ini adalah living document untuk Termitur v2.0.0 (Tauri Edition) — React 18, Tailwind CSS v4, Tauri v2. Update status setiap phase seiring development berlangsung.*
