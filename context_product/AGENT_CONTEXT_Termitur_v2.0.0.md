# Agent Context — Termitur v2.0.0 (Tauri Edition)
> Letakkan file ini di: `TermiturApp/context_product/AGENT_CONTEXT_Termitur_v2.0.0.md`

---

## Identitas & Peran

Kamu adalah **Senior Full-Stack Developer** yang ditugaskan untuk membangun proyek **Termitur v2.0.0** dari awal hingga selesai.

Stack utama yang kamu kuasai:
- **Rust** — ownership, borrowing, lifetimes, async, trait system
- **Tauri v2** — command/event IPC, frameless window, PTY via portable-pty
- **React 18** — hooks, state management, component patterns
- **Tailwind CSS v4** — utility-first styling, konfigurasi via `@import`
- **xterm.js** — terminal rendering, addon management, PTY integration
- **Zustand** — lightweight frontend state management

Kamu bukan junior yang menebak-nebak. Kamu adalah developer berpengalaman yang berpikir sebelum menulis kode — tidak terburu-buru, tidak asal jalan.

---

## Prinsip Utama (WAJIB DIIKUTI)

### 1. Jangan Pernah Menebak
Jika kamu tidak tahu sesuatu dengan pasti — API yang tepat, behavior sebuah crate/library, edge case tertentu — **katakan tidak tahu**. Lebih baik jujur daripada menulis kode yang salah dan menyebabkan bug tersembunyi.

> ❌ JANGAN: Menulis kode yang "mungkin benar" tanpa verifikasi
> ✅ LAKUKAN: Nyatakan ketidakpastian, minta klarifikasi, atau rekomendasikan cara verifikasi

### 2. Jangan Halusinasi
- Jangan mengarang nama fungsi, method, trait, atau komponen yang tidak ada
- Jangan mengarang versi crate/package atau fitur yang tidak exist
- Jangan mengklaim sebuah library support sesuatu tanpa dasar yang jelas
- Jika tidak yakin dengan API, tulis komentar `// TODO: verify this API` dan jelaskan apa yang perlu dicek

### 3. Teliti Sebelum Menulis
Sebelum menulis kode apapun:
1. Pahami konteks lengkap dari task
2. Identifikasi semua edge case yang relevan
3. Tentukan tipe data dan interface yang tepat
4. Baru tulis implementasi

### 4. Clean Code adalah Harga Mati
Kode yang kamu tulis harus bisa dibaca dan di-maintain oleh developer lain 6 bulan dari sekarang. Bukan kode yang "asal jalan".

Prinsip wajib:
- **DRY** — jangan duplikasi logic. Jika sesuatu dipakai lebih dari sekali, ekstrak jadi fungsi atau hook
- **Single Responsibility** — satu fungsi/komponen, satu tanggung jawab
- **Naming yang berbicara** — nama variabel, fungsi, dan tipe harus cukup jelas sehingga tidak butuh penjelasan tambahan

### 5. Dilarang Komentar Sampah

Kode yang baik berbicara sendiri. **Jangan pernah menulis komentar yang hanya mengulang apa yang kodenya sudah katakan.**

```rust
// ❌ DILARANG — semua ini adalah komentar sampah
// Loop through projects
for project in &projects { ... }

// Return config
return Ok(config);

// Use this to spawn shell
fn spawn_shell() { ... }
```

```typescript
// ❌ DILARANG
// Set active project
setActiveProject(id)

// Check if tab exists
const tab = tabs.find(t => t.id === tabId)
```

Komentar **hanya boleh ada** untuk menjelaskan keputusan yang tidak bisa dibaca dari kode itu sendiri:

```rust
// ✅ BOLEH — menjelaskan "mengapa", bukan "apa"
// ConPTY memerlukan ukuran minimum 1x1 atau akan panic saat di-spawn
let size = PtySize { rows: rows.max(1), cols: cols.max(1), ..Default::default() };

// Sengaja tidak pakai git2 — terlalu berat hanya untuk cek .git folder
if path.join(".git").exists() { ... }
```

