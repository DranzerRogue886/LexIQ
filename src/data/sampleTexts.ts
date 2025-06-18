export interface SampleText {
  id: string;
  title: string;
  category: 'fiction' | 'non-fiction' | 'academic' | 'news' | 'poetry' | 'technical';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  wordCount: number;
  uniqueWords: string[];
}

export const sampleTexts: SampleText[] = [
  {
    id: 'fiction-1',
    title: 'The Mysterious Garden',
    category: 'fiction',
    difficulty: 'beginner',
    content: `Sarah discovered a hidden garden behind her grandmother's house. The old wooden gate was covered in ivy, and when she pushed it open, she found herself in a magical place filled with colorful flowers she had never seen before. Butterflies danced in the sunlight, and a small fountain bubbled quietly in the corner. The air was filled with the sweet scent of roses and lavender. Sarah felt like she had stepped into a fairy tale.`,
    wordCount: 89,
    uniqueWords: ['discovered', 'hidden', 'garden', 'grandmother', 'wooden', 'gate', 'ivy', 'magical', 'colorful', 'flowers', 'butterflies', 'danced', 'sunlight', 'fountain', 'bubbled', 'quietly', 'sweet', 'scent', 'roses', 'lavender', 'fairy', 'tale']
  },
  {
    id: 'non-fiction-1',
    title: 'The Science of Sleep',
    category: 'non-fiction',
    difficulty: 'intermediate',
    content: `Sleep is a complex biological process that affects every aspect of our health and well-being. During sleep, our brains process information, consolidate memories, and repair cellular damage. Research has shown that adequate sleep is essential for cognitive function, emotional regulation, and physical recovery. The sleep cycle consists of several stages, including rapid eye movement (REM) sleep, which is crucial for learning and memory formation.`,
    wordCount: 67,
    uniqueWords: ['complex', 'biological', 'process', 'affects', 'aspect', 'health', 'well-being', 'consolidate', 'memories', 'repair', 'cellular', 'damage', 'adequate', 'essential', 'cognitive', 'function', 'emotional', 'regulation', 'recovery', 'cycle', 'stages', 'rapid', 'movement', 'crucial', 'formation']
  },
  {
    id: 'academic-1',
    title: 'Climate Change and Biodiversity',
    category: 'academic',
    difficulty: 'advanced',
    content: `The unprecedented rate of climate change poses significant challenges to global biodiversity. Ecosystems worldwide are experiencing rapid transformations, with species struggling to adapt to changing environmental conditions. Scientific evidence indicates that rising temperatures, altered precipitation patterns, and increased frequency of extreme weather events are disrupting ecological relationships and threatening species survival. Conservation efforts must address both mitigation and adaptation strategies to preserve Earth's biological diversity.`,
    wordCount: 71,
    uniqueWords: ['unprecedented', 'climate', 'biodiversity', 'ecosystems', 'worldwide', 'experiencing', 'transformations', 'species', 'struggling', 'adapt', 'changing', 'environmental', 'conditions', 'scientific', 'evidence', 'indicates', 'rising', 'temperatures', 'altered', 'precipitation', 'patterns', 'increased', 'frequency', 'extreme', 'weather', 'events', 'disrupting', 'ecological', 'relationships', 'threatening', 'survival', 'conservation', 'efforts', 'address', 'mitigation', 'adaptation', 'strategies', 'preserve', 'biological', 'diversity']
  },
  {
    id: 'news-1',
    title: 'Technology Breakthrough',
    category: 'news',
    difficulty: 'intermediate',
    content: `Scientists have announced a breakthrough in renewable energy technology that could revolutionize how we power our homes and cities. The new solar panel design uses advanced nanotechnology to capture and convert sunlight more efficiently than traditional panels. This innovation could reduce energy costs by up to 40% while significantly decreasing our carbon footprint. The research team expects to begin commercial production within the next two years.`,
    wordCount: 69,
    uniqueWords: ['scientists', 'announced', 'breakthrough', 'renewable', 'energy', 'technology', 'revolutionize', 'power', 'homes', 'cities', 'solar', 'panel', 'design', 'advanced', 'nanotechnology', 'capture', 'convert', 'sunlight', 'efficiently', 'traditional', 'panels', 'innovation', 'reduce', 'costs', 'significantly', 'decreasing', 'carbon', 'footprint', 'research', 'team', 'expects', 'begin', 'commercial', 'production', 'within', 'years']
  },
  {
    id: 'poetry-1',
    title: 'Autumn Whispers',
    category: 'poetry',
    difficulty: 'beginner',
    content: `Golden leaves dance in the crisp autumn air,
Whispering secrets only trees can share.
Crimson and amber paint the forest floor,
As summer's warmth fades forevermore.
Gentle breezes carry nature's song,
While days grow shorter, nights grow long.`,
    wordCount: 42,
    uniqueWords: ['golden', 'leaves', 'dance', 'crisp', 'autumn', 'air', 'whispering', 'secrets', 'trees', 'share', 'crimson', 'amber', 'paint', 'forest', 'floor', 'summer', 'warmth', 'fades', 'forevermore', 'gentle', 'breezes', 'carry', 'nature', 'song', 'shorter', 'nights', 'long']
  },
  {
    id: 'technical-1',
    title: 'Machine Learning Fundamentals',
    category: 'technical',
    difficulty: 'advanced',
    content: `Machine learning algorithms enable computers to learn patterns from data without explicit programming. Supervised learning involves training models on labeled datasets, while unsupervised learning discovers hidden structures in unlabeled data. Deep learning, a subset of machine learning, uses neural networks with multiple layers to process complex information. These techniques are transforming industries from healthcare to finance, enabling predictive analytics and automated decision-making systems.`,
    wordCount: 65,
    uniqueWords: ['machine', 'learning', 'algorithms', 'enable', 'computers', 'patterns', 'data', 'explicit', 'programming', 'supervised', 'involves', 'training', 'models', 'labeled', 'datasets', 'unsupervised', 'discovers', 'hidden', 'structures', 'unlabeled', 'deep', 'subset', 'neural', 'networks', 'multiple', 'layers', 'process', 'complex', 'information', 'techniques', 'transforming', 'industries', 'healthcare', 'finance', 'enabling', 'predictive', 'analytics', 'automated', 'decision-making', 'systems']
  }
];

export const getTextsByCategory = (category: SampleText['category']) => {
  return sampleTexts.filter(text => text.category === category);
};

export const getTextsByDifficulty = (difficulty: SampleText['difficulty']) => {
  return sampleTexts.filter(text => text.difficulty === difficulty);
};

export const getRandomText = () => {
  const randomIndex = Math.floor(Math.random() * sampleTexts.length);
  return sampleTexts[randomIndex];
};

export const getAllUniqueWords = (): string[] => {
  const allWords = sampleTexts.flatMap(text => text.uniqueWords);
  return [...new Set(allWords)].sort();
}; 