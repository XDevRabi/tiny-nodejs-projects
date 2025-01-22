import https from "https";
import chalk from "chalk";
import readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const apiKey = process.env.EXCHANGE_RATE_API_KEY || "";
const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

const getExchangeRate = () => {
    https.get(url, (response) => {
        let data = "";
        response.on("data", (chunk) => {
            data += chunk;
        });
        response.on("end", () => {
            const exchangeRate = JSON.parse(data).conversion_rates;
            // console.log(exchangeRate)
            rl.question("Enter the amount in USD: ", (amount) => {
                rl.question("Enter the target currency code: ", (currencyCode) => {
                    const convertedAmount = (amount * exchangeRate[currencyCode.toUpperCase()]);
                    console.log(chalk.green(`\n ${amount} USD is equal to ${convertedAmount} ${currencyCode.toUpperCase()}`));
                    rl.close();
                });
            });
        });
        response.on("error", (error) => {
            console.log(error);
        });
    });
};

getExchangeRate();