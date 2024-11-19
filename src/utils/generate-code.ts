export function generateCode(length: number) {
  let code = '';

  for (let i = 0; i < length; i++) {
    if (i % 2 === 0) { // Posições pares: letra
      // Gera uma letra aleatória entre A (65) e Z (90)
      const randomLetter = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
      code += randomLetter;
    } else { // Posições ímpares: número
      // Gera um número aleatório entre 0 e 9
      const randomNumber = Math.floor(Math.random() * 10);
      code += randomNumber;
    }
  }

  return code;
}