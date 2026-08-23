declare global {
  // 1. Zmienna dostępna bezpośrednio w kodzie (np. console.log(MY_GLOBAL_VAR))
  // WAŻNE: Użyj słowa kluczowego 'var', aby TypeScript poprawnie powiązał ją z globalThis
  var browser: typeof chrome;

  // 2. Jeśli chcesz rozszerzyć obiekt 'window' w przeglądarce
//   interface Window {
//     anotherGlobal: number;
//   }
}

// Ten pusty eksport jest WYMAGANY, aby TypeScript potraktował ten plik jako moduł
export {};