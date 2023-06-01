const express = require('express')
const handlebars = require('express-handlebars')
const path = require('path')

const home = require('./routes/home.js')
const rooms = require('./routes/rooms.js')

const app = express()
const port = 80

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', './views')

app.use(
    '/',
    home
)

app.use(
    '/rooms/',
    rooms
)

app.listen(port, () => {
    console.log(`Server is running on Port ${port}`)
})