import { PieceColor } from '../types/game';

class SoundManager {
  private moveSound: HTMLAudioElement;
  private captureSound: HTMLAudioElement;
  private kingSound: HTMLAudioElement;
  private victorySound: HTMLAudioElement;
  private defeatSound: HTMLAudioElement;
  private enabled: boolean = true;
  private volume: number = 1;

  constructor() {
    this.moveSound = new Audio('https://cdn.freesound.org/previews/240/240777_4107740-lq.mp3');
    this.captureSound = new Audio('https://cdn.freesound.org/previews/240/240776_4107740-lq.mp3');
    this.kingSound = new Audio('https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3');
    this.victorySound = new Audio('https://cdn.freesound.org/previews/270/270402_5123851-lq.mp3');
    // Nouveau son de défaite plus dramatique
    this.defeatSound = new Audio('https://cdn.freesound.org/previews/366/366111_6687700-lq.mp3');
    
    this.preloadSounds();
  }

  private preloadSounds() {
    const sounds = [
      this.moveSound,
      this.captureSound,
      this.kingSound,
      this.victorySound,
      this.defeatSound
    ];

    sounds.forEach(sound => {
      sound.load();
      sound.volume = this.volume;
      
      // Réinitialiser le son après la lecture pour permettre une relecture rapide
      sound.addEventListener('ended', () => {
        sound.currentTime = 0;
      });
    });
  }

  setVolume(value: number) {
    this.volume = value;
    [
      this.moveSound,
      this.captureSound,
      this.kingSound,
      this.victorySound,
      this.defeatSound
    ].forEach(sound => {
      sound.volume = value;
    });
  }

  getVolume(): number {
    return this.volume;
  }

  private async playSound(sound: HTMLAudioElement) {
    if (!this.enabled) return;

    try {
      sound.currentTime = 0;
      await sound.play();
    } catch (error) {
      console.warn('Erreur de lecture audio:', error);
      // Réessayer une fois en cas d'erreur
      try {
        sound.currentTime = 0;
        await sound.play();
      } catch {
        // Ignorer l'erreur finale
      }
    }
  }

  async playMove() {
    await this.playSound(this.moveSound);
  }

  async playCapture() {
    await this.playSound(this.captureSound);
  }

  async playKing() {
    await this.playSound(this.kingSound);
  }

  async playGameEnd(winner: PieceColor, isAIEnabled: boolean) {
    const isPlayerWin = (winner === 'black' && !isAIEnabled) || (winner === 'black' && isAIEnabled);
    const sound = isPlayerWin ? this.victorySound : this.defeatSound;
    
    // Attendre un petit délai pour éviter le chevauchement avec d'autres sons
    await new Promise(resolve => setTimeout(resolve, 300));
    await this.playSound(sound);
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isSoundEnabled() {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();