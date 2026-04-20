// arquivo para gerar documentação de API das requisições marcadas como saveAPIDocs
import fs from "fs";
import path from "path";

// Pasta raiz onde estão os JSONs
const CY_ROOT_DOCS_PATH = path.resolve("cypress/results/doc");

/**
 * Busca recursivamente todos os arquivos -doc.json dentro da pasta CY_ROOT_DOCS_PATH
 */
function findAllJsonFilesRecursive(dir: string): string[] {
    let resultFiles: string[] = [];
    const listPathRecursive = fs.readdirSync(dir);

    // procura dentro da pasta raiz até o último nível, para o path passado no saveApiDocs
    // até encontrar o arquivo que não é uma pasta
    listPathRecursive.forEach((file) => {
        const filePath = path.join(dir, file);
        const recursivePath = fs.statSync(filePath);

        if (recursivePath && recursivePath.isDirectory()) {   // ainda é um repositório

            resultFiles = resultFiles.concat(findAllJsonFilesRecursive(filePath));

        } else if (file.includes("-doc.json")) {
            // encontrou o arquivo json
            resultFiles.push(filePath);
        }
    });

    return resultFiles;
}

/**
 Ao executar o comando generate:doc, será executado este script.
 Ele monta o Markdown do Documentação API, e salvo no mesmo local do arquivo json
 */
function generateMarkdownFromJson(jsonPath: string) {
    const docsJsonOBJ = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    let text = `# Documentação API - ${path.dirname(jsonPath).replace(CY_ROOT_DOCS_PATH, "")}\n\n`;

    docsJsonOBJ.forEach((entry: any) => {
        // Monta Markdown
        text += `- **Method:** \`${entry.method}\`\n`;
        text += `- **URL:** \`${entry.url}\`\n`;

        if (entry.headers) {
            text += `- **Headers:**\n`;
            Object.entries(entry.headers).forEach(([key, value]) => {
                text += `  - \`${key}\`: \`${value}\`\n`;
            });
            text += "\n";
        }

        if (entry.queryString && Object.keys(entry.queryString).length > 0) {
            text += `- **Query Params:**\n\n\`\`\`json\n${JSON.stringify(entry.queryString, null, 2)}\n\`\`\`\n\n`;
        }

        if (entry.body) {
            text += `- **Body Example:**\n\n\`\`\`json\n${JSON.stringify(entry.body, null, 2)}\n\`\`\`\n\n`;
        }

        if (entry.filtrosAvancados?.length) {
            text += `- **Filtros Avançados:**\n`;
            entry.filtrosAvancados.forEach((f: string) => {
                text += `  - \`${f}\`\n`;
            });
            text += "\n";
        }

        if (entry.filtrosRapidos && Object.keys(entry.filtrosRapidos).length > 0) {
            text += `- **Filtros Rápidos:**\n`;
            Object.entries(entry.filtrosRapidos).forEach(([campo, valores]) => {
                text += `  - \`${campo}\`: ${JSON.stringify(valores)}\n`;
            });
            text += "\n";
        }

        const date = new Date();

        const format = new Intl.DateTimeFormat("pt-BR", {
            timeZone: "America/Sao_Paulo",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, // força 24h
        });

        const now = format.format(date);

        text += `\n---\n\n\Atualizado em: ${now}\n`;
    });

    // Salva o Markdown
    const baseName = path.basename(jsonPath, ".json"); // pega o nome do arquivo sem a extensão .json
    const saveMD = path.join(path.dirname(jsonPath), `${baseName}.md`);

    fs.writeFileSync(saveMD, text, "utf-8");
    // console.log(`Markdown gerado: ${outputPath}`);

    fs.unlinkSync(jsonPath);
    // console.log(`Arquivo JSON apagado: ${jsonPath}`);
}


/**
 * Executa o gerador para todos os JSONs encontrados
 */
function main() {
    if (!fs.existsSync(CY_ROOT_DOCS_PATH)) {
        console.log("Nenhum diretório de docs encontrado.");
        return;
    }

    const jsonFiles = findAllJsonFilesRecursive(CY_ROOT_DOCS_PATH);

    if (jsonFiles.length === 0) {
        console.log("Nenhum -doc.json encontrado para gerar Markdown.");
        return;
    }

    // para cada arquivo JSON encontrado, gera um MD e apaga o JSON
    jsonFiles.forEach(generateMarkdownFromJson);

    
}

main();
