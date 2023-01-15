const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

// Configuration class for OpenAI API
class Configuration {
  constructor(options) {
    this.organization = options.organization;
    this.apiKey = options.apiKey;
  }
}

// OpenAI API client class
class OpenAIApi {
  constructor(configuration) {
    this.configuration = configuration;
  }

  async createCompletion(options) {
    // Perform API request to create a completion using the provided options
    try {
      const response = await axios({
        method: "POST",
        url: "https://api.openai.com/v1/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.configuration.apiKey}`,
        },
        data: options,
      });
      return response;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create completion");
    }
  }
  async createImage(options) {
    try {
      const response = await axios({
        method: "POST",
        url: "https://api.openai.com/v1/images/generations",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.configuration.apiKey}`,
        },
        data: options,
      });
      return response;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to generate image");
    }
  }
}

// Create Express server and configure middleware
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Create OpenAI API client
const configuration = new Configuration({
  organization: "org-PuZSX9myXzo0qrShakkrbuA5",
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Set up route to handle POST requests
app.post("/", async (req, res) => {
  try {
    // Get message from request body
    const { message, currentModel } = req.body;
    console.log("req:", message);

    // Call OpenAI API to generate completion for the message
    const response = await openai.createCompletion({
      model: "text-davinci-003",

      // prompt: `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.

      // // Human: give me list of 3 rendome people?
      // // AI: 1.bobi "n/"
      //        2.lolo
      //        3.koki?
      // // Human:${message}.
      // // AI:`,

      // prompt: `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.
      // You: What have you been up to?
      // Friend: Watching old movies.
      // You: Did you watch anything interesting?
      // Friend: Yes, I watched a classic movie from the 50s called Rebel Without a Cause. It was really good!
      // You:${message}
      // Friend:`,

      // prompt: ` want you to act as a smart domain name generator.
      //  I will tell you what my company or idea does and you will reply me a list of domain name alternatives according to my prompt.
      //   You will only reply the domain list, and nothing else. Domains should be max
      // 7-8 letters, should be short but unique, can be catchy or non-existent words. Do not write explanations. Reply "OK" to confirm.`,

      prompt:` I want you to act as a storyteller. You will come
      up with entertaining stories that are
      engaging, imaginative and captivating for the
      audience. It can be fairy tales, educational
      stories or any other type of stories which has
      the potential to capture people's attention
      and imagination. Depending on the target
      audience, you may choose specific themes or
      topics for your storytelling session e.g., if it’s
      children then you can talk about animals; If
      it’s adults then history-based tales might
      engage them better etc. My first request is:
       ${message}.`,

      // prompt: `I am a highly intelligent question answering bot. If you ask me a question, I will give you the answer.

      // Human: What is human life expectancy in the United States?
      // Ai: Human life expectancy in the United States is 78 years.

      // Human: Who was president of the United States in 1955?
      // Ai: Dwight D. Eisenhower was president of the United States in 1955.

      // Human: How to be rich -list of 5 thing?
      // Ai: 1. Set goals and create a plan to achieve them. \n
      //     2. Develop a positive attitude and mindset. \n
      //     3. Take calculated risks. \n
      //     4. Network and build relationships.\n
      //    5. Develop multiple income streams. \n

      // Human: How does a telescope work?
      // Ai: Telescopes use lenses or mirrors to focus light and make objects appear closer.

      // Human: Where were the 1992 Olympics held?
      // Ai: The 1992 Olympics were held in Barcelona, Spain.

      // Human:${message}?
      // Ai:
      // `,

      temperature: 0,
      max_tokens: 100,
      frequency_penalty: 0.4,
      presence_penalty: 0.4,
      stop: ["n/"],
    });
    // console.log("sdgsdgsd", response.data.choices[0].text);
    // Return response from OpenAI API
    res.json({
      message: response.data.choices[0].text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

app.get("/models", async (req, res) => {
  try {
    const response = await axios({
      method: "GET",
      url: "https://api.openai.com/v1/models",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${configuration.apiKey}`,
      },
    });
    const models = response.data;
    res.json({ models });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});


// app.get("/image", async (req, res) => {
//   try {
//     const response = await openai.createImage({
//       prompt: "books , 4k and 3D",
//       n: 1,
//       size: "512x512",
//     });
//     console.log(':response.data.data.url' ,response.data)
    
//     res.send(response.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: "Failed to generate image" });
//   }
// });

app.get("/image", async (req, res) => {
  try {
    const prompt = req.query.prompt;
    const response = await openai.createImage({
      prompt: prompt,
      n: 1,
      size: "512x512",
    });
    console.log(':response.data.data.url' ,response.data)
    
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to generate image" });
  }
});
// Set up error-handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send("Something went wrong");
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Start the server
const port = 3080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});