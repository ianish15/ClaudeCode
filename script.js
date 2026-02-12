// ===== Mobile Navigation Toggle =====
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Close mobile nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// ===== Scroll-triggered Fade-in Animations =====
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -40px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// Apply fade-in to major content blocks
document.querySelectorAll(
  '.about-text, .about-stats, .species-card, .fact-item, .habitat-card, .conservation-content, .quiz-container'
).forEach(el => {
  el.classList.add('fade-in');
  fadeObserver.observe(el);
});

// ===== Animated Number Counters =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => {
  counterObserver.observe(el);
});

function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1500;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);

    el.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ===== Hummingbird Personality Quiz =====
const quizQuestions = [
  {
    question: 'How do you start your mornings?',
    options: [
      { text: 'Up at dawn, ready to seize the day', species: 'ruby' },
      { text: 'Slowly — I savor the quiet moments', species: 'bee' },
      { text: 'Whatever the day calls for — I adapt', species: 'annas' },
      { text: 'I need a solid routine before I can function', species: 'sword' }
    ]
  },
  {
    question: 'At a party, you\'re most likely to\u2026',
    options: [
      { text: 'Make a dramatic entrance', species: 'annas' },
      { text: 'Find one person and have a deep conversation', species: 'bee' },
      { text: 'Work the room — everyone knows your name', species: 'fiery' },
      { text: 'Hang back and observe from the snack table', species: 'giant' }
    ]
  },
  {
    question: 'Pick your ideal vacation:',
    options: [
      { text: 'An epic cross-country road trip', species: 'ruby' },
      { text: 'A misty mountain retreat in the clouds', species: 'fiery' },
      { text: 'A challenging high-altitude expedition', species: 'sword' },
      { text: 'A relaxed trip at my own pace', species: 'giant' }
    ]
  },
  {
    question: 'Your friends would describe you as:',
    options: [
      { text: 'Bold and unstoppable', species: 'ruby' },
      { text: 'Wonderfully unique', species: 'sword' },
      { text: 'Vibrant and full of surprises', species: 'fiery' },
      { text: 'Small but mighty', species: 'bee' }
    ]
  },
  {
    question: 'Pick a superpower:',
    options: [
      { text: 'Super speed', species: 'ruby' },
      { text: 'Shrink to any size', species: 'bee' },
      { text: 'Fearless acrobatics', species: 'annas' },
      { text: 'Incredible endurance', species: 'giant' }
    ]
  }
];

const quizResults = {
  ruby: {
    name: 'Ruby-throated Hummingbird',
    latin: 'Archilochus colubris',
    img: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Archilochus_colubris_%28Male%29.jpg',
    desc: 'You\'re bold, energetic, and always on the move. Like the Ruby-throated Hummingbird — which crosses 800 km of open ocean in a single flight — nothing can stop you once you set your sights on a goal.'
  },
  bee: {
    name: 'Bee Hummingbird',
    latin: 'Mellisuga helenae',
    img: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Bee_hummingbird_%28Mellisuga_helenae%29_immature_male.jpg',
    desc: 'You prove that great things come in small packages. Like the world\'s smallest bird, you may be quiet and unassuming, but you have a depth and intensity that surprises everyone who gets to know you.'
  },
  annas: {
    name: 'Anna\'s Hummingbird',
    latin: 'Calypte anna',
    img: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Anna%27s_hummingbird.jpg',
    desc: 'You\'re adaptable, dramatic, and love to put on a show. Like Anna\'s Hummingbird — famous for its jaw-dropping 10G power dives — you thrive on making an impression and living life on your own terms.'
  },
  sword: {
    name: 'Sword-billed Hummingbird',
    latin: 'Ensifera ensifera',
    img: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Sword-billed_hummingbird_%28Ensifera_ensifera%29_Caldas.jpg',
    desc: 'You\'re one of a kind — a true specialist. Like the only bird whose bill is longer than its body, you\'ve carved out a unique niche in the world that no one else can fill. Your dedication to your craft is unmatched.'
  },
  fiery: {
    name: 'Fiery-throated Hummingbird',
    latin: 'Panterpe insignis',
    img: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Fiery-throated_Hummingbird.jpg',
    desc: 'You\'re vibrant, social, and full of surprises. Like the Fiery-throated Hummingbird — whose throat shifts through every color of the rainbow — people never know what dazzling side of you they\'ll see next.'
  },
  giant: {
    name: 'Giant Hummingbird',
    latin: 'Patagona gigas',
    img: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Patagona_gigas.jpg',
    desc: 'You\'re calm, steady, and impressively resilient. Like the Giant Hummingbird — which soars through the Andes at its own measured pace — you don\'t rush, but you always get where you\'re going.'
  }
};

(function initQuiz() {
  let currentQuestion = 0;
  const scores = {};

  const content = document.getElementById('quizContent');
  const result = document.getElementById('quizResult');
  const progressBar = document.getElementById('quizProgressBar');
  const stepText = document.getElementById('quizStep');
  const restartBtn = document.getElementById('quizRestart');

  if (!content) return;

  function renderQuestion() {
    const q = quizQuestions[currentQuestion];
    progressBar.style.width = ((currentQuestion + 1) / quizQuestions.length * 100) + '%';
    stepText.textContent = currentQuestion + 1;

    let html = '<h3 class="quiz-question">' + q.question + '</h3><div class="quiz-options">';
    q.options.forEach(function(opt, i) {
      html += '<button class="quiz-option" data-index="' + i + '">' + opt.text + '</button>';
    });
    html += '</div>';
    content.innerHTML = html;

    content.querySelectorAll('.quiz-option').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.getAttribute('data-index'), 10);
        var species = q.options[idx].species;
        scores[species] = (scores[species] || 0) + 1;
        currentQuestion++;
        if (currentQuestion < quizQuestions.length) {
          renderQuestion();
        } else {
          showResult();
        }
      });
    });
  }

  function showResult() {
    content.style.display = 'none';
    document.querySelector('.quiz-progress').style.display = 'none';
    document.querySelector('.quiz-progress-text').style.display = 'none';

    var topSpecies = Object.keys(scores).reduce(function(a, b) {
      return scores[a] >= scores[b] ? a : b;
    }, 'ruby');

    var data = quizResults[topSpecies];
    document.getElementById('resultImg').src = data.img;
    document.getElementById('resultImg').alt = data.name;
    document.getElementById('resultName').textContent = 'You are the ' + data.name + '!';
    document.getElementById('resultLatin').textContent = data.latin;
    document.getElementById('resultDesc').textContent = data.desc;
    result.style.display = 'block';
  }

  restartBtn.addEventListener('click', function() {
    currentQuestion = 0;
    for (var key in scores) { delete scores[key]; }
    result.style.display = 'none';
    content.style.display = 'block';
    document.querySelector('.quiz-progress').style.display = 'block';
    document.querySelector('.quiz-progress-text').style.display = 'block';
    renderQuestion();
  });

  renderQuestion();
})();

// ===== Smooth Scroll for Safari (fallback) =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
      e.preventDefault();
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
