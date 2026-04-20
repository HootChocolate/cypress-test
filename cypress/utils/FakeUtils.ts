import { formatDate } from "./DataUtils";
import { getRandomNumber } from "./CommonUtils";

import faker from "faker-br";

const estadosBrasil = {
  AC: "69900-000",
  AL: "57000-000",
  AP: "68900-000",
  AM: "69000-000",
  BA: "40000-000",
  CE: "60000-000",
  DF: "70000-000",
  ES: "29000-000",
  GO: "74000-000",
  MA: "65000-000",
  MT: "78000-000",
  MS: "79000-000",
  MG: "30000-000",
  PA: "66000-000",
  PB: "58000-000",
  PR: "80000-000",
  PE: "50000-000",
  PI: "64000-000",
  RJ: "20000-000",
  RN: "59000-000",
  RS: "90000-000",
  RO: "76800-000",
  RR: "69300-000",
  SC: "88000-000",
  SP: "01000-000",
  SE: "49000-000",
  TO: "77000-000",
};

export function gerarRgFake() {
  let rg = "";
  for (let i = 0; i < 9; i++) {
    rg += Math.floor(Math.random() * 10);
  }
  return rg;
}

export function gerarUfEZipCodeCorrespondente() {
  const ufs = Object.keys(estadosBrasil);
  const indiceAleatorio = Math.floor(Math.random() * ufs.length);
  const uf = ufs[indiceAleatorio];
  const zipCode = estadosBrasil[uf];
  return { uf, zipCode };
}

const ufEZipCode = gerarUfEZipCodeCorrespondente();

export function gerarTelefone() {
  let telefone = "";
  for (let i = 0; i < 10; i++) {
    telefone += Math.floor(Math.random() * 10); // Gera um dígito aleatório de 0 a 9
  }
  return telefone;
}

export function gerarCepAleatorio() {
  let cep = "";
  for (let i = 0; i < 8; i++) {
    cep += Math.floor(Math.random() * 10); // Gera um dígito aleatório de 0 a 9
  }
  return cep;
}

export const fakePerson = {
  nome: faker.name.firstName(),
  sobrenome: faker.name.lastName(),
  email: faker.internet.email(),
  telefone: faker.phone.phoneNumber(),
  numeroResidencia: parseInt(faker.random.number().toString().slice(0, 3)),
  cpf: faker.br.cpf(),
  cnpj: faker.br.cnpj(),
  rg: gerarRgFake(),
  uf: ufEZipCode.uf,
  zipCode: ufEZipCode.zipCode,
  country: faker.address.country(),
  street: faker.address.streetName(),
  passwd: faker.internet.password(),
  phone: gerarTelefone(),
  jobArea: faker.name.jobArea(),
  cidade: faker.address.city(),
  bairro: `Jardim ${faker.address.city()}`,
  logradouro: `Rua ${faker.address.city()}`,
  ufPR: "PR",
  cep: gerarCepAleatorio(),
  dataAtual: formatDate(new Date(), "dd/MM/yyyy"),
  dataNascimento: formatDate(new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()), "dd/MM/yyyy"),
  observacao:(max?: number) => max ? faker.lorem.text().substring(0, max) : faker.lorem.text(),
  fullName: `${faker.name.firstName()} ${faker.name.lastName()}`,
  login: `${faker.name.firstName()}.${Cypress._.random(999)}.${faker.name.lastName()}`,
  token: `${getRandomNumber()}${faker.internet.password()}${getRandomNumber()}${faker.internet.password()}${getRandomNumber()}${faker.internet.password()}${getRandomNumber()}${faker.internet.password()}`
};

export default {
  fakePerson
};
