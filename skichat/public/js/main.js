const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// get username and room from url
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

console.log(username, room)

const socket = io();

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
})

// Join chatroom
socket.emit('joinRoom', { username, room });

// Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);
});

// Message submit
chatForm.addEventListener('submit', e => {
    e.preventDefault();

    // Get message text
    const msg = e.target.elements.msg.value;

    // Emit message to server
    socket.emit('chatMessage', msg);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(msg) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta"> ${msg.username} <span>${msg.time}</span></p>
    <p class="text">
      ${msg.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// add roomname to dom
function outputRoomName(room) {
    roomName.innerText = room;
}

// add users in room to dom
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}