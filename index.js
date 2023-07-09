import { Configuration, OpenAIApi } from "openai";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const port = 8000;
app.use(bodyParser.json());
app.use(cors());

app.get("/",(req,res) => {
  res.setHeader("Access-Control-Allow-Credentials","true");
  res.send("API is running...");
})

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);





  const runConversation = async (request, response) => {


  console.log(request.body);

  let question = request.body.inputData.question;
  let answer = request.body.inputData.answer;

  let messages = [
    {
      role: "system", content: `strictly follow the provided context to check answer of the question at the end.
      In addition to giving an answer, also return a score of how fully it answered the user's question.
      This should be in the following format:
      How to determine the score:
      - Better responds fully to the asked question, with sufficient level of detail
      - If you do not know the answer based on the context, that should be a score of 0` },
    { role: "user", content: `context : India is a great country, it has a variety of cultures, 
      new delhi is the capital of india, India has a total of 28 states and 8 union territories
      , India lies in south Asia, rupee is the indian currency, and national bird of India is Peacock.
      ` },
    { role: "user", content: `Question 1: ${question}` },
    { role: "user", content: `Answer: ${answer}` },
  ];

  let result = await generateResult(messages);

  return result;

}


const generateResult = async (messages) => {

  let functions = [{
    "name": "checkAnswers",
    "description": "checks if answer is corrent or not, based on the context. provides correct answer and a scrote that determine if answer is correct ",
    "parameters": {
      "type": "object",
      "properties": {
        "correct": {
          "type": "boolean",
          "description": "if answer is correct then true else false",
        },
        "score": {
          "type": "string",
          "description": "its value lie between 0-100 on basis of answer's correctness, give partial score if answer is not fully correct",
        },
        "correctAnswer": {
          "type": "string",
          "description": "correct answer to the question on basis of the context",
        },
      },
      "required": ["correct", "score", "correctAnswer"],
    },
  }]
  try {
    let secondResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0613",
      messages: messages,
      functions: functions,
      function_call: 'auto',
    });
  
    console.log("generated result:", secondResponse.data.choices[0]);
    return secondResponse.data.choices[0];
  } catch (error) {
    console.log(error);
    return error;
    // Handle the error gracefully
  }
}









app.post("/", async (request, response) => {



  let result = await runConversation(request, response);
  response.json({
    output: result,
  });

});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});