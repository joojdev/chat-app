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

expressApp.get('/api/user_counter', (request, response) => {
  response.status(200).json({ online: userArray.length })
})

websocketServer.on('connection', (websocketClient) => {
	console.log(`A user connected! ID: ${websocketClient.id}`)

  websocketClient.on('newUser', ({ username }) => {
    userArray.push({ id: websocketClient.id, username })
    websocketClient.emit('userConfirm')
    websocketServer.emit('userAdded', { username })
    console.log(userArray)
  })

  websocketClient.on('messageAdd', ({ message }) => {
    const { username } = userArray.find((user) => user.id == websocketClient.id)

    websocketServer.emit('messageAdded', { username, message })
  })

  websocketClient.on('disconnect', () => {
    console.log(`A user disconnected! ID: ${websocketClient.id}`)

    const userIndex = userArray.findIndex((user) => user.id == websocketClient.id)
    if (userIndex == -1) return
    const { username } = userArray[userIndex]
    websocketServer.emit('userRemoved', { username })

    userArray.splice(userIndex, 1)
  })
})

const port = process.env.PORT || 3000

httpServer.listen(port, () => {
  console.log(`HTTP Server is listening on port ${port}!`)
})