const express = require('express')
const router = express.Router()
const sql = require('mssql')

const dbconfig = require('../config/database.js')

router.post('/', async function (req, res, next) {
    let i = 0
    let obj = {}
    const allHID = await getAllHID()
    const onlyHID = allHID.map(item => item.HID)
    while(i < 100) {
        obj[i] = createRandomObject()
        if(onlyHID.includes(obj[i].prop1)) {
            await insertRooms(obj[i])
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
      prop1: Math.floor(Math.random() * 252) + 1,
      prop2: prop2,
      prop3: (Math.floor(Math.random() * 11) + 10) * prop2,
      prop4: (Math.floor(Math.random() * 80) + 40) * 10 * prop2,
    }
    return obj;
}

async function getAllHID() {
    const pool = await sql.connect(dbconfig)
    try {
        const request = (await pool).request()
        const query = 'SELECT HID FROM Hotels'
        const result = await request.query(query)
        return result.recordset
    } catch (err) {
        console.error(err)
    } finally {
        await sql.close()
    }
}

module.exports = router