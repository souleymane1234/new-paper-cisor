class CommunicationService {
  constructor() {
    this.balance = 1000;
    this.currentBet = 0;
    this.isConnected = false;
    this.listeners = {};

    this.init();
  }

  init() {
    // Écouter les messages de la plateforme parente
    window.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });

    // Notifier la plateforme que le jeu est prêt
    this.sendMessage('GAME_READY', {});
    
    // Vérifier la connexion périodiquement
    setInterval(() => {
      this.sendMessage('PING', {});
    }, 5000);
  }

  handleMessage(data) {
    console.log('Message reçu:', data);

    switch (data.type) {
      case 'BALANCE_UPDATE':
        this.balance = data.balance;
        this.emit('balanceUpdate', this.balance);
        break;
      
      case 'BET_PLACED':
        this.currentBet = data.amount;
        this.emit('betPlaced', this.currentBet);
        break;
      
      case 'BET_REJECTED':
        this.emit('betRejected', data.reason);
        break;
      
      case 'PONG':
        this.isConnected = true;
        this.emit('connected', true);
        break;
      
      case 'GAME_START':
        this.emit('gameStart', data);
        break;
      
      case 'GAME_END':
        this.emit('gameEnd', data);
        break;
    }
  }

  sendMessage(type, data) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type,
        data,
        timestamp: Date.now()
      }, '*');
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Méthodes publiques
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  getBalance() {
    return this.balance;
  }

  getCurrentBet() {
    return this.currentBet;
  }

  isGameConnected() {
    return this.isConnected;
  }

  placeBet(amount) {
    this.sendMessage('PLACE_BET', { amount });
    return true; // La validation se fait côté plateforme
  }

  onGameStart() {
    this.sendMessage('GAME_STARTED', {});
  }

  onGameEnd(result, winAmount) {
    this.sendMessage('GAME_ENDED', { result, winAmount });
  }

  onWin(amount) {
    this.sendMessage('GAME_WON', { amount });
  }

  onLose(amount) {
    this.sendMessage('GAME_LOST', { amount });
  }

  syncBalance() {
    this.sendMessage('REQUEST_BALANCE', {});
  }
}

const communicationService = new CommunicationService();
export default communicationService;
