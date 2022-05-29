const registerForm = document.querySelector('#registerForm')
const usernameInput = document.querySelector('#usernameInput')
const roomInput = document.querySelector('#roomInput')

function start() {
  sessionStorage.username = ''
  sessionStorage.room = ''
}

registerForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const username = usernameInput.value.trim().split(/ +/).join` `
  const room = roomInput.value.trim().split(/ +/).join` `
  if (!username || !room) return
  if (username.length > 30 || room.length > 15) return

  sessionStorage.username = username
  sessionStorage.room = room

  window.location.href = '/chat'
})

start()