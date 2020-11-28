const express = require("express");
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const https = require('https');
const pug = require('pug');

// For SSL
var options = {
    key: fs.readFileSync('/etc/letsencrypt/live/example.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/example.com/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/example.com/chain.pem')
};
//Creating socket.io server
const server = https.createServer(options).listen(8000);
const io = require('socket.io')(server);

mongoose.connect('mongodb://localhost/ichatdb', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
const nameSchema = new mongoose.Schema({
    name: String
});
app.listen(5000,()=>{
    console.log("Server is running on port 5000");
});
const namemodel = mongoose.model('username', nameSchema);

app.use(express.static(__dirname + '/static'));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, "views"));

app.get("/", (req, res) => {
    namemodel.find({}, (err, username) => {
        if (err) return console.error(err);

        let jsonobj = JSON.stringify(username);
        res.status(200).render("main.pug", { "mongodoc": jsonobj });
    });
});

const users = {};

// Handling events with Socket.io
io.on('connection', (socket) => {
    socket.on('new-user-joined', username => {
        let nameobj = {
            name: username
        };

        const name = new namemodel(nameobj);
        name.save().then(() => {
            users[socket.id] = username;
            namemodel.find({}, (err, namedocument) => {
                if (err) return console.error(err);

                socket.broadcast.emit("user-joined", namedocument);
            });
        }).catch((err) => {
            console.error(err);
        });
    });

    socket.on("send", message => {
        socket.broadcast.emit("receive", { message: message, name: users[socket.id] });
    });

    socket.on("disconnect", () => {
        namemodel.deleteOne({ name: users[socket.id] }).then(() => {
            namemodel.find({}, (err, newdocument) => {
                if (err) return console.error(err);

                let newlist = {
                    'name': users[socket.id],
                    'onlinelist': newdocument
                };

                socket.broadcast.emit("user-left", newlist);
                delete users[socket.id];
            });
        }).catch((err) => {
            console.error(err);
        });
    });
});

