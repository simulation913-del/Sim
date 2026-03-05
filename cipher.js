function railFenceEncrypt(text, rails = 7, offset = 4) {
  // Create rails as empty arrays
  const fence = Array.from({ length: rails }, () => []);
  let rail = offset % rails;
  let direction = 1; // 1 = down, -1 = up

  for (let char of text) {
    fence[rail].push(char);
    rail += direction;

    if (rail === rails) { // reached bottom
      rail = rails - 2;
      direction = -1;
    } else if (rail < 0) { // reached top
      rail = 1;
      direction = 1;
    }
  }

  // Flatten rails into ciphertext
  return fence.map(row => row.join("")).join("");
}

function railFenceDecrypt(cipher, rails = 7, offset = 4) {
  // Determine zigzag pattern positions
  const pattern = [];
  let rail = offset % rails;
  let direction = 1;

  for (let _ of cipher) {
    pattern.push(rail);
    rail += direction;

    if (rail === rails) {
      rail = rails - 2;
      direction = -1;
    } else if (rail < 0) {
      rail = 1;
      direction = 1;
    }
  }

  // Count characters per rail
  const railCounts = Array.from({ length: rails }, (_, r) =>
    pattern.filter(p => p === r).length
  );

  // Split cipher into rails
  const railStrings = [];
  let idx = 0;
  for (let count of railCounts) {
    railStrings.push(cipher.slice(idx, idx + count).split(""));
    idx += count;
  }

  // Rebuild plaintext following zigzag pattern
  const railIndices = Array(rails).fill(0);
  const plaintext = [];

  for (let r of pattern) {
    plaintext.push(railStrings[r][railIndices[r]]);
    railIndices[r]++;
  }

  return plaintext.join("");
}

// Example usage
const message = "HELLO RAIL FENCE";
const encrypted = railFenceEncrypt(message, 7, 4);
const decrypted = railFenceDecrypt(message, 7, 4);

console.log("Original :", message);
console.log("Encrypted:", encrypted);
console.log("Decrypted:", decrypted);