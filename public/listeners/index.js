const {
  BrowserWindow,
  app,
  dialog,
  ipcMain,
  nativeTheme,
  shell,
} = require('electron');

const {
  getPreference,
  getPreferences,
  resetPreferences,
  setPreference,
} = require('../libs/preferences');

const {
  getLocale,
  getLocales,
} = require('../libs/locales');

const loadListeners = () => {
  // Locale
  ipcMain.on('get-locale', (e, id) => {
    e.returnValue = getLocale(id);
  });

  ipcMain.on('get-locales', (e) => {
    e.returnValue = getLocales();
  });

  // Preferences
  ipcMain.on('get-preference', (e, name) => {
    e.returnValue = getPreference(name);
  });

  ipcMain.on('get-preferences', (e) => {
    e.returnValue = getPreferences();
  });

  ipcMain.on('request-set-preference', (e, name, value) => {
    setPreference(name, value);
  });

  ipcMain.on('request-reset-preferences', () => {
    dialog.showMessageBox(BrowserWindow.getAllWindows()[0], {
      type: 'question',
      buttons: [getLocale('resetNow'), getLocale('cancel')],
      message: getLocale('resetDesc'),
      cancelId: 1,
    })
      .then(({ response }) => {
        if (response === 0) {
          resetPreferences();

          ipcMain.emit('request-show-require-restart-dialog');
        }
      })
      .catch(console.log); // eslint-disable-line no-console
  });

  ipcMain.on('request-show-require-restart-dialog', () => {
    dialog.showMessageBox({
      type: 'question',
      buttons: [getLocale('quitNow'), getLocale('later')],
      message: getLocale('requireRestartDesc'),
      cancelId: 1,
    })
      .then(({ response }) => {
        if (response === 0) {
          app.quit();
        }
      })
      .catch(console.log); // eslint-disable-line no-console
  });

  ipcMain.on('request-open-in-browser', (e, browserUrl) => {
    shell.openExternal(browserUrl);
  });

  ipcMain.on('request-show-message-box', (e, message, type) => {
    dialog.showMessageBox(BrowserWindow.getAllWindows()[0], {
      type: type || 'error',
      message,
      buttons: [getLocale('ok')],
      cancelId: 0,
      defaultId: 0,
    }).catch(console.log); // eslint-disable-line no-console
  });

  // Native Theme
  ipcMain.on('get-should-use-dark-colors', (e) => {
    e.returnValue = nativeTheme.shouldUseDarkColors;
  });

  ipcMain.on('get-theme-source', (e) => {
    e.returnValue = nativeTheme.themeSource;
  });

  ipcMain.on('request-set-theme-source', (e, val) => {
    nativeTheme.themeSource = val;
  });
};

module.exports = loadListeners;
