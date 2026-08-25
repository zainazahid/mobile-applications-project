// TMDB genre IDs and display names
export const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

// Subset shown in Discover filter chips
export const DISCOVER_GENRES = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 14, name: 'Fantasy' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 16, name: 'Animation' },
  { id: 80, name: 'Crime' },
  { id: 9648, name: 'Mystery' },
];

// User-selectable favourite genres in Settings
export const PREFERENCE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 14, name: 'Fantasy' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 16, name: 'Animation' },
  { id: 12, name: 'Adventure' },
];

// Movie Picker mood → TMDB genre IDs mapping
// icon refers to MaterialCommunityIcons (MDI) icon names
export const MOOD_MAP = [
  {
    key: 'funny',
    icon: 'emoticon-happy-outline',
    label: 'Something Funny',
    genreIds: [35],
  },
  {
    key: 'scary',
    icon: 'ghost-outline',
    label: 'Something Scary',
    genreIds: [27, 53],
  },
  {
    key: 'romantic',
    icon: 'heart-outline',
    label: 'Something Romantic',
    genreIds: [10749, 18],
  },
  {
    key: 'mindbending',
    icon: 'thought-bubble-outline',
    label: 'Something Mind-Bending',
    genreIds: [878, 9648, 53],
  },
  {
    key: 'exciting',
    icon: 'lightning-bolt',
    label: 'Something Exciting',
    genreIds: [28, 12],
  },
  {
    key: 'emotional',
    icon: 'emoticon-cry-outline',
    label: 'Something Emotional',
    genreIds: [18, 10749],
  },
  {
    key: 'serious',
    icon: 'drama-masks',
    label: 'Something Serious',
    genreIds: [18, 36],
  },
  {
    key: 'surprise',
    icon: 'dice-multiple-outline',
    label: 'Surprise Me',
    genreIds: [],   // no genre filter — pure random
  },
];

export const RUNTIME_OPTIONS = [
  { key: 'short', label: 'Under 90 minutes', max: 89, min: 0 },
  { key: 'medium', label: '90–120 minutes', max: 120, min: 90 },
  { key: 'long', label: 'Over 2 hours', max: null, min: 121 },
  { key: 'any', label: "Doesn't matter", max: null, min: null },
];

export const RATING_OPTIONS = [
  { key: 'any', label: 'Any', value: 0 },
  { key: '6', label: '6+', value: 6 },
  { key: '7', label: '7+', value: 7 },
  { key: '8', label: '8+', value: 8 },
];
