'use strict';

const inquirer = require('inquirer');

function showPrompts() {
    return inquirer.prompt([
        {
            name: 'url',
            message: 'Oldal link:',
            validate: input => {
                if (input.indexOf('https://') === 0) {
                    return true;
                }
    
                return 'Az alkalmazás csak https://www.rtlmost.hu/* oldalakkal működik!';
            }
        },
        {
            name: 'file',
            message: 'Fájl név:',
            validate: input => {
                return Boolean(input);
            },
            filter: value => {
                if (!value || value.split(-4) === '.mp4') {
                    return value;
                } else {
                    return value + '.mp4';
                }
            }
        }
    ]);
}

module.exports.showPrompts = showPrompts;
