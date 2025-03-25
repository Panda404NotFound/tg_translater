// Импортируем расширения для Jest
require('@testing-library/jest-dom');

// Мок для браузерных API
global.fetch = jest.fn();
global.SpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  onresult: null,
  onerror: null,
  onend: null,
}));
global.webkitSpeechRecognition = global.SpeechRecognition;

// Мок для MediaDevices API
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        getTracks: () => [{
          stop: jest.fn()
        }]
      });
    })
  }
});

// Мок для WebRTC API
global.RTCPeerConnection = jest.fn().mockImplementation(() => ({
  createOffer: jest.fn().mockImplementation(() => Promise.resolve({})),
  createAnswer: jest.fn().mockImplementation(() => Promise.resolve({})),
  setLocalDescription: jest.fn().mockImplementation(() => Promise.resolve()),
  setRemoteDescription: jest.fn().mockImplementation(() => Promise.resolve()),
  addIceCandidate: jest.fn().mockImplementation(() => Promise.resolve()),
  addTrack: jest.fn(),
  close: jest.fn(),
  onicecandidate: null,
  ontrack: null,
  oniceconnectionstatechange: null,
  iceConnectionState: 'new',
}));

global.RTCSessionDescription = jest.fn().mockImplementation(() => ({}));
global.RTCIceCandidate = jest.fn().mockImplementation(() => ({}));

// Мок для MediaStream
global.MediaStream = jest.fn().mockImplementation(() => ({
  addTrack: jest.fn(),
  getTracks: () => [{
    stop: jest.fn()
  }]
}));

// Сброс всех моков после каждого теста
afterEach(() => {
  jest.clearAllMocks();
}); 