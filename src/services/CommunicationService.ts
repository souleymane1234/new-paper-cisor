class CommunicationService {
  private balance: number = 1000;
  private currentBet: number = 0;
  private isConnected: boolean = false;
  private listeners: { [key: string]: Function[] } = {};

  constructor() {
    this.init();
  }

  private init() {
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

  private handleMessage(data: any) {
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

  private sendMessage(type: string, data: any) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type,
        data,
        timestamp: Date.now()
      }, '*');
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Méthodes publiques
  public on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  public off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  public getBalance(): number {
    return this.balance;
  }

  public getCurrentBet(): number {
    return this.currentBet;
  }

  public isGameConnected(): boolean {
    return this.isConnected;
  }

  public placeBet(amount: number): boolean {
    if (amount <= this.balance) {
      this.sendMessage('PLACE_BET', { amount });
      return true;
    }
    return false;
  }

  public onGameStart() {
    this.sendMessage('GAME_STARTED', {});
  }

  public onGameEnd(result: 'win' | 'lose' | 'draw', winAmount?: number) {
    this.sendMessage('GAME_ENDED', { result, winAmount });
  }

  public onWin(amount: number) {
    this.sendMessage('GAME_WON', { amount });
  }

  public onLose(amount: number) {
    this.sendMessage('GAME_LOST', { amount });
  }

  public syncBalance() {
    this.sendMessage('REQUEST_BALANCE', {});
  }
}

const communicationService = new CommunicationService();
export default communicationService;
