#define MyAppName "ERP Server Manager"
#define MyAppVersion "1.0"
#define MyAppPublisher "AI-Driven ERP"
#define MyAppExeName "ERP_Server_Manager.exe"

[Setup]
AppId={{A1B2C3D4-E5F6-4A5B-8C7D-9E0F1A2B3C4D}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=output
OutputBaseFilename=ERP_Server_Manager_Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "german"; MessagesFile: "compiler:Languages\German.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "bin\Release\net10.0-windows\win-x64\publish\ERP_Server_Manager.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "bin\Release\net10.0-windows\win-x64\publish\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "README.txt"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
var
  WelcomePage: TInputQueryWizardPage;

procedure InitializeWizard;
begin
  WelcomePage := CreateInputQueryPage(wpWelcome,
    'Willkommen beim ERP Server Manager',
    'Dieser Assistent wird Sie durch die Installation des ERP Server Managers führen.',
    'Bitte geben Sie die Pfade zu Ihren Backend- und Frontend-Verzeichnissen ein:');

  WelcomePage.Add('Backend-Pfad:', False);
  WelcomePage.Add('Frontend-Pfad:', False);
  
  // Standardwerte setzen
  WelcomePage.Values[0] := ExpandConstant('{commonpf}\AI_driven_ERP\backend');
  WelcomePage.Values[1] := ExpandConstant('{commonpf}\AI_driven_ERP\frontend');
end;

function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;
  
  if CurPageID = WelcomePage.ID then
  begin
    // Überprüfen Sie, ob die Pfade existieren
    if not DirExists(WelcomePage.Values[0]) then
    begin
      MsgBox('Der Backend-Pfad existiert nicht!', mbError, MB_OK);
      Result := False;
      Exit;
    end;
    
    if not DirExists(WelcomePage.Values[1]) then
    begin
      MsgBox('Der Frontend-Pfad existiert nicht!', mbError, MB_OK);
      Result := False;
      Exit;
    end;
    
    // Speichern Sie die Pfade in der Konfigurationsdatei
   SaveStringToFile(ExpandConstant('{app}\\config.ini'),
  Format('[Paths]'#13#10'BackendPath=%s'#13#10'FrontendPath=%s',
    WelcomePage.Values[0], WelcomePage.Values[1]), False);
  end;
end; 