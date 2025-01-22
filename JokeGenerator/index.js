import https from "https";
import chalk from "chalk";

const getJoke = () => {
  const url = "https://official-joke-api.appspot.com/random_joke";
  https.get(url, (response) => {
    let data = "";
    response.on("data", (chunk) => {
      data += chunk;
      //   console.log(chunk);
      //   console.log(data);
    });
    response.on("end", () => {
      //   console.log(data);
      const joke = JSON.parse(data);
      console.log(chalk.black.bgYellow.bold(`\n Here is a joke for you:`));
      console.log(chalk.green(joke.setup));
      console.log(chalk.red(`${joke.punchline}🤣🤣🤣`));
    });

    response.on("error", (error) => {
      console.log(error);
    });
  });
};

getJoke();
