const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const files = require('./lib/files');
const inquirer = require('./lib/inquirer');

clear();

console.log(
    chalk.green(
        figlet.textSync('Binary Coffee', { horizontalLayout: 'full' })
    )
);

const run = async() => {
    const credentials = await inquirer.askBinaryCoffeeCredentials();
    console.log(credentials);
};

run();