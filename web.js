const express = require('express');
const { createCanvas, loadImage } = require('canvas')

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
    renderZoomed(req, res) {
        let guild = req.params.guildId;
        if(guild == null) {
            res.send("Missing parameter")
            return;
        }
        const previewDimensions = 25;
        const squareSide = Math.floor(525/previewDimensions);
        const canvas = createCanvas(525, 525)
        const ctx = canvas.getContext('2d')
        const brush = this.gridInstance.getBrush(guild);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let offset = Math.floor((previewDimensions-1)/2);
        let brushX = brush[0];
        let brushY = brush[1];
        for(let y=(brushY-offset); y<=(brushY+offset); y++) {
            for(let x=(brushX-offset); x<=(brushX+offset); x++) {
                if(this.gridInstance.grid[y] == null) {
                    break;
                }
                if(this.gridInstance.grid[y][x] == null) {
                    continue;
                }
                ctx.fillStyle = this.gridInstance.grid[y][x];
                ctx.fillRect((x - (brushX-offset))*squareSide, (y - (brushY-offset))*squareSide, squareSide, squareSide);
            }
        }
        let buffer = canvas.toBuffer('image/png');
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': buffer.length
        });
        res.end(buffer); 
    }
    renderWholeGrid(req, res) {
        //find non-white points
        let paintedData = {};
        for(let y=0; y<this.gridInstance.height; y++) {
            let paintedRow = {};
            if(this.gridInstance.grid[y] == null) {
                continue;
            }
            for(let x=0; x<this.gridInstance.width; x++) {
                if(this.gridInstance.grid[y][x] !== "white")
                {
                    paintedRow[x] = this.gridInstance.grid[y][x];
                }
            }
            paintedData[y] = paintedRow;
        }
        //res.render('renderGrid.ejs', { 'pointData' :  paintedData});
        res.render('renderGrid.ejs', { 'pointData' :  paintedData});
    }
}
module.exports = gridWeb;
