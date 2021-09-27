const http = require("http")
const express = require('express')
const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)
const sharedsession = require('express-socket.io-session')
const fs = require('fs')
// const session = require('express-session')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))

const session = require("express-session")({
    secret: "chatsistemi",
    resave: false,
    saveUninitialized: false



})
app.use(session)
io.use(sharedsession(session, {

    autoSave: true //express session ile socke session arasında bağlantı
}))

// app.use(session({
//     secret: "chatsistemi",
//     resave: false,
//     saveUninitialized: false



// }))

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')) //bootstrapi eklemenin daha kısa yolu 
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist')) //bootstrapi eklemenin daha kısa yolu 

app.get("/", function (request, response) {

    if (!request.session.kulad) {
        response.sendFile('./index.html', { root: __dirname })

    }
    else {
        response.sendFile('./chat.html', { root: __dirname })

    }

    // html çağırılır 
    // response.sendFile('./index.html', { root: __dirname })



})
app.post("/chat", function (request, response) {


    if (request.body.kulad) {
        request.session.kulad = request.body.kulad

    }


    if (request.session.kulad) {
        response.sendFile('./chat.html', { root: __dirname })

    }
    else {
        response.sendFile('./index.html', { root: __dirname })

    }


})

//socket.io sahneye çıkıyor

io.on('connection', function (socket) {

    // input ve ouoput kısmına bağlantı kontrolediliyor 
    console.log("Bir kullanıcı bağlandı :" + socket.handshake.session.kulad)

    socket.on('mesajvar', function (msg) {
        // açık kankaldan birisi mesajvar gönderilirse bunu yakalar 
        io.emit('mesajvar', socket.handshake.session.kulad, msg)
        
        //yakalanan mesajı bize bağlı olan kanallara emit (yayılma ) ediyorz 
        //birden fazla kullanıcı varsa onlarda açık olan tüm kanallara iletilir.
    })

    socket.on('disconnect', function () {
        console.log("Bir kullanıcı ayrıldı")

    })
    socket.on('konusmakaydet', function (konusmalar) {

        var bosluksik = konusmalar.trim()
        var parcalihali = bosluksik.split("*")
        var sonHal = parcalihali.join("\n")


        fs.writeFile("konusmalar.txt", konusmalar, function (err) {
            if (err) throw err
            else console.log("veri kaydedildi")
        })

    })
})



server.listen(8080, function () {

    console.log("server başladı")
})



/*
app.get("/oturumac", function (request, response) {
    //response.writeHead(200, { 'Content-type': 'text/html;charset=utf-8' })
    request.session.kullaniciadi = "eren"
    request.session.yas = 90
    response.write("oturum oluşturuldu" + request.session.kullaniciadi)
    response.end();
})
app.get("/oturumbak", function (request, response) {
    if (request.session.kullaniciadi) {
        response.write("1.oturum var")
    }
    else {

        response.write("1.oturum yk")

    }
    if (request.session.yas) {
        response.write("2.oturum var")
    }
    else {

        response.write("2.oturum yk")

    }
    response.end()
})
app.get("/sil", function (request, response) {

    // request.session.destroy()
    delete request.session.yas
    response.end()
})
*/