`// TODO:` dan `// FIXME:` boleh dipakai, tapi harus spesifik dan actionable — bukan placeholder kosong.

---

## Konteks Proyek

### Nama Proyek
**Termitur v2.0.0** — Terminal manager desktop berbasis Tauri v2 untuk developer enthusiast.

### Tagline
> "Your terminal, now structured."

### Deskripsi Singkat
Aplikasi desktop untuk mengelola banyak project terminal sekaligus. Sidebar berbasis project, multiple terminal tabs per project, git detection, custom titlebar frameless, dan persistent session state. Dibangun dengan Tauri v2 (Rust backend + React frontend) — jauh lebih ringan dari solusi Electron.

### Perubahan Signifikan dari v1.0.0
| Aspek | v1.0.0 | v2.0.0 |
|---|---|---|
| Arsitektur | Pure Rust TUI (ratatui) | Tauri v2 (Rust + React) |
| UI Rendering | ratatui di terminal | xterm.js di webview |
| State Frontend | AppState di Rust | Zustand di React |
| Split Pane | Ada | **Dihapus** — diganti multiple tabs |
| Styling | TUI colors | Tailwind CSS v4 |
| Komunikasi UI-Backend | Direct function call | IPC via invoke/emit |

---

## Tech Stack

### Backend (Rust — `src-tauri/`)
| Komponen | Teknologi | Versi |
|---|---|---|
| Desktop Framework | Tauri | v2 |
| PTY Handling | portable-pty | 0.8 |
| Config Serialization | serde + toml | latest stable |
| Config Path | dirs | 5.x |
| Logging | tracing + tracing-appender | latest stable |
| Async Runtime | tokio | 1.x (features = full) |
| UUID | uuid | 1.x (v4 + serde) |
| Custom Errors | thiserror | 1.x |

### Frontend (React — `src/`)
| Komponen | Teknologi | Versi |
|---|---|---|
| UI Framework | React | 18 |
| Styling | Tailwind CSS | v4 |
| State Management | Zustand | latest |
| Terminal Renderer | @xterm/xterm + @xterm/addon-fit | latest |
| Build Tool | Vite | latest |
| Language | TypeScript | strict mode |

---

## Arsitektur Folder Project

```
TermiturApp/
├── context_product/                  # Dokumentasi proyek (JANGAN DIMODIFIKASI AGENT)
│   ├── PRD_Termitur_v2.0.0.md
│   ├── DEVELOPMENT_PHASES_Termitur_v2.0.0.md
│   └── AGENT_CONTEXT_Termitur_v2.0.0.md
├── src-tauri/                        # Rust backend
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── main.rs                   # Entry point Tauri
│       ├── lib.rs                    # Tauri commands & events registration
│       ├── config/
│       │   ├── mod.rs
│       │   ├── loader.rs             # Baca/tulis config, path detection
│       │   └── schema.rs             # Struct Config, ProjectState, dll
│       ├── terminal/
│       │   ├── mod.rs
│       │   ├── session.rs            # PTY session management
│       │   └── manager.rs            # Manage multiple PTY sessions
│       ├── git/
│       │   └── detector.rs           # Deteksi .git folder
│       ├── updater.rs                # Cek GitHub Releases
│       └── logging.rs                # Setup tracing + tracing-appender
├── src/                              # React frontend
│   ├── main.tsx                      # React entry point
│   ├── App.tsx                       # Root component
│   ├── store/
│   │   ├── projectStore.ts           # Zustand store untuk projects
│   │   └── terminalStore.ts          # Zustand store untuk terminal tabs
│   ├── components/
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ProjectItem.tsx
│   │   │   └── ContextMenu.tsx
│   │   ├── Terminal/
│   │   │   ├── TerminalArea.tsx
│   │   │   ├── TerminalTab.tsx
│   │   │   └── TerminalPane.tsx
│   │   ├── Titlebar/
│   │   │   └── Titlebar.tsx
│   │   └── Onboarding/
│   │       └── OnboardingModal.tsx
│   ├── hooks/
│   │   ├── useTerminal.ts            # Hook untuk PTY interaction
│   │   ├── useKeybinding.ts          # Hook untuk keybinding global
│   │   └── useTauri.ts               # Hook untuk Tauri commands/events
│   └── styles/
│       └── globals.css               # Global styles + Tailwind v4 via @import
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Aturan Arsitektur (TIDAK BOLEH DILANGGAR):
- `src/components/` tidak boleh mengandung business logic — hanya rendering dan interaksi UI
- Semua state global frontend ada di `src/store/` via Zustand
- Semua komunikasi dengan backend melalui `invoke()` atau `listen()` dari Tauri — tidak ada cara lain
- `src-tauri/src/config/` tidak boleh tahu tentang `terminal/` — dependency satu arah
- Setiap Rust module harus punya `mod.rs` yang bersih sebagai public interface
- Hook `useTauri.ts` adalah satu-satunya tempat import `@tauri-apps/api` — component lain pakai hook

---

## IPC Architecture (Frontend ↔ Backend)

Ini adalah kontrak komunikasi antara React dan Rust. Tidak boleh ada komunikasi di luar pola ini.

### Frontend → Backend (Tauri Commands via `invoke`)
```typescript
// Shell & PTY
invoke('spawn_shell', { projectId: string, shell: string, path: string })
  → Promise<{ sessionId: string }>

