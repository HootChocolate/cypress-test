const { defineConfig } = require("cypress");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const FormData = require("form-data");  // __dirname global node.js
const telegramBaseURL = 'https://api.telegram.org/bot';
const PATH_TMP = 'geral/tmp'
const PATH_TO_WARNS = `${PATH_TMP}/monitoramento/warns.json`

async function sendTelegramMessage(telegramAPIUrl, chat_id, text, appendLogMsg) {
  const urlSendMessage = `${telegramAPIUrl}/sendMessage`;
  const body = { "chat_id": `${chat_id}`, "parse_mode": "HTML", "text": `${text}` }

  try {
    const response = await axios.post(urlSendMessage, body);

    if (response.status !== 200) {
      throw new Error(`[TELEGRAM] Erro: Status ${response.status}`);
    }

    console.log(`[TELEGRAM] Mensagem enviada com sucesso${appendLogMsg ? ` - ${appendLogMsg}` : ''}`);
    return response.data;

  } catch (err) {
    const m = err.response?.data.description || err.message;
    if (!m.includes('Bad Request: message is too long')) {
      await sendTelegramMessage(telegramAPIUrl, chat_id, m, appendLogMsg)
    } else {
      console.error("[TELEGRAM] Erro no envio:", err.response?.data || err.message);
      throw err;
    }
  }
}

async function sendTelegramDocument(telegramAPIUrl, chatId, filePath, caption, appendLogMsg) {
  const urlSendDocument = `${telegramAPIUrl}/sendDocument`;

  const formDocument = new FormData();
  formDocument.append("chat_id", chatId);
  formDocument.append("document", fs.createReadStream(filePath));

  if (caption) {
    formDocument.append("caption", caption);
  }

  try {
    await axios.post(urlSendDocument, formDocument, {
      headers: { ...formDocument.getHeaders() }
    }).then((response) => {
      console.log(`[TELEGRAM] Documento enviado com sucesso${appendLogMsg ? ` - ${appendLogMsg}` : ""}`);
      if (response.status !== 200) {
        throw new Error(`${response}`);
      } else {
        return response;
      }
    });
  } catch (err) {
    console.error(err.response?.data);
    throw new Error(`[TELEGRAM] Erro no envio de Documento para o telegram:\n${err}`);
  }
}

/**
 * Essa função está inserida no after:run, ela será executada ao final de todos os testes.
 * Nesse momento existem todos os dados de estatísticas dos testes, então nessa função são salvas as informações,
 * para serem utilizador posteriormente na pipeline.
 * @param results 
 */
function saveResultsDataFile(results) {
  const afterRunResultsFile = `${PATH_TMP}/monitoramento/after_run-results.json`

  const resultStringfy = JSON.stringify(results)
  const resultParse = JSON.parse(resultStringfy)

  const configStringify = JSON.stringify(resultParse.config)
  const configParse = JSON.parse(configStringify)

  const envStringify = JSON.stringify(configParse.env)
  const envParse = JSON.parse(envStringify)

  const endedTestsAt = new Date(resultParse.endedTestsAt);
  const endedFormatted = endedTestsAt.toLocaleString("pt-BR", { // dd/MM/yyyy hh:mm:ss
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/Sao_Paulo"
  });

  const totalDurationMs = resultParse.totalDuration;
  const minutes = Math.floor(totalDurationMs / 60000);
  const seconds = Math.floor((totalDurationMs % 60000) / 1000);
  const totalFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const totalPassed = resultParse.totalPassed;
  const totalFailed = resultParse.totalFailed;
  const totalSuites = resultParse.totalSuites;
  const totalTests = resultParse.totalTests;
  const osName = resultParse.osName;
  const cypressVersion = resultParse.cypressVersion;
  const browserName = resultParse.browserName;
  const browserVersion = resultParse.browserVersion;

  const resultsCreated = {
    baseUrl: configParse.baseUrl,
    endedTestsAt: endedFormatted,
    totalDuration: totalFormatted,
    totalPassed: totalPassed,
    totalFailed: totalFailed,
    totalSuites: totalSuites,
    totalTests: totalTests,
    osName: osName,
    cypressVersion: cypressVersion,
    browserName: browserName,
    browserVersion: browserVersion
  }

  saveFixture(afterRunResultsFile, resultsCreated)
}

