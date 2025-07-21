let currentMode = 'username';

const leetMap = {
  a: ['4', '@'],
  b: ['8', '6'],
  e: ['3'],
  g: ['6', '9'],
  i: ['1', '!'],
  o: ['0'],
  s: ['5', '$'],
  t: ['7', '+'],
  z: ['2'],
  h: ['#'],
  l: ['1', '|'],
  c: ['(', '<'],
  d: [')', '>'],
  f: ['7'],
  j: ['1'],
  k: ['<'],
  m: ['|V|'],
  n: ['|\\|'],
  p: ['9'],
  q: ['9'],
  r: ['12'],
  u: ['|_|'],
  v: ['\\/', '|/'],
  w: ['|/|/', 'vv'],
  x: ['><'],
  y: ['`/']
};

const modeConfigs = {
  username: {
    title: 'Username Generator',
    emoji: '👤',
    info: '<strong>Username Mode:</strong> Generates memorable, readable usernames perfect for social media, gaming, and online accounts.',
    minLength: 6,
    options: [
      { id: 'addNumbers', label: 'Add numbers (e.g., 123, 2025)', default: true },
      { id: 'capitalize', label: 'Mixed capitalization', default: true },
      { id: 'addYear', label: 'Add current year', default: false },
      { id: 'reverseWord', label: 'Include reversed word', default: false },
      { id: 'useLeet', label: 'Light leetspeak (a→4, e→3)', default: false },
      { id: 'addUnderscore', label: 'Add underscores', default: false }
    ]
  },
  password: {
    title: 'Password Generator',
    emoji: '🔒',
    info: '<strong>Password Mode:</strong> Generates secure, complex passwords with high entropy for protecting your accounts.',
    minLength: 12,
    options: [
      { id: 'addNumbers', label: 'Add numbers (required)', default: true },
      { id: 'addSymbols', label: 'Add symbols (!@#$%&)', default: true },
      { id: 'useLeet', label: 'Full leetspeak substitutions', default: true },
      { id: 'capitalize', label: 'Random capitalization', default: true },
      { id: 'reverseWord', label: 'Include reversed word', default: false },
      { id: 'addYear', label: 'Add current year', default: false }
    ]
  }
};

function setMode(mode) {
  currentMode = mode;
  const config = modeConfigs[mode];
  
  // Update UI
  document.getElementById('usernameBtn').classList.toggle('active', mode === 'username');
  document.getElementById('passwordBtn').classList.toggle('active', mode === 'password');
  
  document.getElementById('modeInfo').innerHTML = config.info;
  document.getElementById('optionsTitle').textContent = config.title.replace('Generator', 'Options');
  document.getElementById('generateBtn').innerHTML = `✨ Generate ${config.title.replace(' Generator', 's')}`;
  document.getElementById('resultsTitle').innerHTML = `<span>${config.emoji}</span><span>Generated ${config.title.replace(' Generator', 's')}</span>`;
  document.getElementById('minLength').value = config.minLength;
  document.getElementById('minLengthLabel').textContent = mode === 'password' ? 'Minimum Length (Security):' : 'Minimum Length:';
  
  // Update strength meter visibility
  document.getElementById('strengthMeter').style.display = mode === 'password' ? 'block' : 'none';
  
  // Generate options
  const optionsGroup = document.getElementById('optionsGroup');
  optionsGroup.innerHTML = '';
  
  config.options.forEach(option => {
    const div = document.createElement('div');
    div.className = 'checkbox-item';
    div.innerHTML = `
      <input type="checkbox" id="${option.id}" ${option.default ? 'checked' : ''} />
      <label for="${option.id}">${option.label}</label>
    `;
    optionsGroup.appendChild(div);
  });
  
  // Clear results
  clearResults();
}

function toLeet(word, mode = 'full') {
  if (mode === 'light') {
    // Light leetspeak for usernames - only common substitutions
    return word.toLowerCase().replace(/[aei1os]/g, char => {
      const map = { a: '4', e: '3', i: '1', o: '0', s: '5' };
      return Math.random() > 0.5 ? (map[char] || char) : char;
    });
  }
  
  // Full leetspeak for passwords
  let results = [''];
  
  for (let char of word.toLowerCase()) {
    const replacements = leetMap[char] || [];
    const options = [char, ...replacements];
    
    const newResults = [];
    for (let prefix of results) {
      const selectedOptions = options.sort(() => 0.5 - Math.random()).slice(0, 3);
      for (let opt of selectedOptions) {
        newResults.push(prefix + opt);
      }
    }
    results = newResults.slice(0, 20);
  }
  
  return results.slice(0, 10);
}

function randomCapitalize(word) {
  return word.split('').map(char => 
    Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
  ).join('');
}

function calculateStrength(password) {
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 2;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 2;
  
  // Patterns
  if (!/(.)\1{2,}/.test(password)) score += 1;
  if (!/123|abc|qwe/i.test(password)) score += 1;
  
  let strength = 'weak';
  if (score >= 6) strength = 'medium';
  if (score >= 8) strength = 'strong';
  
  return { score, strength, maxScore: 10 };
}

