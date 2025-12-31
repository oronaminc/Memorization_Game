const app = {
  words: [],
  mode: 'flashcards', // 'flashcards' or 'quiz'
  currentIndex: 0,
  isFlipped: false,
  score: 0,
  quizOptions: [],
  correctOptionIndex: -1,

  async init() {
    this.cacheDOM();
    this.bindEvents();
    
    try {
      const response = await fetch('words.json');
      if (!response.ok) throw new Error("Failed to load");
      this.words = await response.json();
    } catch (e) {
      console.warn("Could not load words.json, using fallback data.", e);
      // Fallback data for testing/offline
      this.words = [
        { word: "Serendipity", abbreviation: "Seren", meaning: "Good luck in finding valuable things unintentionally." },
        { word: "Ephemeral", abbreviation: "Eph", meaning: "Lasting for a very short time." },
        { word: "Ubiquitous", abbreviation: "Ubiq", meaning: "Found everywhere." },
        { word: "Mellifluous", abbreviation: "Mel", meaning: "Sweet or musical; pleasant to hear." },
        { word: "Labyrinthine", abbreviation: "Lab", meaning: "Irregular and twisting." }
      ];
    }

    if (this.words.length > 0) {
      this.render();
    } else {
      this.dom.container.innerHTML = "No words loaded.";
    }
  },

  cacheDOM() {
    this.dom = {
      container: document.getElementById('game-container'),
      btnFlashcards: document.getElementById('btn-flashcards'),
      btnQuiz: document.getElementById('btn-quiz'),
    };
  },

  bindEvents() {
    this.dom.btnFlashcards.addEventListener('click', () => this.switchMode('flashcards'));
    this.dom.btnQuiz.addEventListener('click', () => this.switchMode('quiz'));
  },

  switchMode(newMode) {
    if (this.mode === newMode) return;
    this.mode = newMode;
    this.currentIndex = 0;
    this.isFlipped = false;
    this.score = 0;
    
    // Update Nav
    this.dom.btnFlashcards.classList.toggle('active', newMode === 'flashcards');
    this.dom.btnQuiz.classList.toggle('active', newMode === 'quiz');

    if (newMode === 'quiz') {
      this.prepareQuizRound();
    }

    this.render();
  },

  render() {
    this.dom.container.innerHTML = '';
    
    if (this.mode === 'flashcards') {
      this.renderFlashcard();
    } else {
      this.renderQuiz();
    }
  },

  /* --- FLASHCARD LOGIC --- */
  renderFlashcard() {
    const word = this.words[this.currentIndex];
    
    const container = document.createElement('div');
    container.className = 'card-container';
    
    container.innerHTML = `
      <div class="card ${this.isFlipped ? 'flipped' : ''}">
        <div class="card-face card-front">
          <div class="word-text">${word.word}</div>
          <div class="abbr-text">${word.abbreviation}</div>
          <div style="margin-top:20px; font-size: 0.9rem; color: #94a3b8;">(Click to flip)</div>
        </div>
        <div class="card-face card-back">
          <div class="meaning-text">${word.meaning}</div>
        </div>
      </div>
    `;

    container.addEventListener('click', () => {
      this.isFlipped = !this.isFlipped;
      this.render(); // Re-render to update class
    });

    const controls = document.createElement('div');
    controls.className = 'controls';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'action-btn';
    prevBtn.textContent = '← Prev';
    prevBtn.onclick = (e) => { e.stopPropagation(); this.prevCard(); };

    const nextBtn = document.createElement('button');
    nextBtn.className = 'action-btn primary';
    nextBtn.textContent = 'Next →';
    nextBtn.onclick = (e) => { e.stopPropagation(); this.nextCard(); };

    controls.append(prevBtn, nextBtn);
    
    this.dom.container.append(container, controls);
  },

  nextCard() {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
      this.isFlipped = false;
      this.render();
    } else {
       // Loop back or finish? Let's loop for now
       this.currentIndex = 0;
       this.isFlipped = false;
       this.render();
    }
  },

  prevCard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isFlipped = false;
      this.render();
    }
  },

  /* --- QUIZ LOGIC --- */
  prepareQuizRound() {
    const currentWord = this.words[this.currentIndex];
    // Pick 3 random distractors
    const others = this.words.filter((_, i) => i !== this.currentIndex);
    // Shuffle others and pick 3
    const distractors = others.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    const options = [...distractors, currentWord];
    // Shuffle options
    this.quizOptions = options.sort(() => 0.5 - Math.random());
    this.correctOptionIndex = this.quizOptions.indexOf(currentWord);
    this.hasAnswered = false;
  },

  renderQuiz() {
    const currentWord = this.words[this.currentIndex];
    
    const quizDiv = document.createElement('div');
    quizDiv.className = 'quiz-container';
    
    quizDiv.innerHTML = `
      <div class="question-text">What does <span style="color:#38bdf8; font-weight:bold;">${currentWord.word}</span> mean?</div>
      <div class="options-grid" id="options-grid"></div>
      <div class="controls" id="quiz-controls" style="visibility: hidden;">
        <button class="action-btn primary" id="next-q-btn">Next Question →</button>
      </div>
    `;

    const grid = quizDiv.querySelector('#options-grid');
    
    this.quizOptions.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt.meaning;
      btn.onclick = () => this.handleAnswer(idx, btn, grid);
      grid.appendChild(btn);
    });

    // Bind next button
    const nextBtn = quizDiv.querySelector('#next-q-btn');
    nextBtn.onclick = () => {
      this.nextQuizQuestion();
    };

    if (this.hasAnswered) {
       // Re-apply states if re-rendering (though we usually don't full re-render in quiz interaction, but good for safety)
       quizDiv.querySelector('#quiz-controls').style.visibility = 'visible';
       // We'd need to re-mark matched buttons here if we strictly followed re-render logic.
       // For simplicity in this vanilla implementation, we'll rely on handleAnswer to manipulate DOM directly.
    }

    this.dom.container.append(quizDiv);
  },

  handleAnswer(idx, btn, grid) {
    if (this.hasAnswered) return;
    this.hasAnswered = true;
    
    const allBtns = grid.querySelectorAll('.option-btn');
    
    if (idx === this.correctOptionIndex) {
      btn.classList.add('correct');
      // maybe play sound?
    } else {
      btn.classList.add('wrong');
      // Highlight correct one
      allBtns[this.correctOptionIndex].classList.add('correct');
    }

    document.getElementById('quiz-controls').style.visibility = 'visible';
  },

  nextQuizQuestion() {
    // Just random next question or sequential? Sequential is fine.
    this.currentIndex = (this.currentIndex + 1) % this.words.length;
    this.prepareQuizRound();
    this.render();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
