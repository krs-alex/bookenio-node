const express = require('express')
const router = express.Router()
const sql = require('mssql')

const dbconfig = require('../config/database.js')

router.post('/', async function (req, res, next) {
    let i = 0
    let obj
    while(i < 100) {
        obj = createRandomObject()
        console.log(obj.prop1 + ' | ' + obj.prop2 + ' | ' + obj.prop3 + ' | ' + obj.prop4)
        if(obj.prop1 !== 12){
            await insertRooms(obj)
        }
        i++
    }
    res.send({obj})
})

async function insertRooms(obj) {
    const pool = await sql.connect(dbconfig)
    try {
        const request = (await pool).request()
        const query = 'INSERT INTO Zimmer (HID, Schlafplaetze, Groesse, Grundpreis) VALUES (@HID, @Schlafplaetze, @Groesse, @Grundpreis)'
        request.input('HID', sql.Int, obj.prop1)
        request.input('Schlafplaetze', sql.Int, obj.prop2)
        request.input('Groesse', sql.Int, obj.prop3)
        request.input('Grundpreis', sql.Money, obj.prop4)
        const result = await request.query(query)
    } catch (err) {
        console.error(err)
    } finally {
        await sql.close()
    }
}

function createRandomObject() {
    let prop2
    const rand = Math.random()
    if (rand < 0.7) {
        prop2 = Math.floor(Math.random() * 3) + 2
    } else {
        if (rand > 0.94) {
            prop2 = 1
        } else {
            prop2 = Math.floor(Math.random() * 4) + 5
        }
    }
    const obj = {
      prop1: Math.floor(Math.random() * 36) + 2,
      prop2: prop2,
      prop3: (Math.floor(Math.random() * 11) + 10) * prop2,
      prop4: (Math.floor(Math.random() * 80) + 40) * 10 * prop2,
    }
    return obj;
}

module.exports = router