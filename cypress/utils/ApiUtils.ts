import { isNullOrEmpty, nvl } from "./CommonUtils";
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Função para encontrar diferenças entre dois objetos
function diff(modeloJSON, comparadoJSON) {
  const result = {};

  if (Object.is(modeloJSON, comparadoJSON)) {
    return undefined;
  }

  if (!comparadoJSON || typeof comparadoJSON !== "object") {
    return comparadoJSON;
  }

  Object.keys(comparadoJSON).forEach((key) => {
    if (
      modeloJSON[key] !== comparadoJSON[key] &&
      !Object.is(modeloJSON[key], comparadoJSON[key])
    ) {
      if (Array.isArray(comparadoJSON[key])) {
        if (!Array.isArray(modeloJSON[key])) {
          result[key] = comparadoJSON[key];
        } else {
          const diffArray = comparadoJSON[key]
            .map((item, index) => {
              if (typeof item === "object") {
                return diff(modeloJSON[key][index], item);
              }
              return item;
            })
            .filter((item) => item !== undefined);

          if (diffArray.length > 0) {
            result[key] = diffArray;
          }
        }
      } else if (
        typeof comparadoJSON[key] === "object" &&
        typeof modeloJSON[key] === "object"
      ) {
        const value = diff(modeloJSON[key], comparadoJSON[key]);
        if (value !== undefined) {
          result[key] = value;
        }
      } else {
        result[key] = comparadoJSON[key];
      }
    }
  });

  return Object.keys(result).length > 0 ? result : undefined;
}

export function check_status_code(statusRetornado: number, statusEsperado?: number, overrideMsg?: string) {
  if (typeof statusRetornado !== 'number' || typeof statusRetornado === 'object') {
    throw new Error(`check_status_code - statusRetornado deve ser um número e não um objeto\n\n${statusRetornado}`);
  }
  expect(statusRetornado, nvl(overrideMsg, 'Valida status code')).to.equal(statusEsperado ? statusEsperado : 200)
}

export function expect_comMargemErro(expected: number, actual: number, margemErro: number, msg: string) {
  const min = actual - margemErro;
  const max = actual + margemErro;
  expect(expected, nvl(msg, '')).to.be.within(min, max);
}


/**
 * Compara dois objetos JSON (modeloJSON e comparadoJSON) e identifica campos extras presentes no JSON comparado 
 * (geralmente resposta de API) que não existem no modelo esperado.
 * 
 * Se encontrar diferenças:
 * 
 * Acumula mensagens de erro detalhadas
 * Lança uma exceção com todos os problemas encontrados
 * 
 * Se não houver diferenças:
 * 
 * Apenas loga uma mensagem informando sucesso
 * 
 * @param modeloJSON 
 * @param comparadoJSON 
 */
export function diffChecker(modeloJSON, comparadoJSON) {
  const diffResult = diff(modeloJSON, comparadoJSON);
  let errors: String[] = [];
  if (diffResult) {
    Object.keys(diffResult).forEach((key) => {
      if (Array.isArray(diffResult[key])) {
        errors.push(`O array "${key}" contém novos campos ou valores.`);
        diffResult[key].forEach((item, index) => {
          if (typeof item === "object") {
            Object.keys(item).forEach((subKey) => {
              errors.push(
                `Dentro do array "${key}[${index}]", o campo "${subKey}" está no GET retornado e não está no JSON com schema predefinido.`
              );
            });
          }
        });
      } else {
        errors.push(
          `O campo "${key}" está no GET retornado e não está no JSON com schema predefinido.`
        );
      }
    });
  } else {
    cy.task("log", "Não há diferenças encontradas.");
  }
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
}

/**
 * Valida as key passadas existam no response, e que não seja null ou undefined
 * 
 * @param arrData response.data
 * @param expectedValues lista de valores que deve conter na response
 */
export function expectNotNullValuesOnList(arrData: object, expectedValues: string[]) {
  for (const key of expectedValues) {
    expect(arrData).to.have.property(`${key}`);
    expect(arrData[key], `${key} must not be null`).to.not.be.null;
    expect(arrData[key], `${key} must not be undefined`).to.not.be.undefined;
  }
}

// Add a custom Cypress command for schema validation
export function schema_validator(schema, data) {
  if (isNullOrEmpty(data)) {
    cy.warn(`schema_validator - sem dados de resposta para validar schema:\n${schema}`)
    return
  }

  let dataValidate;

  if (!data[0]) {
    if (data) {
      dataValidate = [data];  // trata para transformar em lista, quando passado o objeto inteiro
    } else {
      throw new Error('O dado passada para validar conforme o schema não é um array')
    }
  } else {
    dataValidate = data;
  }

  // Initialize AJV with strict mode enabled ensure data integrity
  const ajv = new Ajv({ strict: true });
  addFormats(ajv); // Add format support (e.g., date-time, email)

  // Compile the schema
  const validate = ajv.compile(schema);

  // Perform validation
  const valid = validate(dataValidate);

  if (!valid) {
    // Log validation errors in a readable format
    const err = JSON.stringify(validate.errors, null, 2);

    console.log(err);

    // Throw an error with the validation issues
    throw new Error(`Schema validation failed = ${err}`);
  }

  // Assert that the validation passed
  expect(valid, 'Validation schema').to.be.true;
}