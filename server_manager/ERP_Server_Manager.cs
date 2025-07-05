using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using System.Configuration;
using System.Threading.Tasks;
using System.Timers;
using System.Runtime.InteropServices;

namespace ERPServerManager
{
    public partial class MainForm : Form
    {
        [DllImport("kernel32.dll")]
        static extern IntPtr OpenThread(int dwDesiredAccess, bool bInheritHandle, uint dwThreadId);

        [DllImport("kernel32.dll")]
        static extern uint SuspendThread(IntPtr hThread);

        [DllImport("kernel32.dll")]
        static extern int ResumeThread(IntPtr hThread);

        [DllImport("kernel32.dll")]
        static extern bool CloseHandle(IntPtr hObject);

        private const int THREAD_SUSPEND_RESUME = 0x0002;

        private Process? backendProcess;
        private Process? frontendProcess;
        private System.Timers.Timer? idleTimer;
        private DateTime lastActivity;
        private readonly string logPath;
        private readonly string configPath;
        private string? backendPath;
        private string? frontendPath;

        private Label? backendStatusLabel;
        private Label? frontendStatusLabel;
        private PictureBox? backendLight;
        private PictureBox? frontendLight;

        public MainForm()
        {
            InitializeComponent();
            
            // Pfade initialisieren
            configPath = Path.Combine(Application.StartupPath, "config.ini");
            logPath = Path.Combine(Application.StartupPath, "logs");
            Directory.CreateDirectory(logPath);

            // Konfiguration laden
            LoadConfig();

            // Timer für Inaktivitätsprüfung
            idleTimer = new System.Timers.Timer(60000); // 1 Minute
            idleTimer.Elapsed += IdleTimer_Elapsed;
            lastActivity = DateTime.Now;
            idleTimer.Start();

            // Event-Handler für Maus- und Tastaturereignisse
            this.MouseMove += MainForm_MouseMove;
            this.KeyPress += MainForm_KeyPress;
        }

