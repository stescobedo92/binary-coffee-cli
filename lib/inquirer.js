const inquirer = require('inquirer');

module.exports = {
    askBinaryCoffeeCredentials: () => {
        const questions = [{
                name: 'username',
                type: 'input',
                message: 'Enter your Binary Coffee username:',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter your username.';
                    }
                }
            },
            {
                name: 'password',
                type: 'password',
                message: 'Enter your password:',
                validate: function(value) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter your password.';
                    }
                }
            }
        ];
        return inquirer.prompt(questions);
    },
};