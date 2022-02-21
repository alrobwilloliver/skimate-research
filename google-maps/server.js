const express = require('express')
const app = express()

var cors = require('cors');

//enables cors
app.use(cors());

const port = process.env.PORT || 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile('public/index.html')
})

app.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})
