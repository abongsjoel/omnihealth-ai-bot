# OmniHealth AI Bot

OmniHealth AI Bot is a Node.js-based chatbot application designed to provide helpful health-related assistance. It leverages OpenRouter's API to interact with advanced AI models like OpenAI's GPT-3.5-turbo or GPT-4.

## Features

- Accepts user input via a POST request to the `/ai` endpoint.
- Processes user messages using AI models to generate intelligent and helpful responses.
- Configurable to use different AI models (e.g., GPT-3.5, GPT-4, Claude).
- Includes error handling for invalid input and API failures.

## Requirements

- Node.js (v14 or later)
- An OpenRouter API key
- A `.env` file with the following variables:
  ```
  OPENROUTER_API_KEY=your_openrouter_api_key
  PORT=3000
  ```

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-repo/omnihealth-ai-bot.git
   cd omnihealth-ai-bot
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file and add your OpenRouter API key:

   ```
   OPENROUTER_API_KEY=your_openrouter_api_key
   PORT=3000
   ```

4. Start the server:
   ```
   node index.js
   ```

## Usage

- Send a POST request to the `/ai` endpoint with a JSON body:

  ```json
  {
    "message": "Your health-related question here"
  }
  ```

- Example response:
  ```json
  {
    "reply": "Here is a helpful response to your question."
  }
  ```

## Notes

- The bot is configured to act as a helpful health assistant.
- You can customize the AI model and system prompt in the code.

## Built With

- Node.js
- Express
- Axios
- JavaScript

## Author

👤 **Joel Chi**

- GitHub: [@abongsjoel](https://github.com/abongsjoel)
- Twitter: [@thierryjoel10](https://twitter.com/ThierryJoel10)
- LinkedIn: [Joel Chi](https://www.linkedin.com/in/joel-chi-b4285a97/)

## Contributing

Contributions, issues, and feature requests are welcome!

Feel free to check the [issues page](https://github.com/abongsjoel/omnihealth-ai-bot/issues).

## Show your support

Give a ⭐️ if you like this project!

## License

  <p>This project is <a href="../main/LICENSE">MIT</a> licensed.</p>
