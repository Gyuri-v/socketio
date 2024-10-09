// // main.js (프론트엔드 코드)
// import { io } from 'socket.io-client';

// console.log('1');
// // Socket.IO 서버에 연결
// const socket = io("ws://localhost:3001");

// socket.on("connect", () => {
//   console.log("Connected to server");
// });

// socket.on("disconnect", () => {
//   console.log("Disconnected from server");
// });

// // 버튼 클릭 이벤트 처리
// const sendButton = document.getElementById('sendButton');
// const messageInput = document.getElementById('messageInput');

// sendButton.addEventListener('click', () => {
//   console.log('1sdfsd');
//   const message = messageInput.value;
//   if (message) {
//     // 서버로 'input_message' 이벤트로 메시지 전송
//     socket.emit('input_message', message);
//     messageInput.value = '';  // 입력 필드 초기화
//     console.log('message', message);
//   }
// });

console.log('1');
const socket = wsServer("ws://localhost:8081");

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

// 버튼 클릭 이벤트 처리
const sendButton = document.getElementById('sendButton');
const messageInput = document.getElementById('messageInput');

sendButton.addEventListener('click', () => {
  console.log('1');
  const message = messageInput.value;
  if (message) {
    // 서버로 'input_message' 이벤트로 메시지 전송
    socket.emit('input_message', message);
    messageInput.value = '';  // 입력 필드 초기화
  }
});