async function sendWarnsNotification(bot_id, chat_id) {
  const urlNotify = `${telegramBaseURL}${bot_id}`;
  const pathDocToTelegram = `${PATH_TMP}/monitoramento/docToTelegram.json`
  const completePathDocToTelegram = path.join(__dirname, 'cypress', 'fixtures', pathDocToTelegram)
  const warnsFile = path.join(__dirname, 'cypress', 'fixtures', PATH_TO_WARNS)

  if (fs.existsSync(warnsFile)) { // avoid null

    // cria o arquivo no dataUnique
    let uniqueWarns = { data: [] };

    const fileContentWarns = fs.readFileSync(warnsFile, 'utf-8');
    const parseWarn = JSON.parse(fileContentWarns);

    if (parseWarn.data && Array.isArray(parseWarn.data)) {
      let index = 1;

      for (const value of parseWarn.data) {
        if (!uniqueWarns.data.includes(value)) {
          uniqueWarns.data.push(`${index <= 9 ? `0${index}` : index} → ${value}\n`);// aqui, adiciona o valor sem repetição
          index++;
        }
      }
    } else {
      console.log('[WARN] O arquivo sem um array "data"');
    }

    saveFixture(pathDocToTelegram, uniqueWarns)

    try {
      await sendTelegramDocument(urlNotify, chat_id, completePathDocToTelegram, undefined, "Documento de logs warns").then(() => {
        console.log(`[TELEGRAM] Foi enviado o arquivo warns para o Telegram`);
        fs.unlink(completePathDocToTelegram, (err) => {
          if (err) {
            console.error(`[TMP] Não foi possível remover o arquivo: ${completePathDocToTelegram}`, err);
          } else {
            console.log(`[TMP] Arquivo temporário para notificação removido - path: ${completePathDocToTelegram}`);
          }
        });
      })
    } catch (err) {
      console.error(`[TELEGRAM] Falha ao enviar documento:`, err.response?.data || err.message);
    }
  }
}

/**
 * Não passe o __dirname do sistema
 * @param filePath 
 * @param data 
 * @returns 
 */
function saveFixture(filePath, data) {
  const fullPath = path.join(__dirname, 'cypress', 'fixtures', filePath);
  const split = filePath.split('cypress/fixtures');

  if (split.length > 1) {
    throw new Error(`Não é necessário passar o __dirname do path para salvar. Verifique o caminho correto do arquivo:\n${fullPath}`)
  }

  // cria path, caso não exista
  if (!fs.existsSync(fullPath)) {
    console.log(`[writeFixture] file created: ${fullPath}`);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true }); // ensureDir
  } else {
    console.log(`[writeFixture] file updated: ${fullPath}`);
  }

  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
  return null;
}

async function sendTelegramPhoto(telegramAPIUr, formPhoto, appendLogMsg) {

  const urlSendPhoto = `${telegramAPIUrl}/sendPhoto`;
  try {
    await axios.post(urlSendPhoto, formPhoto, {
      headers: { ...formPhoto.getHeaders() }
    })
      .then((response) => {
        console.log(`[TELEGRAM] Imagem enviado com sucesso${appendLogMsg ? ` - ${appendLogMsg}` : appendLogMsg}`);
        if (response.status !== 200) {
          throw new Error(`${response}`)
        } else {
          return response
        }
      })
  } catch (err) {
    console.error(err.response?.data);
    throw new Error(`[TELEGRAM] Erro no envio de Imagem para o telegram:\n${err}`);
  }
}

