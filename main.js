// 引入electron并创建一个Browserwindow
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow;
let thumbarButtons = [
  {
    tooltip: '上一曲',
    icon: path.join(__dirname, './resource/prev.png'),
    flags: [
      'nobackground'
    ],
    click: () => {
      mainWindow.webContents.send('pre');
    }
  },
  {
    tooltip: '播放',
    icon: path.join(__dirname, './resource/play.png'),
    flags: [
      'nobackground'
    ],
    click: () => {
      mainWindow.webContents.send('switch');
    }
  },
  {
    tooltip: '下一曲',
    icon: path.join(__dirname, './resource/next.png'),
    flags: [
      'nobackground'
    ],
    click: () => {
      mainWindow.webContents.send('next');
    }
  }
];

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    frame: false,
    width: process.env.NODE_ENV === 'development' ? 1000 : 400,
    height: 670,
    transparent: true,
    resizable: false,
    maximizable: false,
    backgroundColor: '#00FFFFFF',
    webPreferences: {
      javascript: true,
      plugins: true,
      nodeIntegration: false, // 不集成 Nodejs
      webSecurity: false,
      preload: path.join(__dirname, './public/renderer.js') // 预加载
    },
    icon: path.join(__dirname, './resource/logo.ico')
  })
  if (process.env.NODE_ENV === 'development') {
    // 加载应用----适用于 react 项目
    mainWindow.loadURL('http://localhost:3000/');
    // 打开开发者工具，默认不打开
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, '/build/index.html'),
      protocol: 'file:',
      slashes: true
    }))
  }

  // 关闭window时触发下列事件.
  mainWindow.on('closed', function () {
    mainWindow = null
  });
  // 添加按钮到菜单栏的缩图工具栏
  mainWindow.setThumbarButtons(thumbarButtons);
}
app.setName('JMusic');
// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on('ready', createWindow)

// 所有窗口关闭时退出应用.
app.on('window-all-closed', function () {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('playSwitch', (e, state) => {
  let icon = state ? './resource/paused.png' : './resource/play.png';
  thumbarButtons[1].icon = path.join(__dirname, icon);
  mainWindow.setThumbarButtons(thumbarButtons);
});
