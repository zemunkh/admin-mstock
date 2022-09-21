"use strict";
const sqlite3 = require('sqlite3').verbose();
// Log Weight, StockGroup, StockCategory, StockClass, uom, Qty produced
class DbLog {
  constructor(file) {
      this.db = new sqlite3.Database(file);
      this.createTable()
  }                
  // created_at TEXT DEFAULT CURRENT_TIMESTAMP
  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS logging (
        id integer PRIMARY KEY,
        action TEXT,
        stockId TEXT,
        stockName TEXT,
        stockCode TEXT,
        machine TEXT,
        shift TEXT,
        category TEXT,
        stockGroup TEXT,
        class TEXT,
        weight REAL,
        totalQty INTEGER,
        purchasePrice REAL,
        uom TEXT,
        shiftDate TEXT,
        created_at TEXT)`
    return this.db.run(sql);
  }

  insert(logging, callback) {
    // console.log('Logging insert: 👉 ', logging)
    return this.db.run(
      'INSERT INTO logging (action,stockId,stockName,stockCode,machine,shift,category,stockGroup,class,weight,totalQty,purchasePrice,uom,shiftDate,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      logging, function (err) {
        callback(err)
      })
  }

  selectAll(callback) {
    return this.db.all(`SELECT * FROM logging`, function(err,rows){
      callback(err,rows)
    })
  }

  selectByRange(dates, callback) {
    return this.db.all(`SELECT * FROM logging WHERE created_at >= ? AND created_at <= ? ORDER BY created_at`, 
    dates, function(err,rows){
      callback(err,rows)
    })
  }

  deleteById(id, callback) {
    return this.db.run(
      'DELETE FROM logging WHERE id = ?',
      [id], function(err) {
        callback(err)
      })
  }
}

module.exports = DbLog