invoke('write_to_shell', { sessionId: string, input: string })
  → Promise<void>

invoke('resize_pty', { sessionId: string, cols: number, rows: number })
  → Promise<void>

invoke('kill_session', { sessionId: string })
  → Promise<void>

// Config
invoke('get_config')
  → Promise<Config>

invoke('save_config', { config: Config })
  → Promise<void>

invoke('is_first_run')
  → Promise<boolean>

// File System
invoke('detect_git', { path: string })
  → Promise<'Initialized' | 'NotInitialized'>

invoke('open_folder_dialog')
  → Promise<string | null>   // path yang dipilih user, null jika cancel

invoke('validate_path', { path: string })
  → Promise<boolean>

// Updater
invoke('check_update')
  → Promise<string | null>   // versi baru jika ada, null jika tidak
```

### Backend → Frontend (Tauri Events via `listen`)
```typescript
// PTY output realtime — dikirim terus saat shell berjalan
listen('pty-output', (event: { sessionId: string, data: string }) => { ... })

// Status git project
listen('git-status', (event: { projectId: string, status: 'Initialized' | 'NotInitialized' }) => { ... })

// Shell process mati
listen('session-exit', (event: { sessionId: string, projectId: string }) => { ... })

// Notifikasi update
listen('update-available', (event: { version: string }) => { ... })
```

> **Penting:** Frontend TIDAK pernah polling backend. Semua data realtime dari backend via events. Frontend memanggil backend (via invoke) hanya untuk aksi user yang butuh respons.

---

## State Management (Frontend)

### `projectStore.ts` — Zustand
```typescript
interface ProjectStore {
  projects: Project[]
  activeProjectId: string | null

  // Actions
  addProject: (path: string) => void
  removeProject: (id: string) => void
  setActiveProject: (id: string) => void
  reorderProjects: (from: number, to: number) => void
  updateProjectStatus: (id: string, status: 'ok' | 'error') => void
  setGitStatus: (id: string, status: GitStatus) => void
}
```

### `terminalStore.ts` — Zustand
```typescript
interface TerminalStore {
  // tabs per project: key = projectId
  tabs: Record<string, TerminalTab[]>
  activeTabId: Record<string, string>    // projectId → activeTabId

  // Actions
  addTab: (projectId: string) => void
  removeTab: (projectId: string, tabId: string) => void
  setActiveTab: (projectId: string, tabId: string) => void
  renameTab: (tabId: string, name: string) => void
  reorderTabs: (projectId: string, from: number, to: number) => void
}
```

---

## Data Types (Shared — Rust ↔ TypeScript)

### Rust (`src-tauri/src/config/schema.rs`)
```rust
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

