const messageList = document.querySelector('#messageList')
const inputContainer = document.querySelector('#inputContainer')
const messageInput = document.querySelector('#messageInput')
const chatContainer = document.querySelector('#chatContainer')
const userCounter = document.querySelector('#userCounter')
const title = document.querySelector('#title')

const websocketClient = io()
let connected = false

async function updateUserCounter() {
  const response = await fetch(`/api/user_counter/${sessionStorage.room}`)
  const data = await response.json()

  userCounter.textContent = `${data.online} users online in this room!`
}

function start() {
  if (!sessionStorage.username) return window.location.href = '/'
  const username = sessionStorage.username.trim().split(/ +/).join` `

  if (!sessionStorage.room) return window.location.href = '/'
  const room = sessionStorage.room.trim().split(/ +/).join` `
  
  if (username.length > 30) return window.location.href = '/'
  if (room.length > 15) return window.location.href = '/'

  websocketClient.emit('newUser', {
    username,
    room
  })
}

websocketClient.on('userConfirm', () => {
  connected = true
  title.textContent = `Chat App - ${sessionStorage.room}`
})

function sendSystemMessage(message) {
  const systemMessageElement = document.createElement('li')
  systemMessageElement.className = 'systemMessage'
  systemMessageElement.textContent = message
  messageList.append(systemMessageElement)
  
  chatContainer.scrollTop = chatContainer.scrollHeight
}

websocketClient.on('userAdded', ({ username }) => {
  if (!connected) return window.location.href = '/'
 
  sendSystemMessage(`${username} entered the chat!`)
  updateUserCounter()
})

websocketClient.on('userRemoved', ({ username }) => {
  if (!connected) return window.location.href = '/'
  
  sendSystemMessage(`${username} left the chat!`)
  updateUserCounter()
})

websocketClient.on('messageAdded', ({ username, message }) => {
  if (!connected) return window.location.href = '/'
  
  console.log(username, message)
  const messageBoxElement = document.createElement('li')
  messageBoxElement.className = 'messageBox'

  const usernameElement = document.createElement('p')
  usernameElement.className = 'username'
  usernameElement.textContent = username
  
  const messageElement = document.createElement('p')
  messageElement.className = 'message'
  messageElement.textContent = message
  
  messageBoxElement.append(usernameElement)
  messageBoxElement.append(messageElement)
  messageList.append(messageBoxElement)

  chatContainer.scrollTop = chatContainer.scrollHeight
})

inputContainer.addEventListener('submit', (event) => {
  event.preventDefault()
  if (!connected) return window.location.href = '/'
  
  const message = messageInput.value.trim()
  
  if (message.length > 150) return
  if (!message) return
  
  messageInput.value = ''
  websocketClient.emit('messageAdd', ({ message }))
})

websocketClient.on('disconnect', () => {
  window.location.reload()
})

start()