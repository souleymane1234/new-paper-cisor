import { motion } from "framer-motion";
import { React, useEffect, useState, useCallback, useMemo } from "react";
import confetti from "react-canvas-confetti";
import communicationService from "../services/CommunicationService.js";
import BalanceDisplay from "./BalanceDisplay";

import "../App.css";

import femaleIdle from "../assets/img/female_idle.svg";
import female_paper from "../assets/img/female_paper.svg";
import female_rock from "../assets/img/female_rock.svg";
import female_scissors from "../assets/img/female_scissors.svg";
import male_paper from "../assets/img/male_paper.svg";
import male_rock from "../assets/img/male_rock.svg";
import male_scissors from "../assets/img/male_scissors.svg";
import maleIdle from "../assets/img/male_idle.svg";
import rock_icon from "../assets/img/rock_icon.svg";
import paper_icon from "../assets/img/paper_icon.svg";
import scissors_icon from "../assets/img/scissors_icon.svg";
import random_icon from "../assets/img/random_icon.svg";
import restart from "../assets/img/restart.svg";
import result_cpu from "../assets/img/result_cpu.svg";
import result_user from "../assets/img/result_user.svg";
import user_hp_avatar from "../assets/img/user_hp_avatar.svg";
import cpu_hp_avatar from "../assets/img/cpu_hp_avatar.svg";