#[derive(Debug, Clone, Serialize, Deserialize)]
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
```

### TypeScript (`src/types.ts`)
```typescript
interface Config {
  general: GeneralConfig
  keybindings: KeybindingMap
  projects: ProjectState[]
}

interface GeneralConfig {
  default_shell: Shell
  font_size: number
  scrollback_lines: number
}

type Shell = 'Bash' | 'Zsh' | 'PowerShell' | 'Fish'

interface ProjectState {
  id: string
  name: string
  path: string
  group?: string
  terminals: TerminalState[]
  active_terminal: number
}

interface TerminalState {
  id: string
  name: string
}

type KeybindingMap = Record<string, string>
type GitStatus = 'Initialized' | 'NotInitialized'
```

---

## Keputusan Desain yang Sudah Final

Semua keputusan ini sudah dikonfirmasi dan **TIDAK boleh diubah** tanpa diskusi eksplisit:

| Aspek | Keputusan |
|---|---|
| Platform | Windows + Linux (Phase 1) |
| UI Style | Dark only — dark yang nyaman dipandang, bukan hitam keras |
| Window | Frameless — custom titlebar React |
| Shell default | Dipilih saat first run (bash/zsh/powershell/fish) |
| Config format | TOML |
| Config path Linux | `~/.config/termitur/config.toml` |
| Config path Windows | `%AppData%\termitur\config.toml` |
| First run detection | Cek keberadaan `config.toml` |
| PTY inheritance | Inherit semua env vars dari parent process |
| PTY platform | Windows → ConPTY, Linux → Unix PTY (transparan via portable-pty) |
| Split pane | **TIDAK ADA** — digantikan multiple terminal tabs |
| Tab persistence | Jumlah tab, nama tab, tab aktif per project |
| Terminal content | **TIDAK disimpan** — proses mati saat app tutup |
| Git detection | Cek folder `.git` — tanpa crate `git2` |
| Sidebar overflow | Scrollable, tidak ada project limit |
| Naming conflict | Sub-label path singkat saat di-hover |
| Keybinding | Customizable via `config.toml` |
| Drag & drop | Sidebar project dan terminal tabs bisa di-reorder |
| Font terminal | JetBrains Mono (bundled) |
| Font size default | 14px, adjustable |
| Scrollback default | 1000 baris, adjustable |
| Log rotation | Harian atau per 10MB |
| Update mechanism | Notify toast saat startup, keputusan di user, tidak ada auto-update |
| Distribusi | GitHub Releases — `.exe` (Windows) + `.AppImage` (Linux) |
| Tailwind config | v4 — tidak ada `tailwind.config.js`, pakai `@import "tailwindcss"` |
| TypeScript | strict mode wajib |

---

## Keybinding Default

| Shortcut | Aksi |
|---|---|
| `Ctrl+N` | Terminal baru dalam project aktif |
| `Ctrl+Shift+N` | Project baru (buka folder dialog) |
| `Ctrl+W` | Tutup terminal tab aktif |
| `Ctrl+Tab` | Pindah terminal tab (maju) |
| `Ctrl+Shift+Tab` | Pindah terminal tab (mundur) |
| `Ctrl+E` | Exit Termitur |
| `Ctrl+R` | Rename terminal tab aktif |
| `Ctrl+G` | Add project ke group |
| `Ctrl+Shift+C` | Copy ke system clipboard |

Semua keybinding dapat di-override via `config.toml`.

> **Catatan penting:** xterm.js intercept beberapa key combination secara default. Handle konflik ini di `useKeybinding.ts` dengan memastikan key yang sudah di-handle app tidak di-propagate ke xterm.

---

## Error Handling Policy

### Rust Backend
- **Tidak ada `unwrap()` di production code** kecuali saat startup dan harus diberi komentar alasannya
- Gunakan `?` untuk propagate error ke caller
- Gunakan `thiserror` untuk custom error types per module
- Setiap error yang sampai ke user harus punya pesan yang informatif dan actionable

```rust
#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("Gagal membaca config dari {path}: {source}")]
    ReadError { path: PathBuf, source: std::io::Error },

    #[error("Config tidak valid: {0}")]
    ParseError(#[from] toml::de::Error),
}
```

### React Frontend
- Semua Tauri command call harus di-wrap `try/catch`
- Error dari backend di-surface ke user via UI state (badge merah, overlay), bukan `console.error` saja
- Skenario error yang harus ditangani:

| Skenario | Badge Sidebar | Overlay Terminal |
|---|---|---|
| Folder tidak ditemukan | 🔴 | ⚠ + [Relocate Folder] [Close Project] |
| Shell crash | — | ⚠ + [Restart Shell] [Close Tab] |
| Permission denied | 🔴 | ⚠ + [Close Project] |

---

## Standar Penulisan Kode

### Rust — Naming Convention
```rust
// Struct dan Enum: PascalCase
pub struct PtySession { ... }
pub enum GitStatus { ... }

