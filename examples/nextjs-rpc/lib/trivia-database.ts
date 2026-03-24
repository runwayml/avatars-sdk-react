interface TriviaQuestion {
  question: string;
  options: Array<string>;
  answer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const QUESTIONS: Array<TriviaQuestion> = [
  {
    question: 'What is the largest planet in our solar system?',
    options: ['Mars', 'Jupiter', 'Saturn', 'Neptune'],
    answer: 'Jupiter',
    category: 'science',
    difficulty: 'easy',
  },
  {
    question: 'In what year did the Berlin Wall fall?',
    options: ['1987', '1989', '1991', '1993'],
    answer: '1989',
    category: 'history',
    difficulty: 'easy',
  },
  {
    question: 'Which element has the chemical symbol "Au"?',
    options: ['Silver', 'Aluminum', 'Gold', 'Argon'],
    answer: 'Gold',
    category: 'science',
    difficulty: 'easy',
  },
  {
    question: 'What is the capital city of Australia?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
    answer: 'Canberra',
    category: 'geography',
    difficulty: 'medium',
  },
  {
    question: 'Who painted "The Persistence of Memory"?',
    options: ['Pablo Picasso', 'Salvador Dalí', 'Claude Monet', 'Frida Kahlo'],
    answer: 'Salvador Dalí',
    category: 'art',
    difficulty: 'medium',
  },
  {
    question: 'What programming language was created by Brendan Eich in 10 days?',
    options: ['Python', 'Java', 'JavaScript', 'Ruby'],
    answer: 'JavaScript',
    category: 'technology',
    difficulty: 'easy',
  },
  {
    question: 'Which planet has the most moons?',
    options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
    answer: 'Saturn',
    category: 'science',
    difficulty: 'hard',
  },
  {
    question: 'What is the smallest country in the world by area?',
    options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
    answer: 'Vatican City',
    category: 'geography',
    difficulty: 'medium',
  },
  {
    question: 'In which year was the first iPhone released?',
    options: ['2005', '2006', '2007', '2008'],
    answer: '2007',
    category: 'technology',
    difficulty: 'easy',
  },
  {
    question: 'What is the hardest natural substance on Earth?',
    options: ['Topaz', 'Corundum', 'Diamond', 'Quartz'],
    answer: 'Diamond',
    category: 'science',
    difficulty: 'easy',
  },
  {
    question: 'Which composer wrote "The Four Seasons"?',
    options: ['Johann Sebastian Bach', 'Antonio Vivaldi', 'Wolfgang Amadeus Mozart', 'Ludwig van Beethoven'],
    answer: 'Antonio Vivaldi',
    category: 'art',
    difficulty: 'medium',
  },
  {
    question: 'What is the only mammal capable of true flight?',
    options: ['Flying squirrel', 'Bat', 'Sugar glider', 'Colugo'],
    answer: 'Bat',
    category: 'science',
    difficulty: 'easy',
  },
  {
    question: 'Which ancient civilization built Machu Picchu?',
    options: ['Maya', 'Aztec', 'Inca', 'Olmec'],
    answer: 'Inca',
    category: 'history',
    difficulty: 'medium',
  },
  {
    question: 'What does the "HTTP" in a web address stand for?',
    options: [
      'HyperText Transfer Protocol',
      'High-Tech Transfer Process',
      'Hyperlink Text Transport Protocol',
      'Home Tool Transfer Protocol',
    ],
    answer: 'HyperText Transfer Protocol',
    category: 'technology',
    difficulty: 'easy',
  },
  {
    question: 'Which blood type is known as the universal donor?',
    options: ['A+', 'B-', 'AB+', 'O-'],
    answer: 'O-',
    category: 'science',
    difficulty: 'medium',
  },
  {
    question: 'In Greek mythology, who flew too close to the sun?',
    options: ['Daedalus', 'Icarus', 'Perseus', 'Hermes'],
    answer: 'Icarus',
    category: 'history',
    difficulty: 'easy',
  },
  {
    question: 'What is the deepest point in Earth\'s oceans?',
    options: ['Tonga Trench', 'Mariana Trench', 'Puerto Rico Trench', 'Java Trench'],
    answer: 'Mariana Trench',
    category: 'geography',
    difficulty: 'medium',
  },
  {
    question: 'Which scientist proposed the theory of general relativity?',
    options: ['Isaac Newton', 'Niels Bohr', 'Albert Einstein', 'Max Planck'],
    answer: 'Albert Einstein',
    category: 'science',
    difficulty: 'easy',
  },
  {
    question: 'What language has the most native speakers worldwide?',
    options: ['English', 'Hindi', 'Mandarin Chinese', 'Spanish'],
    answer: 'Mandarin Chinese',
    category: 'geography',
    difficulty: 'hard',
  },
  {
    question: 'How many bones are in the adult human body?',
    options: ['186', '206', '226', '256'],
    answer: '206',
    category: 'science',
    difficulty: 'hard',
  },
];

const usedIndices = new Set<number>();

export function getRandomQuestion(category?: string): TriviaQuestion {
  let pool = QUESTIONS.map((q, i) => ({ ...q, _index: i }));

  if (category) {
    const filtered = pool.filter((q) => q.category === category);
    if (filtered.length > 0) pool = filtered;
  }

  const unused = pool.filter((q) => !usedIndices.has(q._index));
  const candidates = unused.length > 0 ? unused : pool;

  if (unused.length === 0) usedIndices.clear();

  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  usedIndices.add(pick._index);

  const { _index: _, ...question } = pick;
  return question;
}
