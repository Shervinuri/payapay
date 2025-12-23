/**
 * SHΞN™ API Key Manager - Phantom Edition
 */

const GEMINI_KEYS = [
  "AIzaSyAPtBLORJurabBogkau9Qzmxu1LwL-BHUk",
  "AIzaSyAd4f8femLuXFDIC6K52Gdz2H1R1eqB0Yg",
  "AIzaSyD-j8tztOKHdey_jdF6eILymqSICxpMCXw",
  "AIzaSyDud_JXcH9wHEhCixMfqcloQ1kench84Bg",
  "AIzaSyBfdPXxvX6EPEBdynqJZONafpoHW8RcJoQ",
  "AIzaSyCxEeY8Ma7C5K6g5GuqF0Qi45XMOOox-Ko",
  "AIzaSyAedlydsHYYmq3g3vM1R5io8eVDGhvL5I4",
  "AIzaSyB-teuLmY0TM4IXVebladMJGbEvZQnTakw",
  "AIzaSyB3J_zoDvY5TDNVOzAHe_JvXDYmyEsC6nI",
  "AIzaSyDGFOk31BX20g91iODYrUGbs5y8HGbnHns",
  "AIzaSyC78rpRgXtQCjSjxzwed8-roVz02gz7G9k",
  "AIzaSyBRWbQwZ2FMsCFT8rGGAGMy-FNXPyMFnYQ",
  "AIzaSyAfdSjyViGbtyktFAyRudfkNyW-rLFbpoI",
  "AIzaSyAvl7mBKFL3xm9hxUbSaOdF2a48OCqLJvY",
  "AIzaSyD9HtVplqbCG_nVROt1xedz6YO0o1UICwc",
  "AIzaSyAuL94ws2_XOwutCg6F0AawkZCsOS3JWNU",
  "AIzaSyDtbcAlT4Hq0KrvbsLDVc8l5woyXKOn5KA",
  "AIzaSyDB1skJ1a9FugEr5uqvR2So55xHeWpI6AU",
  "AIzaSyC4r12YtLcuYKni5gZiUZiRFxxI8i6kq64",
  "AIzaSyAAb-1TeJpIvdmILCaqu3zWas5IkG8Sh_Q",
  "AIzaSyCPTsmBnXHTYe9JUJGtG_di6u7spMOkti4",
  "AIzaSyAzu8BqBtkrJjCVeNJSHDX03i1nh9Urrw8",
  "AIzaSyBaR4ppPJSD1HDJlZ7XRwqjxtzvJw4iYhM",
  "AIzaSyBrm7foBjjJ4757DLcBG92OpD1OLzLM1HE",
  "AIzaSyDTEcL_dMMdPmJHf_LcqfWw8VWGijHGb_E",
  "AIzaSyAe5Mx8DAKyO2vemkoxBJOy4KgzjZv-63A",
  "AIzaSyDdZOVIaxjM9M1tZRtu9fAARlKyb0UCqRo",
  "AIzaSyCAUT94EMMAPc-eu04_GMCpgkdjChbX9hw",
  "AIzaSyC5qEJ7TBSxndhoB3ZzogVxAbiCkqKg8TU",
  "AIzaSyCMJASvij_Ai2HfU1Sa8nQeV3-vyoDmV5o"
];

let blacklistedIndices = new Set<number>();
let currentIndex = Math.floor(Math.random() * GEMINI_KEYS.length);

export const getRotatingApiKey = (): { key: string, index: number } => {
  // Find next non-blacklisted key
  let attempts = 0;
  while (blacklistedIndices.has(currentIndex) && attempts < GEMINI_KEYS.length) {
    currentIndex = (currentIndex + 1) % GEMINI_KEYS.length;
    attempts++;
  }
  
  // If all blacklisted (unlikely), reset one
  if (attempts >= GEMINI_KEYS.length) {
    blacklistedIndices.clear();
  }

  const key = GEMINI_KEYS[currentIndex];
  const activeIdx = currentIndex;
  currentIndex = (currentIndex + 1) % GEMINI_KEYS.length;
  return { key, index: activeIdx };
};

export const blacklistKey = (index: number) => {
  blacklistedIndices.add(index);
  console.warn(`SHΞN™: Key at index ${index} blacklisted due to error.`);
};

export const getBlacklistCount = () => blacklistedIndices.size;
