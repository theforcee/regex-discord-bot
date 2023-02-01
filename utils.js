export function getCammom(message) {
  const cammoms = [
    `Anh <@${message.author.id
    }> nhìn em khoá mõm nó như một con chó nè <:choller:392281548520685578>`,
    `Mày mới phải câm đó con đĩ <@${message.author.id}>`,
    `Có mồm thì nói, sao phải câm <:doge:428416714946904074>`
  ];

  return cammoms[Math.floor(Math.random() * cammoms.length)];
}
