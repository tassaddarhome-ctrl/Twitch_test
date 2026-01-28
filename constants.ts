export const GEMINI_MODEL_TEXT = 'gemini-3-flash-preview';

export const COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF5', '#FF3333'
];

export const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];