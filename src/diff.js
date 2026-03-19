/**
 * Minimal word-level diff between two strings.
 * Returns array of { type: 'same'|'added'|'removed', text: string }
 */
export function diffWords(oldText, newText) {
  const oldWords = tokenize(oldText);
  const newWords = tokenize(newText);

  const lcs = computeLCS(oldWords, newWords);
  const result = [];

  let oi = 0;
  let ni = 0;

  for (const word of lcs) {
    while (oi < oldWords.length && oldWords[oi] !== word) {
      result.push({ type: 'removed', text: oldWords[oi] });
      oi++;
    }
    while (ni < newWords.length && newWords[ni] !== word) {
      result.push({ type: 'added', text: newWords[ni] });
      ni++;
    }
    result.push({ type: 'same', text: word });
    oi++;
    ni++;
  }

  while (oi < oldWords.length) {
    result.push({ type: 'removed', text: oldWords[oi++] });
  }
  while (ni < newWords.length) {
    result.push({ type: 'added', text: newWords[ni++] });
  }

  return result;
}

function tokenize(text) {
  // split on word boundaries preserving spaces
  return text.match(/\S+|\s+/g) ?? [];
}

function computeLCS(a, b) {
  if (a.length > 300 || b.length > 300) {
    // For very long texts, skip detailed diff
    return [];
  }
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const lcs = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return lcs;
}
