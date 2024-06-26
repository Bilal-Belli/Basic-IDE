const { app, BrowserWindow, shell, Menu, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, 'icons/logo.ico'),
    webPreferences: {
      nodeIntegration: true
    }
  });
  // Open links externally
  mainWindow.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });
  mainWindow.maximize();
  mainWindow.loadFile('index.html');
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open File',
          click: () => {
            // Implement your open folder logic here
          },
        },
        {
          label: 'Open Folder',
          click: () => {
            dialog.showOpenDialog(mainWindow, {
              properties: ['openDirectory']
            }).then(result => {
              if (!result.canceled) {
                var folderPath = result.filePaths[0];
                const folderStructure = generateFolderStructure(folderPath);
                const jsonData = JSON.stringify(folderStructure, (key, value) => {
                  return value;
                });
                mainWindow.webContents.executeJavaScript(`
                  $('#kt_docs_jstree_basic').jstree({
                    "core" : {
                        "themes" : {
                            "responsive": false
                        },
                        "data": ${jsonData}
                    },
                    "types" : {
                        "default" : {
                            "icon" : "fa fa-folder"
                        },
                        "file" : {
                            "icon" : "fa fa-file"
                        }
                    },
                    "plugins": ["types"]
                  });
                `);
              }
            }).catch(err => {
              console.log(err);
            });
          },
        },
        {
          label: 'New File',
          click: () => {
            // Implement your open folder logic here
          },
        },
        {
          label: 'New Folder',
          click: () => {
            // Implement your open folder logic here
          },
        },
        {
          label: 'New Window',
          click: () => {
            // Implement your open folder logic here
          },
        },
      ],
    },
    {
      label: 'Terminal',
      click: () => {
        if (process.platform === 'darwin') {
          // For macOS
          spawn('open', ['-a', 'Terminal', '.']);
        } else if (process.platform === 'win32') {
          // For Windows
          spawn('cmd.exe', ['/c', 'start', 'cmd']);
        } else {
          // For Linux or other Unix-like systems
          spawn('x-terminal-emulator', [], { detached: true });
        }
      },
    },
  ];
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

function generateFolderStructure(folderPath) {
  const data = { "id": folderPath, "text": path.basename(folderPath), "children": [] };
  const items = fs.readdirSync(folderPath);

  for (const item of items) {
      const itemPath = path.join(folderPath, item);
      if (fs.statSync(itemPath).isDirectory()) {
          data["children"].push(generateFolderStructure(itemPath));
      } else {
          data["children"].push({ "id": itemPath, "text": item, "type": "file" });
      }
  }
  return data;
}