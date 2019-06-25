'use strict';

class Grid {
    constructor (_width, _height) {
        this.width  = _width;
        this.height = _height;
        this.grid = [];
        this.brushes = [];
        for(let y=0; y<this.height; y++) {
            let row = [];
            for(let x=0; x<this.width; x++) {
                row.push("white"); //rgb(255, 255, 255); white
            }
            this.grid.push(row);
    }
}
module.exports = Grid;
