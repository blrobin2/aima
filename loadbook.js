// ONLY RUN THIS FILE ONCE
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";

async function loadPdf(pdf) {
  const loader = new PDFLoader(pdf);
  const docs = await loader.load(
    new CharacterTextSplitter({
      separator: ".",
      chunkSize: 2500,
      chunkOverlap: 200,
    })
  );

  return VercelPostgres.fromDocuments(docs, new OpenAIEmbeddings());
}

const pdf = process.argv[2];
const store = await loadPdf(pdf);
console.log(store);
