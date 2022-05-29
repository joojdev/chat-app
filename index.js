const express = require('express')
const http = require('http')
const ws = require('socket.io')
const path = require('path')

const expressApp = express()
const httpServer = http.createServer(expressApp)
const websocketServer = ws(httpServer)

let folder = 'public'
let userArray = []

expressApp.use(express.static(path.join(__dirname, folder)))

expressApp.get('/api/user_counter/:roomQuery', (request, response) => {
  const { roomQuery } = request.params
  
  if (!roomQuery) return response.status(404).end()

  const userCount = userArray.filter((user) => user.room == roomQuery).length

  response.status(200).json({ online: userCount })
})

expressApp.get('/api/get_current_rooms', (request, response) => {
  const roomArray = userArray.map((user) => user.room)

  if (!roomArray) return response.status(404).end()

  const roomCounter = {}

  roomArray.forEach((roomName) => {
    roomCounter[roomName] = roomCounter[roomName] + 1 || 1
  })

  response.status(200).json(roomCounter)
})

websocketServer.on('connection', (websocketClient) => {
	console.log(`A user connected! ID: ${websocketClient.id}`)

  websocketClient.on('newUser', ({ username, room }) => {
    if (!username || !room) return websocketClient.disconnect()
    if (username.length > 30 || room.length > 15) return websocketClient.disconnect()

    websocketClient.join(room)
    userArray.push({ id: websocketClient.id, username, room })
    websocketClient.emit('userConfirm')
    websocketServer.to(room).emit('userAdded', { username })
    console.log(userArray)
  })

  websocketClient.on('messageAdd', ({ message }) => {
    const { username, room } = userArray.find((user) => user.id == websocketClient.id)

    websocketServer.to(room).emit('messageAdded', { username, message })
  })

  websocketClient.on('disconnect', () => {
    console.log(`A user disconnected! ID: ${websocketClient.id}`)
    
    const userIndex = userArray.findIndex((user) => user.id == websocketClient.id)
    if (userIndex == -1) return
    const { username, room } = userArray[userIndex]
    websocketServer.to(room).emit('userRemoved', { username })
    
    userArray.splice(userIndex, 1)
    console.log(userArray)
  })
})

const port = process.env.PORT || 3000

httpServer.listen(port, () => {
  console.log(`HTTP Server is listening on port ${port}!`)
})