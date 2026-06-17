*, *::before, *::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body {
  margin: 0;
  padding: 0;
  overscroll-behavior: none;
  -webkit-font-smoothing: antialiased;
}

body {
  background: #F7F4EE;
  /* Safe area for notch / home bar */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

button {
  font-family: inherit;
  -webkit-appearance: none;
}

/* Scrollbar hide for day selector */
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
