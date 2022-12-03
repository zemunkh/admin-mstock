"use strict";
const sqlite3 = require('sqlite3').verbose();
// Log Weight, StockGroup, StockCategory, StockClass, uom, Qty produced
class DbLog {
  constructor() {
      this.db = new sqlite3.Database('loggingSqlite.sqlite');
      this.createTable()
  }                
  // created_at TEXT DEFAULT CURRENT_TIMESTAMP
  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS logging (
        id integer PRIMARY KEY,
        counterId INTEGER,
        stockCode TEXT,
        stockName TEXT,
        device TEXT,
        productionDate TEXT,
        prodQty INTEGER,
        stockInDate TEXT,
        stockInQty INTEGER,
        uom TEXT,
        totalQty INTEGER,
        category TEXT,
        stockGroup TEXT,
        class TEXT,
        weight REAL,
        shift TEXT,
        machine TEXT,
        purchasePrice REAL,
        shiftDate TEXT,
        created_at TEXT)`
    return this.db.run(sql);
  }

  insert(logging, callback) {
    // console.log('Logging insert: 👉 ', logging)
    return this.db.run(
      `INSERT INTO logging (
        counterId,
        stockCode,
        stockName,
        device,
        productionDate,
        prodQty,
        stockInDate,
        stockInQty,
        uom,
        totalQty,
        category,
        stockGroup,
        class,
        weight,
        shift,
        machine,
        purchasePrice,
        shiftDate,
        created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      logging, function (err) {
        callback(err)
      })
  }

  selectAll(callback) {
    return this.db.all(`SELECT * FROM logging`, function(err,rows){
      callback(err,rows)
    })
  }

  updateStockIn(logging, callback) {
    // console.log('Log by id: 👉 ', logging)
    return this.db.run(
      'UPDATE logging SET stockInQty = ?, stockInDate = ? WHERE counterId = ?',
      logging, (err) => {
        callback(err)
      })
  }

  selectByCounterId(id, callback) {
    return this.db.all(
      `SELECT * FROM logging WHERE id = ? ORDER BY created_at`,
      [id],function(err,row){
        callback(err,row)
      })
  }

  selectByRange(dates, callback) {
    return this.db.all(`SELECT * FROM logging WHERE created_at >= ? AND created_at <= ? ORDER BY created_at`, 
      dates, function(err,rows){
        callback(err,rows)
      })
  }

  deleteByCounterId(counterId, callback) {
    return this.db.run(
      `DELETE FROM logging WHERE counterId = ?`,
      [counterId], function(err) {
        callback(err)
      })
  }

  deleteById(id, callback) {
    return this.db.run(
      `DELETE FROM logging WHERE id = ?`,
      [id], function(err) {
        callback(err)
      })
  }
}

module.exports = DbLog