function updateStrengthMeter(passwords) {
  const meter = document.getElementById('strengthMeter');
  const text = document.getElementById('strengthText');
  const fill = document.getElementById('strengthFill');
  
  if (passwords.length === 0 || currentMode === 'username') {
    meter.style.display = 'none';
    return;
  }
  
  const totalScore = passwords.reduce((sum, pwd) => sum + calculateStrength(pwd).score, 0);
  const avgScore = totalScore / passwords.length;
  const percentage = (avgScore / 10) * 100;
  
  let strength = 'weak';
  let color = '#ef4444';
  
  if (avgScore >= 6) {
    strength = 'medium';
    color = '#f59e0b';
  }
  if (avgScore >= 8) {
    strength = 'strong';
    color = '#10b981';
  }
  
  meter.style.display = 'block';
  text.textContent = strength.charAt(0).toUpperCase() + strength.slice(1);
  fill.style.width = percentage + '%';
  fill.style.backgroundColor = color;
}

function generate() {
  const base = document.getElementById("baseWord").value.trim();
  const minLength = parseInt(document.getElementById("minLength").value);
  const maxResults = parseInt(document.getElementById("maxResults").value);

  const resultsGrid = document.getElementById("resultsGrid");
  const clearBtn = document.getElementById("clearBtn");

  if (base === '') {
    alert('Please enter a base word.');
    return;
  }

  // Get current options
  const options = {};
  modeConfigs[currentMode].options.forEach(option => {
    options[option.id] = document.getElementById(option.id).checked;
  });

  let baseWords = [base];
  if (options.reverseWord) baseWords.push(base.split('').reverse().join(''));

  let finalResults = [];
  const currentYear = new Date().getFullYear();

  for (let word of baseWords) {
    let variants = [];
    
    if (options.useLeet) {
      if (currentMode === 'username') {
        variants = [toLeet(word, 'light')];
      } else {
        variants = toLeet(word, 'full');
      }
    } else {
      variants = [word];
    }

    for (let v of variants) {
      let modified = v;

      // Apply capitalization
      if (options.capitalize) {
        modified = randomCapitalize(modified);
      }

      // Add underscores for usernames
      if (options.addUnderscore && currentMode === 'username') {
        if (Math.random() > 0.5) {
          modified = modified.replace(/([a-z])([A-Z])/g, '$1_$2');
        }
      }

      // Add year
      if (options.addYear) {
        modified += currentYear;
      }

      // Add numbers
      if (options.addNumbers) {
        if (currentMode === 'username') {
          const randomNum = Math.floor(Math.random() * 1000);
          modified += randomNum.toString().padStart(2, '0');
        } else {
          const randomNum = Math.floor(Math.random() * 10000);
          modified += randomNum.toString().padStart(3, '0');
        }
      }

      // Add symbols (passwords only)
      if (options.addSymbols && currentMode === 'password') {
        const symbols = ['!', '@', '#', '$', '%', '&', '*', '+', '=', '?'];
        const numSymbols = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numSymbols; i++) {
          modified += symbols[Math.floor(Math.random() * symbols.length)];
        }
      }

      if (modified.length >= minLength) {
        finalResults.push(modified);
      }
    }
  }

  // Remove duplicates and limit results
  finalResults = [...new Set(finalResults)].slice(0, maxResults);

  // Clear previous results
  resultsGrid.innerHTML = '';

  if (finalResults.length === 0) {
    resultsGrid.innerHTML = '<div class="empty-state">No results match your criteria. Try adjusting the minimum length or adding more options.</div>';
    clearBtn.style.display = 'none';
    updateStrengthMeter([]);
    return;
  }

  // Display results
  finalResults.forEach(item => {
    const resultItem = document.createElement('div');
    resultItem.className = `result-item ${currentMode}`;

    const resultText = document.createElement('div');
    resultText.className = 'result-text';
    resultText.textContent = item;

    const resultActions = document.createElement('div');
    resultActions.className = 'result-actions';

    // Add strength indicator for passwords only
    if (currentMode === 'password') {
      const strength = calculateStrength(item);
      const strengthIndicator = document.createElement('span');
      strengthIndicator.className = `strength-indicator strength-${strength.strength}`;
      strengthIndicator.textContent = strength.strength;
      resultActions.appendChild(strengthIndicator);
    }

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(item).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    };

    resultActions.appendChild(copyBtn);
    resultItem.appendChild(resultText);
    resultItem.appendChild(resultActions);
    resultsGrid.appendChild(resultItem);
  });

  clearBtn.style.display = 'block';
  updateStrengthMeter(finalResults);
}

function clearResults() {
  const resultsGrid = document.getElementById("resultsGrid");
  const clearBtn = document.getElementById("clearBtn");
  const strengthMeter = document.getElementById("strengthMeter");
  
  resultsGrid.innerHTML = '<div class="empty-state">Enter a base word and click generate to see results</div>';
  clearBtn.style.display = 'none';
  if (currentMode === 'username') {
    strengthMeter.style.display = 'none';
  }
}

// Generate on Enter key
document.getElementById('baseWord').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    generate();
  }
});

// Initialize with username mode
setMode('username');
