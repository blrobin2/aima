import "dotenv/config";

import OpenAI from "openai";
import { VercelPostgres } from "@langchain/community/vectorstores/vercel_postgres";
import { OpenAIEmbeddings } from "@langchain/openai";

async function queryStore(vectorstore, openai, question) {
  const results = await vectorstore.similaritySearch(question);
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: `Answer the following question using the provided context. If you cannot answer the question with the context, don't lie and make up stuff. Just say you need more context.

        Question: ${question}

        Context: ${results.map((r) => r.pageContent).join("\n")}`,
      },
    ],
  });

  const sources = [
    ...new Set(
      results.map(
        (r) => `${r.metadata.source}: Page ${r.metadata.loc.pageNumber}`
      )
    ),
  ].join(", ");

  console.log(
    `Answer: ${response.choices[0].message.content}\n\nSources: ${sources}`
  );
}

(async () => {
  const question =
    process.argv[2] ||
    "In one sentence, define the concept of an intelligent agent.";
  const openai = new OpenAI();
  const store = await VercelPostgres.initialize(new OpenAIEmbeddings());
  await queryStore(store, openai, question);
})();
