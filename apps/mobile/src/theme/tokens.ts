export const theme = {
  colors: { green: '#315D49', cream: '#F7F5EF', pale: '#E5EEE7', ink: '#25342B', muted: '#58645D', white: '#FFFFFF', line: '#D8DED6', warning: '#77502C', warningBg: '#F5ECD8', error: '#943C32' },
  space: { xs: 6, sm: 12, md: 20, lg: 28, xl: 40, xxl: 56 },
  type: { small: 14, body: 17, heading: 30, display: 42 },
  radius: { small: 12, card: 24, pill: 100 },
  border: 1, states: { pressed: 0.7, disabled: 0.45 }, shadow: { shadowColor: '#25342B', shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 5 } },
  icons: { mark: '◎', add: '+', back: '←', next: '→' },
} as const;
