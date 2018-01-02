//https://www.youtube.com/watch?v=dOSIqJWQkXM&list=PLicY6aYZ8ilpmHfJ8jP1lt7ihPpRWBJ9P&index=2
const express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  users = [];
  connected = [];


server.listen(7002, () => {
  console.log("server port 7002!")
})

app.get('/',(req,res)=>{
  res.sendfile(__dirname+'/view/index.html')
});

io.sockets.on('connection', (socket)=>{
  socket.on('new user', (data, callback) => {
   console.log(data)
    if(data in connected){
      callback(false)
    }else{
      callback(true)
      socket.nickname = data
      //users[socket.nickname]=socket
      connected[socket.nickname]=socket
      users.push({username:socket.nickname,socketId:socket.id})
      updateNickNames()
    }
  })
  function updateNickNames(){
    console.log(users)
    io.sockets.emit('usernames',users)
    //io.sockets.emit('usernames',Object.keys(users))
  }
  socket.on('send message', (data) => {
    io.sockets.emit('new message', {msg:data, nick: socket.nickname})
    //socket.broadcast.emit('new message', data);
  })
  socket.on('private send message', (data) => {
    //io.sockets.
    //io.sockets.emit('new private message', {msg:data.message, nick: socket.nickname})
    //console.log(data)
    io.sockets.connected[socket.id].emit('new own private message', {msg:data.message, by: {username:socket.nickname,socketId:socket.id}, to: {username:data.username,socketId:data.socketId}});
    socket.broadcast.to(data.socketId).emit('new private message', {msg:data.message, by: {username:socket.nickname,socketId:socket.id}, to: {username:data.username, socketId:data.socketId}})
    //socket.broadcast.emit('new message', data);
  })
  socket.on('attachment', function (msg) {
      //console.log(msg);
      io.sockets.emit('attachmentMsg', socket.nickname, msg);
  });
  socket.on('privateAttachment', function (data) {
      console.log(data.message);
      io.sockets.connected[socket.id].emit('ownPrivateAttachmentMsg', {msg:data.message, by: {username:socket.nickname,socketId:socket.id}, to: {username:data.username,socketId:data.socketId}});
      socket.broadcast.to(data.socketId).emit('privateAttachmentMsg',{msg:data.message, by: {username:socket.nickname,socketId:socket.id}, to: {username:data.username, socketId:data.socketId}})
      //io.sockets.emit('privateAttachmentMsg', socket.nickname, msg);
  });

  socket.on('disconnect', (data)=>{
    if(!socket.nickname) return;    
    users.some(function (elem, i) {
        return elem.username === socket.nickname ? users.splice(i, 1) : false;
    });
    delete connected[socket.nickname]
    updateNickNames()
  })
})