        private void LoadConfig()
        {
            try
            {
                var config = File.ReadAllLines(configPath);
                foreach (var line in config)
                {
                    if (line.StartsWith("BackendPath="))
                        backendPath = line.Substring("BackendPath=".Length);
                    else if (line.StartsWith("FrontendPath="))
                        frontendPath = line.Substring("FrontendPath=".Length);
                }

                if (string.IsNullOrEmpty(backendPath) || string.IsNullOrEmpty(frontendPath))
                {
                    throw new Exception("Backend- oder Frontend-Pfad nicht gefunden in der Konfiguration.");
                }
            }
            catch (Exception ex)
            {
                WriteLog($"Fehler beim Laden der Konfiguration: {ex.Message}", "ERROR");
                MessageBox.Show("Fehler beim Laden der Konfiguration!", "Fehler", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void WriteLog(string message, string level = "INFO")
        {
            try
            {
                string logFile = Path.Combine(logPath, "server_manager.log");
                string timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                File.AppendAllText(logFile, $"[{timestamp}] [{level}] {message}{Environment.NewLine}");
            }
            catch { }
        }

        private void UpdateActivity()
        {
            lastActivity = DateTime.Now;
        }

        private void IdleTimer_Elapsed(object? sender, ElapsedEventArgs e)
        {
            var idleTime = DateTime.Now - lastActivity;
            
            if (idleTime.TotalMinutes >= 60 && (backendProcess != null || frontendProcess != null))
            {
                this.Invoke((MethodInvoker)delegate
                {
                    StopServers();
                    WriteLog("Server heruntergefahren nach 60 Minuten Inaktivität", "WARNING");
                });
            }
            else if (idleTime.TotalMinutes >= 30 && (backendProcess != null || frontendProcess != null))
            {
                this.Invoke((MethodInvoker)delegate
                {
                    PauseServers();
                    WriteLog("Server pausiert nach 30 Minuten Inaktivität", "INFO");
                });
            }
        }

        private void MainForm_MouseMove(object? sender, MouseEventArgs e)
        {
            UpdateActivity();
        }

        private void MainForm_KeyPress(object? sender, KeyPressEventArgs e)
        {
            UpdateActivity();
        }

        private void StartServers()
        {
            try
            {
                if (string.IsNullOrEmpty(backendPath) || string.IsNullOrEmpty(frontendPath))
                {
                    throw new Exception("Backend- oder Frontend-Pfad nicht konfiguriert.");
                }

                // Backend starten
                backendProcess = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "python",
                        Arguments = "-m uvicorn main:app --reload",
                        WorkingDirectory = backendPath,
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        CreateNoWindow = true
                    }
                };
                backendProcess.Start();
                WriteLog("Backend-Server gestartet");

                // Frontend starten
                frontendProcess = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "npm",
                        Arguments = "start",
                        WorkingDirectory = frontendPath,
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        CreateNoWindow = true
                    }
                };
                frontendProcess.Start();
                WriteLog("Frontend-Server gestartet");

                UpdateStatusDisplay();
            }
            catch (Exception ex)
            {
                WriteLog($"Fehler beim Starten der Server: {ex.Message}", "ERROR");
                MessageBox.Show($"Fehler beim Starten der Server: {ex.Message}", "Fehler", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void StopServers()
        {
            try
            {
                if (backendProcess != null && !backendProcess.HasExited)
                {
                    backendProcess.Kill();
                    backendProcess = null;
                    WriteLog("Backend-Server gestoppt");
                }

                if (frontendProcess != null && !frontendProcess.HasExited)
                {
                    frontendProcess.Kill();
                    frontendProcess = null;
                    WriteLog("Frontend-Server gestoppt");
                }

                UpdateStatusDisplay();
            }
            catch (Exception ex)
            {
                WriteLog($"Fehler beim Stoppen der Server: {ex.Message}", "ERROR");
            }
        }

        private void PauseServers()
        {
            try
            {
                if (backendProcess != null && !backendProcess.HasExited)
                {
                    foreach (ProcessThread thread in backendProcess.Threads)
                    {
                        IntPtr threadHandle = OpenThread(THREAD_SUSPEND_RESUME, false, (uint)thread.Id);
                        if (threadHandle != IntPtr.Zero)
                        {
                            SuspendThread(threadHandle);
                            CloseHandle(threadHandle);
                        }
                    }
                    WriteLog("Backend-Server pausiert");
                }

                if (frontendProcess != null && !frontendProcess.HasExited)
                {
                    foreach (ProcessThread thread in frontendProcess.Threads)
                    {
                        IntPtr threadHandle = OpenThread(THREAD_SUSPEND_RESUME, false, (uint)thread.Id);
                        if (threadHandle != IntPtr.Zero)
                        {
                            SuspendThread(threadHandle);
                            CloseHandle(threadHandle);
                        }
                    }
                    WriteLog("Frontend-Server pausiert");
                }

                UpdateStatusDisplay();
            }
            catch (Exception ex)
            {
                WriteLog($"Fehler beim Pausieren der Server: {ex.Message}", "ERROR");
            }
        }

        private void ResumeServers()
        {
            try
            {
                if (backendProcess != null && !backendProcess.HasExited)
                {
                    foreach (ProcessThread thread in backendProcess.Threads)
                    {
                        IntPtr threadHandle = OpenThread(THREAD_SUSPEND_RESUME, false, (uint)thread.Id);
                        if (threadHandle != IntPtr.Zero)
                        {
                            ResumeThread(threadHandle);
                            CloseHandle(threadHandle);
                        }
                    }
                    WriteLog("Backend-Server fortgesetzt");
                }

                if (frontendProcess != null && !frontendProcess.HasExited)
                {
                    foreach (ProcessThread thread in frontendProcess.Threads)
                    {
                        IntPtr threadHandle = OpenThread(THREAD_SUSPEND_RESUME, false, (uint)thread.Id);
                        if (threadHandle != IntPtr.Zero)
                        {
                            ResumeThread(threadHandle);
                            CloseHandle(threadHandle);
                        }
                    }
                    WriteLog("Frontend-Server fortgesetzt");
                }

                UpdateActivity();
                UpdateStatusDisplay();
            }
            catch (Exception ex)
            {
                WriteLog($"Fehler beim Fortsetzen der Server: {ex.Message}", "ERROR");
            }
        }

        private void UpdateStatusDisplay()
        {
            if (backendStatusLabel != null && frontendStatusLabel != null && 
                backendLight != null && frontendLight != null)
            {
                backendStatusLabel.Text = $"Backend-Status: {(backendProcess != null && !backendProcess.HasExited ? "Läuft" : "Gestoppt")}";
                frontendStatusLabel.Text = $"Frontend-Status: {(frontendProcess != null && !frontendProcess.HasExited ? "Läuft" : "Gestoppt")}";

                backendLight.BackColor = (backendProcess != null && !backendProcess.HasExited) ? Color.Green : Color.Red;
                frontendLight.BackColor = (frontendProcess != null && !frontendProcess.HasExited) ? Color.Green : Color.Red;
            }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            StopServers();
            if (idleTimer != null)
            {
                idleTimer.Stop();
            }
            base.OnFormClosing(e);
        }

        private void InitializeComponent()
        {
            this.Text = "ERP Server Manager";
            this.Size = new Size(400, 300);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;

            // Status-Labels
            backendStatusLabel = new Label
            {
                Location = new Point(20, 20),
                Size = new Size(360, 20),
                Text = "Backend-Status: Nicht gestartet"
            };
            this.Controls.Add(backendStatusLabel);

            frontendStatusLabel = new Label
            {
                Location = new Point(20, 50),
                Size = new Size(360, 20),
                Text = "Frontend-Status: Nicht gestartet"
            };
            this.Controls.Add(frontendStatusLabel);

            // Status-Ampel
            backendLight = new PictureBox
            {
                Location = new Point(340, 20),
                Size = new Size(20, 20),
                BackColor = Color.Red
            };
            this.Controls.Add(backendLight);

            frontendLight = new PictureBox
            {
                Location = new Point(340, 50),
                Size = new Size(20, 20),
                BackColor = Color.Red
            };
            this.Controls.Add(frontendLight);

            // Buttons
            var startButton = new Button
            {
                Location = new Point(20, 100),
                Size = new Size(100, 30),
                Text = "Starten"
            };
            startButton.Click += (s, e) => StartServers();
            this.Controls.Add(startButton);

            var stopButton = new Button
            {
                Location = new Point(140, 100),
                Size = new Size(100, 30),
                Text = "Stoppen"
            };
            stopButton.Click += (s, e) => StopServers();
            this.Controls.Add(stopButton);

            var pauseButton = new Button
            {
                Location = new Point(260, 100),
                Size = new Size(100, 30),
                Text = "Pausieren"
            };
            pauseButton.Click += (s, e) => PauseServers();
            this.Controls.Add(pauseButton);

            var resumeButton = new Button
            {
                Location = new Point(140, 140),
                Size = new Size(100, 30),
                Text = "Fortsetzen"
            };
            resumeButton.Click += (s, e) => ResumeServers();
            this.Controls.Add(resumeButton);

            // Log-Button
            var logButton = new Button
            {
                Location = new Point(20, 200),
                Size = new Size(340, 30),
                Text = "Log-Datei öffnen"
            };
            logButton.Click += (s, e) =>
            {
                try
                {
                    Process.Start("notepad.exe", Path.Combine(logPath, "server_manager.log"));
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Fehler beim Öffnen der Log-Datei: {ex.Message}", "Fehler", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            };
            this.Controls.Add(logButton);
        }

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }
    }
} 