const Game = () => {
  // Gestion d'erreur globale et initialisation
  useEffect(() => {
    const handleError = (error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Erreur globale détectée:', error);
      }
      return true; // Empêcher le crash
    };

    const handleUnhandledRejection = (event) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Promesse rejetée non gérée:', event.reason);
      }
      event.preventDefault(); // Empêcher le crash
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Simuler un temps de chargement pour s'assurer que tout est prêt
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      clearTimeout(timer);
    };
  }, []);

  // Check communication service availability
  useEffect(() => {
    try {
      const checkCommunication = () => {
        if (communicationService && typeof communicationService.isGameConnected === 'function') {
          setIsCommunicationAvailable(true);
        } else {
          setIsCommunicationAvailable(false);
        }
      };

      checkCommunication();
      
      // Check again after a delay
      const timer = setTimeout(checkCommunication, 2000);
      
      return () => clearTimeout(timer);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Error checking communication service:', error);
      }
      setIsCommunicationAvailable(false);
    }
  }, []);

  const [userChoice, setUserChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [computerPoints, setComputerPoints] = useState(0);
  const [maleImg, setMaleImg] = useState(maleIdle);
  const [femaleImg, setFemaleImg] = useState(femaleIdle);
  const [result, setResult] = useState("Let's see who wins");
  const [gameOver, setGameOver] = useState(false);
  const [splash, setSplash] = useState(false);
  const [betAmount, setBetAmount] = useState(1000);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [aiDifficulty, setAiDifficulty] = useState(0.7); // 0.7 = 70% de difficulté
  const [currentRound, setCurrentRound] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [totalLosses, setTotalLosses] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommunicationAvailable, setIsCommunicationAvailable] = useState(false);

  const choices = useMemo(() => ["rock", "paper", "scissors"], []);

  // Gestion audio simplifiée et sécurisée
  const playSound = useCallback((soundType) => {
    try {
      // Créer l'audio à la demande pour éviter les problèmes de memfs
      const audio = new Audio();
      audio.volume = 0.3;
      
      // Sons simples basés sur le type
      if (soundType === 'start') {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      } else if (soundType === 'win') {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      } else if (soundType === 'lose') {
        audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      }
      
      audio.play().catch(err => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Erreur audio ignorée:', err);
        }
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Erreur lors de la création audio:', error);
      }
    }
  }, []);

  const generateComputerChoice = useCallback((userChoice = null) => {
    try {
      let computerChoice;
      
      // IA intelligente basée sur l'historique et les patterns
      if (gameHistory.length > 0 && Math.random() < aiDifficulty) {
        // Analyser les patterns du joueur
        const recentChoices = gameHistory.slice(-3).map(game => game.userChoice);
        const choiceFrequency = {
          rock: recentChoices.filter(c => c === 'rock').length,
          paper: recentChoices.filter(c => c === 'paper').length,
          scissors: recentChoices.filter(c => c === 'scissors').length
        };
        
        // Si le joueur a une tendance, l'IA s'adapte
        if (choiceFrequency.rock > choiceFrequency.paper && choiceFrequency.rock > choiceFrequency.scissors) {
          // Joueur préfère pierre, l'IA joue papier
          computerChoice = 'paper';
        } else if (choiceFrequency.paper > choiceFrequency.rock && choiceFrequency.paper > choiceFrequency.scissors) {
          // Joueur préfère papier, l'IA joue ciseaux
          computerChoice = 'scissors';
        } else if (choiceFrequency.scissors > choiceFrequency.rock && choiceFrequency.scissors > choiceFrequency.paper) {
          // Joueur préfère ciseaux, l'IA joue pierre
          computerChoice = 'rock';
        } else {
          // Pas de pattern clair, l'IA joue aléatoirement mais intelligemment
          if (userChoice) {
            // Si on connaît le choix du joueur, l'IA peut contrer
            const counterChoices = {
              rock: 'paper',
              paper: 'scissors',
              scissors: 'rock'
            };
            computerChoice = counterChoices[userChoice];
          } else {
            computerChoice = choices[Math.floor(Math.random() * choices.length)];
          }
        }
      } else {
        // Mode aléatoire pour varier la difficulté
        computerChoice = choices[Math.floor(Math.random() * choices.length)];
      }
      
      setComputerChoice(computerChoice);
      
      if (computerChoice === "scissors") {
        setFemaleImg(female_scissors);
      } else if (computerChoice === "rock") {
        setFemaleImg(female_rock);
      } else {
        setFemaleImg(female_paper);
      }
      
      return computerChoice;
    } catch (error) {
      console.error('Erreur dans generateComputerChoice:', error);
      return "rock";
    }
  }, [choices, gameHistory, aiDifficulty]);

  const handleClick = useCallback((value) => {
    try {
      if (gameOver || !gameStarted) return;
      
      setUserChoice(value);
      const computerChoice = generateComputerChoice(value);
      
      if (value === "scissors") {
        setMaleImg(male_scissors);
      } else if (value === "rock") {
        setMaleImg(male_rock);
      } else if (value === "paper") {
        setMaleImg(male_paper);
      }
      
      // Déterminer le résultat du round
      let roundResult = 'draw';
      let roundEarnings = 0;
      
      if (
        (value === "scissors" && computerChoice === "paper") ||
        (value === "rock" && computerChoice === "scissors") ||
        (value === "paper" && computerChoice === "rock")
      ) {
        roundResult = 'win';
        roundEarnings = 0; // Pas de gain pendant la partie
        const updatedUserPoints = userPoints + 1;
        setUserPoints(updatedUserPoints);
        
        if (updatedUserPoints === 5) {
          setResult("You Win");
          // Gain total à la fin de la partie
          const totalWinAmount = betAmount * 2;
          communicationService.onWin(totalWinAmount);
          setTotalEarnings(prev => prev + totalWinAmount);
          setTimeout(() => {
            setGameOver(true);
            playSound('win');
          }, 1000);
        }
      } else if (
        (value === "paper" && computerChoice === "scissors") ||
        (value === "scissors" && computerChoice === "rock") ||
        (value === "rock" && computerChoice === "paper")
      ) {
        roundResult = 'lose';
        roundEarnings = 0; // Pas de perte pendant la partie
        const updatedComputerPoints = computerPoints + 1;
        setComputerPoints(updatedComputerPoints);
        
        if (updatedComputerPoints === 5) {
          setResult("You Lose");
          // Perte totale à la fin de la partie
          communicationService.onLose(betAmount);
          setTotalEarnings(prev => prev - betAmount);
          setTimeout(() => {
            setGameOver(true);
            playSound('lose');
          }, 1000);
        }
      }
      
      // Ajouter le round à l'historique
      const newRound = {
        round: currentRound + 1,
        userChoice: value,
        computerChoice: computerChoice,
        result: roundResult,
        earnings: roundEarnings,
        timestamp: Date.now()
      };
      
      setGameHistory(prev => [...prev, newRound]);
      setCurrentRound(prev => prev + 1);
      
      // Mettre à jour les statistiques locales
      if (roundResult === 'win') {
        setTotalWins(prev => prev + 1);
        setTotalEarnings(prev => prev + roundEarnings);
      } else if (roundResult === 'lose') {
        setTotalLosses(prev => prev + 1);
        setTotalEarnings(prev => prev + roundEarnings);
      }
      
    } catch (error) {
      console.error('Erreur dans handleClick:', error);
    }
  }, [gameOver, gameStarted, userPoints, computerPoints, generateComputerChoice, playSound, betAmount, currentRound]);

  const randomClick = useCallback(() => {
    try {
      if (gameOver) return;
      
      const randomChoice = choices[Math.floor(Math.random() * choices.length)];
      handleClick(randomChoice);
    } catch (error) {
      console.error('Erreur dans randomClick:', error);
    }
  }, [gameOver, choices, handleClick]);

  const handleReset = useCallback(() => {
    try {
      playSound('start');
      setGameOver(false);
      setGameStarted(false);
      setUserPoints(0);
      setComputerPoints(0);
      setUserChoice(null);
      setComputerChoice(null);
      setMaleImg(maleIdle);
      setFemaleImg(femaleIdle);
      setResult("Let's see who wins");
      setCurrentRound(0);
      setGameHistory([]);
    } catch (error) {
      console.error('Erreur dans handleReset:', error);
    }
  }, [playSound]);

  const handleStartGame = useCallback(() => {
    try {
      setSplash(true);
      playSound('start');
    } catch (error) {
      console.error('Erreur dans handleStartGame:', error);
      setSplash(true);
    }
  }, [playSound]);

  const handlePlaceBet = useCallback(() => {
    try {
      communicationService.placeBet(betAmount);
      // La réponse sera gérée via les événements
    } catch (error) {
      console.error('Erreur lors du placement de la mise:', error);
    }
  }, [betAmount]);

  // Écouter les réponses de mise
  useEffect(() => {
    const handleBetPlaced = () => {
      setGameStarted(true);
      communicationService.onGameStart();
      playSound('start');
    };

    const handleBetRejected = (reason) => {
      if (reason === 'insufficient_balance') {
        alert('Solde insuffisant pour cette mise !');
      } else {
        alert('Erreur lors du placement de la mise !');
      }
    };

    communicationService.on('betPlaced', handleBetPlaced);
    communicationService.on('betRejected', handleBetRejected);

    return () => {
      communicationService.off('betPlaced', handleBetPlaced);
      communicationService.off('betRejected', handleBetRejected);
    };
  }, [playSound]);

  return (
    <>
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1419 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              animation: 'pulse 1.5s infinite'
            }}>
              ✂️
            </div>
            <h2 style={{
              margin: '0 0 10px 0',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              Chargement...
            </h2>
            <div style={{
              width: '40px',
              height: '4px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '2px',
              margin: '0 auto',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '40px',
                height: '100%',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                animation: 'loading 1.5s infinite'
              }}></div>
            </div>
          </div>
        </div>
      )}
      <BalanceDisplay position="top-right" />
      {splash && (
        <div className="App">
          {!gameOver && (
            <>
              {!gameStarted && (
                <div style={{
                  position: 'fixed',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1419 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1001
                }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '40px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    textAlign: 'center',
                    maxWidth: '400px',
                    width: '90%',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '20px'
                    }}>
                      ✂️
                    </div>
                    <h2 style={{
                      margin: '0 0 10px 0',
                      fontSize: '28px',
                      fontWeight: 'bold',
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Pierre-Papier-Ciseaux
                    </h2>
                    <p style={{
                      margin: '0 0 30px 0',
                      color: '#ccc',
                      fontSize: '16px'
                    }}>
                      Placez votre mise et affrontez l'IA
                    </p>
                    
                    <div style={{
                      marginBottom: '25px'
                    }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '10px',
                        fontSize: '18px',
                        fontWeight: 'bold'
                      }}>
                        Montant de la mise
                      </label>
                      <div style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(Number(e.target.value))}
                          min="100"
                          max="100000"
                          style={{
                            width: '100%',
                            padding: '15px 20px',
                            borderRadius: '15px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            fontSize: '18px',
                            textAlign: 'center',
                            outline: 'none',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#667eea';
                            e.target.style.background = 'rgba(255,255,255,0.15)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                            e.target.style.background = 'rgba(255,255,255,0.1)';
                          }}
                        />
                        <span style={{
                          position: 'absolute',
                          right: '15px',
                          color: '#667eea',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}>
                          FCFA
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      marginBottom: '25px',
                      justifyContent: 'center'
                    }}>
                      {[100, 500, 1000, 2500, 5000, 10000].map(amount => (
                        <button
                          key={amount}
                          onClick={() => setBetAmount(amount)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.3)',
                            background: betAmount === amount ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.1)',
                            color: 'white',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (betAmount !== amount) {
                              e.target.style.background = 'rgba(255,255,255,0.2)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (betAmount !== amount) {
                              e.target.style.background = 'rgba(255,255,255,0.1)';
                            }
                          }}
                        >
                          {amount} FCFA
                        </button>
                      ))}
                    </div>

                    <div style={{
                      background: 'rgba(255,255,255,0.1)',
                      padding: '15px',
                      borderRadius: '15px',
                      marginBottom: '25px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      <h4 style={{
                        margin: '0 0 10px 0',
                        fontSize: '16px',
                        color: '#667eea'
                      }}>
                        Règles du jeu
                      </h4>
                      <div style={{
                        fontSize: '14px',
                        lineHeight: '1.5',
                        color: '#ccc'
                      }}>
                        <div>🎯 <strong>Victoire:</strong> +{betAmount * 2} FCFA (premier à 5 points)</div>
                        <div>💔 <strong>Défaite:</strong> -{betAmount} FCFA (premier à 5 points)</div>
                        <div>⚖️ <strong>Match nul:</strong> Remise en jeu</div>
                        <div>🏆 <strong>Objectif:</strong> Premier à 5 points</div>
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceBet}
                      style={{
                        width: '100%',
                        padding: '18px',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '15px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                      }}
                    >
                      🚀 Commencer le jeu
                    </button>
                  </div>
                </div>
              )}
              <div className="game">

                
                <div className="top">
                  <motion.img
                    key={computerChoice}
                    src={femaleImg}
                    alt=""
                    transition={{
                      ease: "easeOut",
                      duration: 0.5,
                    }}
                    initial={{ y: -200 }}
                    animate={{ y: -50 }}
                  />
                </div>
                <div className="bottom">
                  <motion.img
                    src={maleImg}
                    key={userChoice}
                    alt=""
                    transition={{ ease: "easeOut", duration: 0.5 }}
                    initial={{ y: 200 }}
                    animate={{ y: 50 }}
                  />
                </div>
                <div className="ui">
                  <div className="ui-box">
                    <img
                      src={rock_icon}
                      alt=""
                      className="rock_icon"
                      onClick={() => handleClick(choices[0])}
                    />
                    <img
                      src={paper_icon}
                      alt=""
                      className="paper_icon"
                      onClick={() => handleClick(choices[1])}
                    />
                    <img
                      src={scissors_icon}
                      alt=""
                      className="scissors_icon"
                      onClick={() => handleClick(choices[2])}
                    />
                    <img
                      src={random_icon}
                      alt=""
                      className="random_icon"
                      onClick={randomClick}
                    />
                  </div>
                </div>
              </div>
              <div className="score">
                <div className="hp-box-user">
                  <div className="hp-box-inner-user">
                    <progress
                      className="user-hp"
                      value={5 - computerPoints}
                      max="5"
                    ></progress>
                    <motion.img
                      src={user_hp_avatar}
                      className="user_hp_avatar"
                      alt=""
                      key={computerPoints}
                      animate={{
                        rotate: [0, 0, 20, 20, 0, 20, 20, 0],
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                <div className="hp-box-cpu">
                  <div className="hp-box-inner-user">
                    <progress
                      className="user-hp cpu"
                      value={5 - userPoints}
                      max="5"
                    ></progress>
                    <motion.img
                      src={cpu_hp_avatar}
                      className="cpu_hp_avatar"
                      alt=""
                      key={userPoints}
                      animate={{
                        rotate: [0, 0, 20, 20, 0, 20, 20, 0],
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          {gameOver && (
            <div style={{
              position: 'fixed',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1002
            }}>
              <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '15px',
                textAlign: 'center',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
              }}>
                <h2 style={{
                  margin: '0 0 20px 0',
                  fontSize: '32px',
                  color: result === "You Win" ? '#4CAF50' : '#f44336'
                }}>
                  {result}
                </h2>
                
                <p style={{ margin: '0 0 30px 0', fontSize: '18px' }}>
                  Score: {computerPoints} - {userPoints}
                </p>
                
                <button
                  onClick={handleReset}
                  style={{
                    padding: '15px 30px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Rejouer
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {!splash && (
        <motion.div
          className="splash"
          initial={{ y: 1000 }}
          transition={{ duration: 1 }}
          animate={{ y: 0 }}
        >
          <motion.button
            onClick={handleStartGame}
            animate={{
              rotate: [0, 0, 10, -10, 0],
            }}
            transition={{ repeat: Infinity, duration: 1.2, delay: 1 }}
          >
            Start The Game!!
          </motion.button>
        </motion.div>
      )}
    </>
  );
};

export default Game;
