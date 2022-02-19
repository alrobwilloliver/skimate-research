const path = require("path")
const http = require('http')
const express = require("express")
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')
const mysql = require("mysql")
const bcrypt = require('bcrypt')

require("dotenv").config()
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT
const port = process.env.PORT || 3000

const db = mysql.createPool({
   connectionLimit: 100,
   host: DB_HOST,       //This is your localhost IP
   user: DB_USER,         // "newuser" crud user
   password: DB_PASSWORD,  // password for the new user
   database: DB_DATABASE,      // Database name
   port: DB_PORT             // port name, "3306" by default
})
db.getConnection( (err, connection)=> {
   if (err) throw (err)
   console.log ("DB connected successful: " + connection.threadId)
})

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const botName = 'SkiCord Bot'

// set static folder
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

// run when a client connects
io.on('connection', socket => {
    // console.log("new websocket connection...")

    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room)

        socket.join(user.room);

        // Welcome a user
        socket.emit('message', formatMessage(botName, 'Welcome to SkiCord!'))

        // broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} joined the chat!`))

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    // Listen for chat message
    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, message))
    })

    // runs when user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            // for everyone in room
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat.`))

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
})

//CREATE USER
app.post("/createUser", async (req,res) => {
    const user = req.body.name;
    const hashedPassword = await bcrypt.hash(req.body.password,10)
    db.getConnection( async (err, connection) => {
     if (err) throw (err)
     const sqlSearch = "SELECT * FROM userTable WHERE user = ?"
     const search_query = mysql.format(sqlSearch,[user])
     const sqlInsert = "INSERT INTO userTable VALUES (0,?,?)"
     const insert_query = mysql.format(sqlInsert,[user, hashedPassword])
     // ? will be replaced by values
     // ?? will be replaced by string
     await connection.query (search_query, async (err, result) => {
      if (err) throw (err)
      console.log("------> Search Results")
      console.log(result.length)
      if (result.length != 0) {
       connection.release()
       console.log("------> User already exists")
       res.sendStatus(409) 
      } 
      else {
       await connection.query (insert_query, (err, result)=> {
       connection.release()
       if (err) throw (err)
       console.log ("--------> Created new User")
       console.log(result.insertId)
       res.sendStatus(201)
      })
     }
    }) //end of connection.query()
  }) //end of db.getConnection()
}) //end of app.post()

server.listen(port, () => {
    console.log("Server is running on port " + port)
});

module.exports = db