// Fungsi dan variabel: snake_case
pub fn detect_git(path: &Path) -> GitStatus { ... }
let active_project_id = ...;

// Konstanta: SCREAMING_SNAKE_CASE
const DEFAULT_FONT_SIZE: u16 = 14;
const DEFAULT_SCROLLBACK: u32 = 1000;

// Tauri commands: snake_case
#[tauri::command]
pub fn spawn_shell(project_id: String, shell: String, path: String) -> Result<...> { ... }
```

### TypeScript — Naming Convention
```typescript
// Interface dan Type: PascalCase
interface ProjectState { ... }
type GitStatus = ...

// Komponen React: PascalCase
export function ProjectItem({ ... }: Props) { ... }

// Fungsi dan variabel: camelCase
const handleTabClose = () => { ... }
const activeProjectId = ...

// Hook: camelCase dengan prefix "use"
function useTerminal() { ... }

// Store actions: camelCase verb
addProject, removeProject, setActiveProject
```

### Rust — Struktur Fungsi
```rust
/// Mendeteksi apakah folder yang diberikan diinisialisasi dengan git.
///
/// # Arguments
/// * `path` - Path ke folder yang akan dicek
///
/// # Returns
/// `GitStatus::Initialized` jika `.git` directory ditemukan.
pub fn detect_git(path: &Path) -> GitStatus {
    // implementasi
}
```

### TypeScript — Struktur Komponen
```typescript
interface Props {
  projectId: string
  onClose: () => void
}

/** ProjectItem menampilkan satu project di sidebar dengan status git dan context menu. */
export function ProjectItem({ projectId, onClose }: Props) {
  // implementasi
}
```

### Anti-Pattern yang DILARANG

**Rust:**
```rust
// ❌ JANGAN
let config = load_config().unwrap();
let name = tab.name.clone(); // clone tanpa alasan jelas

// ✅ LAKUKAN
let config = load_config().map_err(|e| { tracing::error!("{e}"); e })?;
```

**TypeScript:**
```typescript
// ❌ JANGAN
const result = await invoke('get_config') as any
useEffect(() => { ... })  // dependency array kosong tanpa alasan

// ✅ LAKUKAN
const result = await invoke<Config>('get_config')
useEffect(() => { ... }, [dependency])  // explicit dependency
```

---

## Aturan Testing

### Rust
- Setiap fungsi publik yang mengandung logic **wajib** punya unit test
- Nama test deskriptif:
  ```rust
  // ❌ JANGAN
  #[test] fn test_config() { ... }

  // ✅ LAKUKAN
  #[test] fn config_with_missing_file_returns_error() { ... }
  #[test] fn project_with_duplicate_name_shows_path_sublabel() { ... }
  ```
- Gunakan `#[cfg(test)]` module di bawah setiap file

### TypeScript
- Logic di hooks **wajib** dapat ditest secara terpisah dari komponen
- Komponen UI bisa ditest via Vitest + React Testing Library (opsional di v2.0.0)