async function sendTelegramVideo(telegramAPIUrl, chat_id, videoPath, txt, appendLogMsg) {
  const urlSendVideo = `${telegramAPIUrl}/sendVideo`;

  const formVideo = new FormData();

  formVideo.append("chat_id", chat_id);
  formVideo.append("video", fs.createReadStream(videoPath));
  formVideo.append('Content-Type', 'application/json'), formVideo.append("caption", `${txt}`);

  try {
    await axios.post(urlSendVideo, formVideo, {
      headers: { ...formVideo.getHeaders() },
    })
      .then((response) => {
        console.log(`[TELEGRAM] Vídeo enviado com sucesso${appendLogMsg ? ` - ${appendLogMsg}` : appendLogMsg}`);
        if (response.status !== 200) {
          throw new Error(`${response}`)
        } else {
          return response
        }
      })
  } catch (err) {
     console.error(err.response?.data);
     throw new Error(`[TELEGRAM] Erro no envio de Imagem para o telegram:\n${err}`);
  }
}

/**
 * baseUrl can be changed with: 
 *    --config baseUrl=...
 *      CYPRESS_baseUrl=...
 */

module.exports = defineConfig({
  chromeWebSecurity: false, // Evita warning do Chrome
  video: true,
  // coerce the video compression value to 32 Constant Rate Factor (CRF), which takes longer to process, but results in a smaller video
  // videoCompression: true, 
  // habilitar/desabilitar a compreensão de vídeo, especifique esse valor CRF para comprimir o vídeo.
  // Possíveis cenários de uso:
  //  Se a máquina virtual estiver codificando os vídeos lento (possivelmente pouco CPU), tente aumentar esse valor;
  //  Se o vídeo for de péssima qualidade, tente diminuir esse valor
  //  Baixo passa menos comprimindo e resulta em um arquivo de vídeo maior, com qualidade melhor.
  // videoCompression: 15,
  projectId: "yq632d",
  e2e: {
    watchForFileChanges: false,  // <- desativa o watch nos arquivos de spec
    baseUrl: "https://barrigareact.wcaquino.me",
    setupNodeEvents(on, config) {
      const base = config.baseUrl;
      const objEnv = config.env;

      console.log(`\nURL: ${base}`);
      console.log(`API: ${objEnv.BASE_URL_API}`);

      // remover warns ao abrir o cypress - cuidar possível desentendimentos com o cy.session()
      const fileMonitoramento = path.join(__dirname, 'cypress', 'fixtures', PATH_TO_WARNS); // __dirname global node.js

      if (fs.existsSync(fileMonitoramento)) {
        fs.unlink(fileMonitoramento, (err) => {
          if (err) {
            console.error(`[ERRO] Não foi possível remover o arquivo: ${fileMonitoramento}`, err);
          } else {
            console.log(`[TMP] Arquivo temporário de warns removido - path: ${fileMonitoramento}`);
          }
        });
      } else {
        console.log(`[TMP] Sem arquivo de warns para remover`);
      }


      on('task', {
        getOSInfo() { 
          // pega informações do sistema operacional
          // tem que ser aqui, porque aqui aceita comando node
          const os = require('os');

          return {
            cpus: os.cpus(),
            platform: os.platform(),
            arch: os.arch(),
            totalmem: os.totalmem()
          };
        }
      });
      // Configurações de eventos
      on('task', {
        /**
         * Verifica se a fixture existe
         * @param fixtureFilePath sem o absolute path
         * @returns 
         */
        existFixtureFile(fixtureFilePath) {
          const fullPath = path.join(__dirname, 'cypress', 'fixtures', fixtureFilePath)
          return fs.existsSync(fullPath);
        },

        /**
         * Escreve a fixture
         * @param { filePath, data }) sem o absolute path
         * @returns 
         */
        writeFixture({ filePath, data }) {
          const fullPath = path.join(__dirname, 'cypress', 'fixtures', filePath);
          // cria path, caso não exista
          if (!fs.existsSync(fullPath)) {
            // console.log(`[writeFixture] file created: ${fullPath}`);
            fs.mkdirSync(path.dirname(fullPath), { recursive: true }); // ensureDir
          } else {
            // console.log(`[writeFixture] file already exists: ${fullPath}`);
          }

          fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
          return null;
        }
      })

      on("task", {
        // salva a documentação no resultPath especificado
        saveApiDocs(entry) {
          if (!entry.path) {
            throw new Error(`entry.path é obrigatório para o saveApiDocs\n\n${entry}\n\n`)
          }

          if (`${entry.url}`.includes('http') || `${entry.url}`.includes('.com')) {
            throw new Error(`entry.url não deve contém o baseUrl\n\n${entry.url}\n\n`)
          }

          const CY_ROOT_DOCS_PATH = path.resolve("cypress/results/doc"); // onde salva as documentações de API

          function createFileName(url) {
            return url
              .replace(/\*\*/g, "{id}")          // troca ** por {id}
              .replace(/\//g, "_")               // troca / por _
              .replace(/[^a-zA-Z0-9_-]/g, "")    // remove outros caracteres especiais
              .replace(/^_+/, "");               // remove "_" do começo
          }

          let fileName = `${entry.method}--${createFileName(entry.url)}-doc.json`;

          const resultsPath = path.resolve(`${CY_ROOT_DOCS_PATH}${entry.path}/${fileName}`);

          // cria a pasta se não existir
          if (!fs.existsSync(path.dirname(resultsPath))) {
            fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
          }

          // carrega o JSON existente (se houver)
          let arquivoExistente = [];

          if (fs.existsSync(resultsPath)) {
            arquivoExistente = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
          }

          // Substitui Authorization token por placeholder
          if (entry.headers && entry.headers.Authorization) {
            entry.headers.Authorization = "Bearer ${accessToken}";
          }

          // Evita duplicação usando path+method+url como chave
          const alreadyExists = arquivoExistente.some(
            e => e.path === entry.path && e.method === entry.method && e.url === entry.url
          );


          if (alreadyExists) return null // tem que retornar algo

          // adiciona o novo entry
          arquivoExistente.push(entry);

          // sobrescreve o arquivo
          fs.writeFileSync(resultsPath, JSON.stringify(arquivoExistente, null, 2), "utf-8");

          return null;
        }
      });

      on(
        'after:spec', // roda após cada teste
        async (spec, results) => {

          const currentTestName = spec.name;

          const telegramAPI = `${telegramBaseURL}${objEnv.TELEGRAM_BOT_ID_PORTAL_MONITORAMENTO}`;

          if (results && results.video) { // existe vídeo de erros

            const failures = results.tests.some((test) => // houve erro na tentativa
              test.attempts.some((attempt) => attempt.state === 'failed')
            )

            if (!failures) {
              try {
                fs.unlinkSync(results.video); // deleta o vídeo quando não aconteceu erro
              } catch (err) {
                console.error(`Erro ao deletar vídeo: ${err.message}`);
              }

              // Houver erro 
              // Se marcado para notificar e marcado para enviar vídeo ou imagem no telegram, ai envia.
            } else if (objEnv.NOTIFY || objEnv.NOTIFY_ERR_TELEGRAM_SCHEENSHOT || objEnv.NOTIFY_ERR_TELEGRAM_VIDEO) {

              const testsArr = results.tests;
              let displayError = "";

              // monta displayError
              for (let i = 0; i < testsArr.length; i++) {
                if (testsArr[i].state !== 'failed') {
                  continue;
                }

                let auxDisplayError = `${testsArr[i].displayError}`;

                if (auxDisplayError != undefined) { // monta um displayError
                  if (auxDisplayError.includes('at Context.eval')) {

                    displayError = auxDisplayError.split('at Context.eval')[0];

                  } if (auxDisplayError.includes('No request ever occurred')) {

                    displayError = auxDisplayError.split('No request ever occurred')[0];

                  } else {
                    displayError = auxDisplayError.substring(0, 255); // pega um default
                  }
                }
              }

              const formattedDate = new Intl.DateTimeFormat("pt-BR", {
                timeZone: "America/Sao_Paulo",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false // força 24h
              });

              const now = formattedDate.format(new Date());

              const defaultTxtTelegram = `Executado em: ${now}\nURL: ${base}\nAPI: ${objEnv.BASE_URL_API}\nArquivo: ${currentTestName}\n\nDisplayError:\n${displayError}`

              // console.log(JSON.stringify(results));

              // envio de imagem
              if (objEnv.NOTIFY_ERR_TELEGRAM_SCHEENSHOT) {
                if (results.screenshots.length > 0) {
                  // constroi mensagem de midia
                  const firstScreenshot = results.screenshots[0];
                  const screenshotPath = `${firstScreenshot.path}`;

                  const formPhoto = new FormData();
                  formPhoto.append("chat_id", `${objEnv.TELEGRAM_CHAT_ID_PORTAL_MONITORAMENTO}`);
                  formPhoto.append("photo", fs.createReadStream(screenshotPath));
                  formPhoto.append('Content-Type', 'application/json'),
                    formPhoto.append("caption", `${defaultTxtTelegram}`);

                  try {
                    await sendTelegramPhoto(telegramAPI, formPhoto, `Teste: ${currentTestName}`)
                  } catch (err) {
                    console.error(err.response?.data);
                    throw new Error(`[TELEGRAM] Erro no envio de Imagem para o telegram:\n${err}`);
                  }
                } else {
                  throw new Error("[TELEGRAM] Marcado para enviar imagem, mas nenhuma imagem foi encontrada. Possível configuração do Cypress");
                }
              }

              if (objEnv.NOTIFY_ERR_TELEGRAM_VIDEO) {
                if (results.video) {
                  await sendTelegramVideo(telegramAPI, objEnv.TELEGRAM_CHAT_ID_PORTAL_MONITORAMENTO, results.video, defaultTxtTelegram)
                } else {
                  throw new Error("[TELEGRAM] Marcado para enviar Vídeo, mas nenhuma vídeo foi encontrada. Possível configuração do Cypress");
                }
              }
            } else {
              console.log('[TELEGRAM] skip notification');
            }
          }
        }
      )

      /**
       * Roda após executado todos os testes
       */
      on('after:run', async (results) => {
        saveResultsDataFile(results)

        /**
         * Monitoramento de todos os warns juntados durante todos os testes
         * 
         * Pega todos os cy.warn() que foram sendo gerados durante todos os testes, salvo em um arquivo json;
         * Itera no arquivo pegando todos os logs sem repetição. Cria um novo arquivo ;
         * Itera no registro do arquivo com logs unique e envia para o telegram;
         * Caso o conjunto de caracteres esteja próximo do limite aceito no body do telegram, envia por partes.
         */
        if (objEnv.NOTIFY_WARNS_TELEGRAM_MONITOR) {
          if (!objEnv.CHAT_ID_WARNS_TELEGRAM_MONITOR) {
            throw new Error(`CHAT_ID_WARNS_TELEGRAM_MONITOR must be provided`)
          } else if (!objEnv.BOT_ID_WARNS_TELEGRAM_MONITOR) {
            throw new Error(`BOT_ID_WARNS_TELEGRAM_MONITOR must be provided`)
          } else {
            await sendWarnsNotification(objEnv.BOT_ID_WARNS_TELEGRAM_MONITOR, objEnv.CHAT_ID_WARNS_TELEGRAM_MONITOR);
          }
        }
      });
    },
    testIsolation: true, // limpar o estado da tela após cada it, Cada it rode de forma independente - Best Practice: Tests should always be able to be run independently from one another and still pass.
    defaultCommandTimeout: 10000,
    viewportWidth: 1920,
    slowTestThreshold: 10000,
    pageLoadTimeout: 180000,
    viewportHeight: 1080,
    reporter: 'mocha-multi-reporters', // Essa config permite múltiplos reports, além do report jUnit
    reporterOptions: {
      configFile: 'reporter-config.json',
      toConsole: true
    },
    env: {
      BASE_URL: "https://barrigareact.wcaquino.me",
    }
  },
});