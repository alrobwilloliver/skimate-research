const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http)
const port = process.env.PORT || 3000;
const path = require('path')

var redis = require('redis');
var redisSubscriber = redis.createClient();
var redisPublisher = redis.createClient();
redisSubscriber.on('subscribe', function (channel, count) {
    console.log('client subscribed to ' + channel + ', ' + count + ' total subscriptions');
});

redisSubscriber.on('message', function (channel, message) {
    console.log('client channel ' + channel + ': ' + message);
    io.emit('locationUpdate', message);
});

io.on('connection', function (socket) {
    console.log('socket created');

    let previousId;
    const safeJoin = currentId => {
        socket.leave(previousId);
        socket.join(currentId);
        previousId = currentId;
      };

    socket.on('disconnect', function() {
      console.log('Got disconnect!');
   });

    socket.on('lastKnownLocation', function (data) {
        const location = JSON.stringify(data);
        redisPublisher.publish('locationUpdate', location);
    });

});

// Start the Server
http.listen(port, function () {
    console.log('Server Started. Listening on *:' + port);
});


// Express Middleware
app.use(express.static(path.join(__dirname, '/public' )))
// Render Main HTML file
app.get('/', function (req, res) {
    redisSubscriber.subscribe('locationUpdate');
    res.sendFile('public/views/index.html', {
        root: __dirname
    });
});

//Serve a Publisher HTML
app.get('/publish', function (req, res) {
    res.sendFile('public/views/publish.html', {
        root: __dirname
    });
});