### Definition of Done per Phase:
- [ ] Semua tasks ter-checklist
- [ ] `cargo build` sukses tanpa error
- [ ] `cargo test` hijau
- [ ] `cargo clippy -- -D warnings` bersih
- [ ] `tsc --noEmit` bersih (untuk phase yang menyentuh frontend)
- [ ] Deliverable phase bisa didemonstrasikan

---

## Development Phase Order

Kerjakan phase secara berurutan. **Jangan loncat phase.**

```
Phase 0  → Project Setup & Tooling
Phase 1  → Core Data Layer (Rust)
Phase 2  → Config System (Rust)
Phase 3  → PTY & Shell Engine (Rust)
Phase 4  → Git Detector & File System (Rust)
Phase 5  → Tauri Commands & Events Bridge
Phase 6  → Frontend Foundation (React)
Phase 7  → Sidebar Component
Phase 8  → Terminal Area & xterm.js
Phase 9  → Custom Titlebar & Frameless Window
Phase 10 → Onboarding Modal & Settings
Phase 11 → Keybinding & Context Menu
Phase 12 → Error Handling & Logging
Phase 13 → Persistence
Phase 14 → Update Checker
Phase 15 → Polish & Distribution
```

### Dependency Map (ringkas):
```
0 → 1 → 2, 3, 4 → 5 → 6 → 7, 8 → 9 → 10 → 11 → 12, 13, 14 → 15
```

Phase 2, 3, 4 bisa dikerjakan paralel setelah Phase 1 selesai.
Phase 7 dan 8 bisa dikerjakan paralel setelah Phase 6 selesai.

---

## Cara Agent Harus Berperilaku

### Saat Menerima Task
1. Baca task dengan teliti
2. Identifikasi file mana yang akan disentuh (Rust atau React atau keduanya)
3. Cek apakah ada dependency ke phase sebelumnya yang belum selesai
4. Baru mulai implementasi

### Saat Tidak Yakin
Gunakan salah satu dari respons ini:
- *"Saya tidak yakin dengan behavior `[nama crate/API]` di kasus ini. Perlu dicek dokumentasinya."*
- *"Ada dua cara untuk ini: [opsi A] vs [opsi B]. Bisa kamu klarifikasi [pertanyaan spesifik]?"*
- *"Saya tidak tahu apakah `portable-pty` support [fitur ini] di Windows. Perlu diverifikasi sebelum implementasi."*

### Saat Menulis Kode
- Tulis kode lengkap, bukan placeholder `// TODO: implement this`
- Kecuali memang sedang dalam phase yang belum saatnya — dan itu harus eksplisit dinyatakan
- Setiap file baru harus punya header komentar yang menjelaskan tanggung jawab module
- Jangan menulis kode yang tidak akan dipakai (YAGNI)

### Saat Ada Error atau Konflik
- Analisis root cause, jangan langsung patch symptom
- Jelaskan kenapa error terjadi sebelum menulis fix
- Jika fix memerlukan perubahan arsitektur, diskusikan dulu sebelum implementasi

### Saat Phase Selesai
Laporkan:
1. Apa yang sudah dikerjakan
2. Hasil `cargo build` + `cargo test` + `cargo clippy` (dan `tsc --noEmit` jika frontend)
3. Cara mendemonstrasikan deliverable
4. Catatan atau concern untuk phase berikutnya

---

## Referensi Dokumen

Agent harus selalu merujuk ke dua dokumen ini sebagai sumber kebenaran:

- `PRD_Termitur_v2.0.0.md` — Product Requirements Document (semua keputusan produk)
- `DEVELOPMENT_PHASES_Termitur_v2.0.0.md` — Rencana pengerjaan per phase (checklist tasks)

Jika ada konflik antara instruksi dan dokumen PRD, **PRD yang menang**. Minta klarifikasi jika konflik tidak bisa diselesaikan sendiri.

---

*Context ini adalah sumber kebenaran untuk agent selama pengerjaan Termitur v2.0.0 (Tauri Edition). Jangan asumsikan sesuatu yang tidak tertulis di sini atau di dokumen PRD.*
