"use strict";
const sqlite3 = require('sqlite3').verbose();
// Stock Counter - StockIn counting card database
class Db {
  constructor() {
      this.db = new sqlite3.Database('stockCounterSqlite.sqlite');
      this.createTable()
  }                
  // created_at TEXT DEFAULT CURRENT_TIMESTAMP
  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS stockCounter (
        id integer PRIMARY KEY,
        counterId INTEGER,
        stock TEXT,
        description TEXT,
        machine TEXT,
        shift TEXT,
        device TEXT,
        uom TEXT,
        qty INTEGER,
        purchasePrice REAL,
        isPosted INTEGER,
        shiftDate TEXT,
        updated_at TEXT,
        created_at TEXT)`
    return this.db.run(sql);
  }

  insert(stockCounter, callback) {
    // console.log('Counter insert: 👉 ', stockCounter)
    return this.db.run(
      'INSERT INTO stockCounter (counterId,stock,description,machine,shift,device,uom,qty,purchasePrice,isPosted,shiftDate,updated_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      stockCounter, function (err) {
        return callback(this.lastID, err)
      })
  }

  selectAll(callback) {
    return this.db.all(`SELECT * FROM stockCounter  ORDER BY stock ASC`, function(err,rows){
      callback(err,rows)
    })
  }

  selectById(id, callback) {
    return this.db.get(
    `SELECT * FROM stockCounter WHERE id = ?`,
    id,function(err,row){
      callback(err,row)
    })
  }    

  selectByCodeAndDate(stock, callback) {
    return this.db.get(
    `SELECT * FROM stockCounter WHERE qty > 0 AND stock = ? ORDER BY created_at ASC Limit 1`,
    [stock],function(err,row){
      callback(err,row)
    })
  }

  // For readCounterInByCode
  selectByCodeAndMachine(params, callback) { // [stock, 0, machine]
    return this.db.get(
    `SELECT * FROM stockCounter WHERE stock = ? AND machine = ? ORDER BY updated_at ASC`,
    params,function(err,row){
      callback(err,row)
    })
  } 

  // For readCounterInByCodeAndMachine
  selectByCode(params, callback) { // [stock, machine]
    return this.db.get(
    `SELECT * FROM stockCounter WHERE stock = ? AND isPosted = ? AND machine = ?`,
    params,function(err,row){
      callback(err,row)
    })
  } 


  // For readCounterInsNotPosted
  selectByNotPosted(callback) {
    return this.db.all(
    `SELECT * FROM stockCounter WHERE isPosted = ? ORDER BY updated_at ASC`,
    [0], function(err,rows){
      callback(err,rows)
    })
  }

  // For readCounterInsPosted
  selectByPosted(callback) {
    return this.db.all(
    `SELECT * FROM stockCounter WHERE isPosted = ? ORDER BY updated_at ASC`, 
    [1], function(err,rows){
      callback(err,rows)
    })
  }

  update(stockCounter, callback) {
    return this.db.run(
      'UPDATE stockCounter SET counterId = ?, stock = ?, description = ?, machine = ?, shift = ?, device = ?, uom = ?, qty = ?, purchasePrice = ?, isPosted = ?, shiftDate = ?, updated_at = ?, created_at = ?  WHERE id = ?',
      stockCounter, (err) => {
        callback(err)
      })
  }

  updateQty(stockCounter, callback) {
    return this.db.run(
      // 'UPDATE stockCounter SET qty = ?, qty = ?, updated_at = ? WHERE id = ?',
      'UPDATE stockCounter SET qty = ?, updated_at = ? WHERE id = ?',
      stockCounter, (err) => {
        callback(err)
      })
  }

  updateStatus(stockCounter, callback) {
    return this.db.run(
      // 'UPDATE stockCounter SET qty = ?, qty = ?, updated_at = ? WHERE id = ?',
      'UPDATE stockCounter SET isPosted = ?, updated_at = ? WHERE id = ?',
      stockCounter, (err) => {
        callback(err)
      })
  }

  updateQty(stockCounter, callback) {
    return this.db.run(
      // 'UPDATE stockCounter SET qty = ?, qty = ?, updated_at = ? WHERE id = ?',
      'UPDATE stockCounter SET qty = ?, updated_at = ? WHERE id = ?',
      stockCounter, (err) => {
        callback(err)
      })
  }

  deleteById(id, callback) {
    return this.db.run(
      'DELETE FROM stockCounter WHERE id = ?',
      [id], (err) => {
        callback(err)
      })
  }
}

module.exports = Db