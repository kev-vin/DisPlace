'use strict';

const sqlite = require('sqlite3').verbose();
let database;

class Grid {
    constructor (_width, _height) {
        this.width  = _width;
        this.height = _height;
        this.grid =    [];
        this.brushes = [];
        for(let y=0; y<this.height; y++) {
            let row  = [];
            for(let x=0; x<this.width; x++) {
                row.push("white"); //rgb(255, 255, 255); white
                //row.push("#"+((1<<24)*Math.random()|0).toString(16));
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
                color VARCHAR(16),
                PRIMARY KEY (x,y)
            );`);

            database.run(`CREATE TABLE IF NOT EXISTS brushes (
                guild VARCHAR(64),
                x INT,
                y INT,
                PRIMARY KEY (guild)
            );`);

            //load existing tiles into memory
            database.each("SELECT * FROM grid WHERE x<=$width AND y<=$height", {$width: this.width, $height: this.height}, function (err, row) {
                if(err) {
                    throw err;
                }
                if( this.grid[row.y] !== null) {
                    this.grid[row.y][row.x]   = row.color;
                }
            }.bind(this));
        });
        setInterval(function() { this.saveGrid() }.bind(this), 15000); //10 minute save interval 600000
    }
    /** 
    * Creates a brush for a guild.
    * @param {snowflake} guild
    *   Guild ID to create a brush for
    */
    createBrush(guild) {
        //start them at a random position
        let startX = Math.floor(Math.random() * this.width);
        let startY = Math.floor(Math.random() * this.height);
        let startColor = "black"; //integer rgb(0, 0, 0)
        this.brushes[guild] = [startX, startY, startColor, true];
        //[1,2,3,4, 5]
        //commit to database
        database.serialize( () => {
            database.run("REPLACE INTO brushes(guild, x, y) VALUES ($guild, $x, $y)", {$guild : guild, $x: startX, $y: startY});
        });
    }
    /** 
    * Gets a brush position for a specific guild.
    * @param {snowflake} guild
    *   Guild ID to create a brush for
    * @return {Object} x, y position object
    */
    getBrush(guild) {
        //see if it is in memory
        if(guild in this.brushes) {
            return  this.brushes[guild];
        }
        //otherwise get it from the database
        database.serialize( () => {
            database.get('SELECT x, y FROM brushes WHERE guild=$guild', {$guild : guild}, (err, row) => {
                if(err) {
                    throw err;
                }
                let brush = [row.x, row.y, "black", true];
                this.brushes[guild] = brush;
                return brush;
            });
        });
    }
    /** 
    * Gets a brush color for a specific guild.
    * @param {snowflake} guild
    *   Guild ID to create a brush for
    * @return {string} color
    */
    getBrushColor(guild) {
        if(guild in this.brushes) {
            return  this.brushes[guild][2];
        }
        return "black";
    }
    /** 
    * Gets the lifted/down state of a brush
    * @param {snowflake} guild
    *   Guild ID to create a brush for
    * @return {bool} state
    */
    getBrushState(guild) {
        if(guild in this.brushes) {
            return  this.brushes[guild][3];
        }
        return true;
    }
    /** 
    * Check whether a brush is within the bounds of the grid
    * @param {array} direction
    *   Specifies the direction to check the brush (1=up, 2=right, 3=down, 4=left)
    * @param {array} brush
    *   Guild ID to check for
    */
    checkBounds(direction, brush) {
        switch(direction) {
            case 1: //up
                if(brush[1]+1 >= this.height) {
                    return false;
                }
                break;
            case 2: //right
                if(brush[0]+1 >= this.width) {
                    return false;
                }
                break;
            case 3: //down
                if(brush[1] <= 0) {
                    return false;
                }
                break;
            case 4: //left
                if(brush[0] <= 0) {
                    return false;
                }
                break;
            default:
                throw "Direction not recognized";
        }
        return true;
    }
    /** 
    * Moves a brush for a guild.
    * @param {snowflake} guild
    *   Guild ID to create a brush for
    * @param {int} color
    *   Specifies the color of the brush (integer rgb)
    */
    setColor(guild, color) {
        //try first to modify in memory
        if(guild in this.brushes) {
            this.brushes[guild][2] = color;
        }
        else {
            //otherwise get it from the database
            database.get('SELECT x, y FROM brushes WHERE guild=?', [guild], (err, row) => {
                if(err) {
                    throw err;
                }
                this.brushes[guild] = [row.x, row.y, color, true]; //put in memory
            });
        }
    }

    
    /** 
    * Moves a brush for a guild.
    * @param {int} direction
    *   Specifies the direction to move the brush (1=up, 2=right, 3=down, 4=left)
    * @param {snowflake} guild
    *   Guild ID to create a brush for
    */
    moveBrush(direction, guild) {
        if(!this.checkBounds(direction, this.getBrush(guild))) {
            throw "Movement exceeds bounds of the grid";
        }
        switch(direction) {
            case 1: //up
                    this.brushes[guild][1]--; //update y position
                if( this.brushes[guild][3]) {
                    this.grid[this.brushes[guild][1]][this.brushes[guild][0]] = this.brushes[guild][2]; //color tile at grid[y][x]
                }
                break;
            case 2: //right
                this.brushes[guild][0]++; //update x position
                if( this.brushes[guild][3]) {
                    this.grid[this.brushes[guild][1]][this.brushes[guild][0]] = this.brushes[guild][2]; //color tile at grid[y][x]
                }
                break;
            case 3: //down
                this.brushes[guild][1]++; //update y position
                if(this.brushes[guild][3]) {
                    this.grid[this.brushes[guild][1]][this.brushes[guild][0]] = this.brushes[guild][2]; //color tile at grid[y][x]
                }
                break;
            case 4: //left
                this.brushes[guild][0]--; //update x position
                if(this.brushes[guild][3]) {
                    this.grid[this.brushes[guild][1]][this.brushes[guild][0]] = this.brushes[guild][2]; //color tile at grid[y][x]
                }
                break;
            default:
                throw "Direction not recognized";
        }
    }
    /** 
    * Toggles brush placement for a guild
    * @param {snowflake} guild
    *   Guild ID to create a brush for
    * @param {bool} isdown
    *   True/false for whether the brush is down
    */
    setPlacement(guild, isdown) {
        if(guild in this.brushes) {
            this.brushes[guild][3] = isdown;
        } else {
            throw "Guild does not have a brush"
        }
    }
    emptyBrushTable() {
        database.serialize( () => {
            database.run("DELETE FROM brushes");
        });
    }
    /**
     * Commit the grid to the database
     */
    saveGrid() {
        console.log("Saving the grid");
        database.serialize( () => {
            for(let y=0; y<this.height; y++) {
                if(this.grid[y] == null) {
                    continue;
                }
                for(let x=0; x<this.width; x++) {
                    if(this.grid[y][x] !== "white")
                    {
                        let color = this.grid[y][x];
                        database.run("REPLACE INTO grid(x, y, color) VALUES($x, $y, $color)", {$x: x, $y: y, $color: color});
                        console.log('<3');
                    }
                }
            }
            this.brushes.forEach(function(guild, brush) {
                if(brush[0] <= this.width && brush[1] <= this.height) {
                    database.run("REPLACE INTO brushes(x, y, guild) VALUES($x, $y, $guild)", {$x: brush[0], $y: brush[1], $guild: guild});
                }
            }.bind(this));
        });
    }
}
module.exports = Grid;
// dear mr code. pls work now ty.
