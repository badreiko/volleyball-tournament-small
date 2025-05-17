/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        accent: '#D53231', // Ярко-красный для кнопок и акцентов
        darkPurple: '#2F0D28', // Тёмный фон или тени
        darkBlue: '#192C57', // Основной текст или элементы
        cyan: '#41A1C7', // Выделение активных элементов
        peach: '#FBCA8B', // Светлый фон или карточки
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};