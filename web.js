const express = require('express');

class gridWeb {
    constructor(_gridInstance) {
        this.gridInstance = _gridInstance;
        this.app = express();
        this.app.get('/api/renderZoomedGrid/:guildId/:time.png', (req, res) => this.renderZoomed(req, res));
        this.app.get('/api/showCanvas', (req, res) => this.renderWholeGrid(req, res));
        this.app.use(function(req, res, next) {
            return res.status(404).send({ message: '404 - Not Found' });
        });
        this.app.listen(3000, () => console.log(`API web server is running!`))
    }
}
module.exports = gridWeb;
