export const theme = {
  colors: {
    green: '#315D49', cream: '#F8F7F2', pale: '#E7EEDC', ink: '#252E43', muted: '#5E6673',
    white: '#FFFFFF', line: '#E3E5DD', lavender: '#E8E3F4', butter: '#F8EAB7', peach: '#F3E4D9',
    warning: '#77502C', warningBg: '#F5ECD8', error: '#943C32',
  },
  classification: {
    '1': { background: '#E7EEDC', accent: '#315D49' },
    '2': { background: '#F8EAB7', accent: '#77502C' },
    '3': { background: '#F8E5DC', accent: '#8A493E' },
    '4': { background: '#F7DFE2', accent: '#8D3E49' },
    indeterminate: { background: '#E9E9E6', accent: '#5E6673' },
  },
  space: { xs: 6, sm: 12, md: 20, lg: 28, xl: 40, xxl: 56 },
  type: { small: 14, body: 17, heading: 32, display: 38 },
  radius: { small: 16, card: 32, pill: 100 },
  border: 1, states: { pressed: 0.75, disabled: 0.5 }, shadow: { shadowColor: '#252E43', shadowOpacity: 0.045, shadowRadius: 20, shadowOffset: { width: 0, height: 7 } },
  icons: { mark: '◎', add: '+', back: '←', next: '→' },
} as const;
