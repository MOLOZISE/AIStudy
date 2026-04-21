import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        secondary: '#5AC8FA',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
