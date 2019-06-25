'use strict';

const sqlite = require('sqlite3').verbose();
let database;

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
        database = new sqlite.Database('./bot.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, (err) => {
            if(err) {
                throw err;
            }
            console.log("Connected to the database!"); 
        });
        //create tables if they don't already exist
        database.serialize(() => {
            database.run(`CREATE TABLE IF NOT EXISTS grid (
                x INT,
                y INT,
                color INT,
                PRIMARY KEY (x,y)
            );`);

            database.run(`CREATE TABLE IF NOT EXISTS brushes (
                guild VARCHAR(64),
                x INT,
                y INT,
                PRIMARY KEY (guild)
            );`);

            //TODO: load existing brushes and existing tiles into memory
        });
}
module.exports = Grid;
