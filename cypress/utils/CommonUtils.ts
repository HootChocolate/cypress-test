/**
 * Retorna o primeiro valor se estiver preenchido, senão retorna o segundo
 * @param {*} first 
 * @param {*} second 
 * @returns 
 */
export function nvl(first: any, second: any) {
  return first !== undefined ? first : second;
}

export function isNullOrEmpty(value: any) {  
  if (value === null || value === undefined || value === 'undefined') {    
    return true;
  }

  if (typeof value === "string" && value.trim() === "") {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;

  }
  
  if (Array.isArray(value) && value.length > 0) {
    let objs_vazios_array = 0;
    
    value.forEach((item, index) => {
      if (item === '') {
        objs_vazios_array++;
      }
    });

    // para casos em que é um array, mas com objetos vazios
    return objs_vazios_array === value.length;   
  }

  if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) {
    return true;
  } 
  
  return false;
}

export function getRandomNumber(int?: number): number {
  if (int) {
    return Math.floor(Math.random() * int);
  } else {
    return Math.floor(Math.random() * 96) + 3;
  }
}

export function sanitizeFileName(value: string): string {
  return value
    .normalize('NFD')                   // separa acentos
    .replace(/[\u0300-\u036f]/g, '')    // remove acentos
    .replace(/[^a-zA-Z0-9]/g, '_')      // troca especiais por _
    .replace(/_+/g, '_')                // evita ___
    .replace(/^_|_$/g, '')              // remove _ no começo/fim
    .toLowerCase();
}

/**
 * Returns a random item from the provided non-empty array.
 *
 * @template T - The type of elements in the array.
 * @param list - The array from which to select a random item. Must be non-empty.
 * @returns A randomly selected item from the array.
 * @throws Will throw an error if the input is not a non-empty array.
 */
export function getRandomItem<T>(list: T[]): T {
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("getRandomItem: list must be a non-empty array");
  }
  const index = getRandomNumber(list.length);
  return list[index];
}

export function parOuImpar() {
  return getRandomNumber() % 2 === 0;
}

export function isXPath(locator: string) {
  return locator.startsWith('//') || locator.startsWith('(');
}

/**
 * Retorna apenas números.   
 * Retorna em string por causa do primeiro dígito ser 0
 * @param value 
 * @returns string
 */
export function onlyNumber(value: any): string {
  if (typeof value === 'boolean' || typeof value === 'object' || value === null || value === undefined) {
    throw new Error(`onlyNumber: value is not valid. typeof is '${typeof value}'`);
  }

  const onlyDigits = String(value).replace(/\D/g, "");

  if (!onlyDigits) {
    throw new Error(`onlyNumber: no numeric characters found in '${value}'`);
  }

  return onlyDigits;
}

/**
 * Extrai apenas a parte inteira de um valor numérico.
 * @param v 
 * @returns number (inteiro)
 */
export function onlyInt(v: any): number {
  if ([null, void 0].includes(v) || typeof v === "boolean" || typeof v === "object") {
    throw new Error(`onlyInt: invalid type '${typeof v}'`);
  }

  const r = String(v).match(/-?\d+(\.\d+)?/g);
  if (!r) {
    throw new Error(`onlyInt: no numeric value found in '${v}'`);
  }

  const n = parseInt(r.join(""), 10);
  if (Number.isNaN(n)) {
    throw new Error(`onlyInt: could not parse '${v}'`);
  }

  return n;
}


/**
 * Converts a given string to camel case format by removing accents,
 * eliminating spaces, and converting all characters to uppercase.
 *
 * @param value - The input string to be transformed.
 * @returns The transformed string in uppercase without accents or spaces.
 */
export function toUpperCaseNormalized(value: string) {
  const noAccents = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return noAccents.replace(/\s+/g, '').toUpperCase();
}

export function getIntegerFromStyle(style) {
  if (!style) return 0;
  const match = style.match(/left:\s*([\d.]+)px/);
  if (match) {
    return Math.floor(parseFloat(match[1])); // retorna apenas a parte inteira
  }
  return 0;
}

/**
 * Compara o primeiro array com o segundo, encontra objetos diferentes e retorna um objeto, com o que era esperado e o que foi retornado
 * @param first 
 * @param second 
 * @returns 
 */

export function diffArray<T>(first: T[] | unknown,second: T[] | unknown) {
  const ft: T[] = Array.isArray(first) ? first : [];
  const sec: T[] = Array.isArray(second) ? second : [];

  // força para string e upper (evita null/undefined quebrar)
  const firstUpper = ft.map(o => String(o).toUpperCase());
  const secondUpper = sec.map(o => String(o).toUpperCase());

  // valores esperados (estão no primeiro, mas não no segundo)
  const expect = firstUpper.filter(item => !secondUpper.includes(item));

  // valores encontrados (estão no segundo, mas não no primeiro)
  const found = secondUpper.filter(item => !firstUpper.includes(item));

  return expect.length === 0 && found.length === 0
    ? {}
    : { expect, found };
}