function runUnitTests() {
  const valid = validateReview('Олена', 'Гарна добірка треків!');
  console.assert(valid.name && valid.text, 'Коректний відгук має пройти валідацію.');

  const empty = validateReview('', '');
  console.assert(!empty.name && !empty.text, 'Порожні поля мають бути відхилені.');

  const spaces = validateReview('  ', ' '.repeat(12));
  console.assert(!spaces.name && !spaces.text, 'Рядки з пробілів мають бути відхилені.');

  const boundaries = validateReview('А'.repeat(80), 'Б'.repeat(300));
  console.assert(boundaries.name && boundaries.text, 'Рядки на межі довжини мають пройти валідацію.');

  const tooLong = validateReview('А'.repeat(81), 'Б'.repeat(301));
  console.assert(!tooLong.name && !tooLong.text, 'Перевищення довжини має бути відхилене.');

  const invalidType = validateReview(null, 42);
  console.assert(!invalidType.name && !invalidType.text, 'Значення іншого типу мають бути відхилені.');
}

runUnitTests();
