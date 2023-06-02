const express = require('express')
const router = express.Router()
const sql = require('mssql')

const dbconfig = require('../config/database.js')

router.get('/', async function (req, res, next) {
    res.render('home', {
        cities: await getCities(),
        countries: await getCountries()
    })
})

router.post('/', async function (req, res, next) {
    let hotels = await getHotels(req.body.target)
    let innerHeaderText = req.body.target
    if (hotels.rowsAffected[0] === 0) {
        innerHeaderText += ': Keine Unterkünfte gefunden.'
    } else if (hotels.rowsAffected[0] === 1) {
        innerHeaderText += ': ' + hotels.rowsAffected[0] + ' Unterkunft gefunden.'
    } else {
        innerHeaderText += ': ' + hotels.rowsAffected[0] + ' Unterkünfte gefunden.'
    }
    res.render('results', {
        cities: await getCities(),
        countries: await getCountries(),
        target: req.body.target,
        title: "| " + req.body.target,
        targetsFound: hotels.rowsAffected[0],
        innerHeaderText: innerHeaderText,
        checkIn: req.body.checkIn,
        checkOut: req.body.checkOut,
        peopleNumber: req.body.peopleNumber,
        results: hotels.recordset
    })
})

async function getCities() {
    const pool = await sql.connect(dbconfig)
    try {
        const request = (await pool).request()
        const query = 'SELECT Stadt FROM Staedte ORDER BY Stadt'
        const result = await request.query(query)
        return result.recordset
    } catch (err) {
        console.error(err)
    } finally {
        await sql.close()
    }
}

async function getCountries() {
    const pool = await sql.connect(dbconfig)
    try {
        const request = (await pool).request()
        const query = 'SELECT Land FROM Staedte GROUP BY Land ORDER BY LAND'
        const result = await request.query(query)
        return result.recordset
    } catch (err) {
        console.error(err)
    } finally {
        await sql.close()
    }
}

async function getHotels(target) {
    const pool = await sql.connect(dbconfig)
    try {
        const request = (await pool).request()
        const query = `SELECT 
                            h.HID, 
                            h.Hotelname, 
                            MIN(z.Grundpreis) AS Grundpreis, 
                            h.pictureURL, 
                            st.Land, 
                            st.Stadt, 
                            s.Strasse, 
                            s.Hausnummer,
                            COUNT(DISTINCT r.RID) AS Rezessionen,
                            CAST((CONVERT(float, SUM(r.Bewertung)) / CONVERT(float, COUNT(r.RID))) AS decimal(10, 1)) AS Bewertung
                        FROM Hotels AS h 
                        LEFT JOIN Standorte AS s ON s.SID = h.SID 
                        LEFT JOIN Staedte AS st ON st.STID = s.STID 
                        LEFT JOIN Zimmer AS z ON z.HID = h.HID
                        LEFT JOIN Rezessionen AS r ON r.HID = z.HID
                        WHERE st.Stadt = @target OR st.Land = @target
                        GROUP BY h.HID, h.Hotelname, h.pictureURL, st.Land, st.Stadt, s.Strasse, s.Hausnummer`
        request.input('target', sql.NVarChar, target)
        const result = await request.query(query)
        result.recordset.forEach((element, index) => {
            if (element.Bewertung) {
                result.recordset[index].Bewertung = parseFloat(element.Bewertung).toFixed(1)
            } else {
                result.recordset[index].Bewertung = 0
            }
            if (!element.pictureURL) {
                result.recordset[index].pictureURL = './pics/logo.png'
            }
        })
        return result
    } catch (err) {
        console.error(err)
    } finally {
        await sql.close()
    }
}

module.exports = router