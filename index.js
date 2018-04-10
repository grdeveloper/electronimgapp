const {BrowserWindow, app} = require('electron');

let win = null;

let boot = () => {
    win = new BrowserWindow({
        width: 800,
        height: 500,
        frame: false
    });

    win.loadURL(`file://${__dirname}/index.html`);

    win.on('closed', () => {
        win = null
    })

};

app.on('ready', boot);
