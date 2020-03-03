# Pizzeria App :pizza:
Dynamic website created as exercise for Web Developer Bootcamp in Kodilla (Module 8.2).

## Teaser

Coming soon.

More info about launch/installation coming soon.

## Live demo and setup for development

**Live on Heroku:** [https://italian-restaurant.herokuapp.com/](https://italian-restaurant.herokuapp.com/)

**Repository**: https://github.com/natkalia/pizzeria-kodilla-8.2.git

If you want to run this app at your local machine you have to **clone this repository** or just **download zip file** and unzip it locally. This is up to you. If you decide to clone this repo, you should use the below command in your command line tool: 
```bash
git clone https://github.com/natkalia/pizzeria-kodilla-8.2.git
```
After, move to the main folder of the app and use the following command which retrieves all dependencies necessary to build our application:
```bash
npm install
```
If the previous commands was executed successfully, it's time to start the app with the following command:
```bash
npm watch
```
As a result you should be taken to a browser with application running on localhost. Now you are ready to work!

## Technologies
Project is created with:
* HTML
* Sass for CSS
* Javascript
* Handlebars.js for templating engine [handlebars](https://handlebarsjs.com/)
* flatpickr.js for datepicker in booking [flatpickr](https://flatpickr.js.org/)
* rangeslider.js for slider in booking [rangeSlider](https://github.com/Stryzhevskyi/rangeSlider)
* Swiper for carousel on main page [Swiper](https://swiperjs.com/)
* json-server for fake REST API to simulate backend [json-server](https://www.npmjs.com/package/json-server)
* custom npm task runner

## Clean code

1. General editing is linted with [editorconfig](https://editorconfig.org/) which helps with basic editing such as tabs vs spaces. You can see the rules in `.editorconfig` file [here](https://github.com/natkalia/dystopias-kodilla-6.2/blob/master/.editorconfig).
2. **HTML**: HTML validation is done with [html-validate](https://www.npmjs.com/package/html-validate/).
3. **Styles**: Sass (and CSS) is linted with [stylelint](https://stylelint.io/). You can see the rules in `.styleintrc.json` file [here](https://github.com/natkalia/dystopias-kodilla-6.2/blob/master/.stylelintrc.json).
4. **JS**: Javascript is linted with [ESLint](http://eslint.org/). You can see the rules in `.eslintrc.json` file [here](https://github.com/natkalia/dystopias-kodilla-6.2/blob/master/.eslintrc.json).

## Todo
- [ ] add more styling
- [ ] add more RWD
- [ ] verify/implement browser compatibility
- [ ] add handling user clicking edit product button in Cart (now working as if it was a remove button)
- [ ] new feature: change logic for repeating events not to block available dates before start
- [ ] new feature: move info for booking page (number and location of tables, starters)
from handelbars template to fake API
- [ ] new feature: set min/max number of people to be able to book given table

## Project status
In progress.

## Credits
Coming soon.
