const registerContainer = document.querySelector('#registerContainer')
const registerForm = document.querySelector('#registerForm')
const usernameInput = document.querySelector('#usernameInput')
const messageList = document.querySelector('#messageList')
const inputContainer = document.querySelector('#inputContainer')
const messageInput = document.querySelector('#messageInput')
const chatContainer = document.querySelector('#chatContainer')
const userCounter = document.querySelector('#userCounter')

const websocketClient = io()
let connected = false

async function updateUserCounter() {
  const response = await fetch('/api/user_counter')
  const data = await response.json()

  userCounter.textContent = `${data.online} users online!`
}

registerForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const username = usernameInput.value.trim().split(/ +/).join` `
  
  if (username.length > 30) return
  if (!username) return

  registerForm.style.display = 'none'
  websocketClient.emit('newUser', {
    username
  })
})

websocketClient.on('userConfirm', () => {
  connected = true
  registerContainer.style.display = 'none'
})

function sendSystemMessage(message) {
  const systemMessageElement = document.createElement('li')
  systemMessageElement.className = 'systemMessage'
  systemMessageElement.textContent = message
  
  messageList.append(systemMessageElement)
  
  chatContainer.scrollTop = chatContainer.scrollHeight
}

websocketClient.on('userAdded', ({ username }) => {
  if (!connected) return
  
  sendSystemMessage(`${username} entered the chat!`)
  updateUserCounter()
})

websocketClient.on('userRemoved', ({ username }) => {
  if (!connected) return
  
  sendSystemMessage(`${username} left the chat!`)
  updateUserCounter()
})

websocketClient.on('messageAdded', ({ username, message }) => {
  if (!connected) return
  
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
  if (!connected) return
  
  const message = messageInput.value.trim()
  
  if (message.length > 150) return
  if (!message) return
  
  messageInput.value = ''
  websocketClient.emit('messageAdd', ({ message }))
})

websocketClient.on('disconnect', () => {
  document.location.reload()
})

updateUserCounter()