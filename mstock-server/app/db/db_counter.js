"use strict";
const sqlite3 = require('sqlite3').verbose();
// Counter Weight, StockGroup, StockCategory, StockClass, basedUOM, Qty produced
class Db {
  constructor(file) {
      this.db = new sqlite3.Database(file);
      this.createTable()
  }                
  // created_at TEXT DEFAULT CURRENT_TIMESTAMP
  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS counter (
        id integer PRIMARY KEY,
        stockId TEXT,
        stockCode TEXT,
        stockName TEXT,
        machine TEXT,
        shift TEXT,
        category TEXT,
        stockGroup TEXT,
        class TEXT,
        weight REAL,
        qty INTEGER,
        totalQty INTEGER,
        purchasePrice REAL,
        uom TEXT,
        updated_at TEXT,
        created_at TEXT)`
    return this.db.run(sql);
  }

  insert(counter, callback) {
    console.log('Counter insert: 👉 ', counter)
    return this.db.run(
      'INSERT INTO counter (stockId,stockCode,stockName,machine,shift,category,stockGroup,class,weight,qty,totalQty,purchasePrice,uom,updated_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      counter, function (err) {
        return callback(this.lastID, err)
      })
  }

  selectAll(callback) {
    return this.db.all(`SELECT * FROM counter`, function(err,rows){
      callback(err,rows)
    })
  }

  selectById(id, callback) {
    return this.db.get(
    `SELECT * FROM counter WHERE id = ?`,
    [id],function(err,row){
      callback(err,row)
    })
  }    

  selectByCode(stockCode, callback) {
    return this.db.get(
    `SELECT * FROM counter WHERE stockCode = ?`,
    [stockCode],function(err,row){
      callback(err,row)
    })
  }  

  selectByCodeAndDate(stockCode, callback) {
    return this.db.get(
    `SELECT * FROM counter WHERE qty > 0 AND stockCode = ? ORDER BY updated_at ASC Limit 1`,
    [stockCode],function(err,row){
      callback(err,row)
    })
  }  

  selectByMachine(machine, callback) {
    return this.db.all(
    `SELECT * FROM counter WHERE machine = ? ORDER BY updated_at ASC`,
    [machine],function(err,rows){
      callback(err,rows)
    })
  }  

  selectByCodeAndMachine(params, callback) { // [stockCode, machine]
    return this.db.get(
    `SELECT * FROM counter WHERE stockCode = ? AND machine = ? ORDER BY updated_at ASC`,
    params,function(err,row){
      callback(err,row)
    })
  } 

  updateId(counter, callback) {
    console.log('Counter update: 👉 ', counter)
    return this.db.run(
      'UPDATE counter SET stockId = ?, stockCode = ?, stockName = ?, machine = ?, shift = ?, category = ?, stockGroup = ?, class = ?, weight = ?, qty = ?, totalQty = ?, purchasePrice = ?, baseUOM = ?,  WHERE id = ?',
      [counter.id], (err) => {
        callback(err)
      })
  }

  updateQty(counter, callback) {
    console.log('Counter by id: 👉 ', counter)
    return this.db.run(
      // 'UPDATE counter SET qty = ?, totalQty = ?, updated_at = ? WHERE id = ?',
      'UPDATE counter SET qty = ?, totalQty = ?, updated_at = ? WHERE id = ?',
      counter, (err) => {
        callback(err)
      })
  }

  updateWeight(counter, callback) {
    console.log('Counter by id: 👉 ', counter)
    return this.db.run(
      'UPDATE counter SET weight = ?, updated_at = ? WHERE id = ?',
      counter, (err) => {
        callback(err)
      })
  }

  deleteById(id, callback) {
    return this.db.run(
      'DELETE FROM counter WHERE id = ?',
      [id], function(err) {
        callback(err)
      })
  }
}

module.exports = Db