/* Emblema SVG din logo. Prăjiturile folosesc poze reale (img/, vezi credite-foto.json). */
window.DESEN = (function () {
  /** Emblema rotundă din logo: o felie pe fond roșu. */
  function emblema() {
    return `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="24" fill="#e8432e"/>
      <polygon points="11,30 29,30 37,25 19,25" fill="#fffaf0"/>
      <rect x="11" y="30" width="18" height="3" fill="#d9a55a"/>
      <rect x="11" y="33" width="18" height="5" fill="#f6dc7a"/>
      <rect x="11" y="38" width="18" height="2.5" fill="#d9a55a"/>
      <polygon points="29,30 37,25 37,35.5 29,40.5" fill="#c99a3a"/>
      <path d="M17,19 q3,-6 0,-11 M24,19 q3,-6 0,-11 M31,19 q3,-6 0,-11" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".9"/>
    </svg>`;
  }

  return { emblema };
})();
