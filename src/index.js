import './css/styles.css';
import "@fortawesome/fontawesome-free/css/all.min.css"

import CountrySearcher from "./components/country-searcher.js";
import countryInfoTemplate from "./markup/partials/country-info.hbs"
import countryListTemplate from "./markup/partials/country-list.hbs"

import { Notify } from 'notiflix/dist/notiflix-notify-aio-3.2.5.min.js';
Notify.init({
  useFontAwesome: true,
  fontAwesomeIconStyle: "shadow",
  fontAwesomeIconSize: "24px",
  fontFamily: "San Francisco Pro Display Medium",
  fontSize: "1em",
  width: "320px",
  plainText: false,
  messageMaxLength: 400,
});

const BASE_URL = "https://restcountries.com/v3.1/name/";


const mySearcher = new CountrySearcher(BASE_URL);
mySearcher.countryListLimit = 10;
mySearcher.notify = statusMessageHandler;
mySearcher.countryInfoBuilder = buildCountryInfoMockup;
mySearcher.countryListBuilder = buildCountryNamesMockup;


function statusMessageHandler(msgClass, msg) {
  Notify[msgClass]?.(msg);
}

function buildCountryNamesMockup(data) {
  return countryListTemplate(data);
}

function buildCountryInfoMockup({name, capital, population, flags, languages}) {
  const fixPlural = (value) => value > 1 ? "s" : "";
  languages = Object.values(languages)
  const templateParams = {
    name: name.common,
    capital: capital.join(","),
    population: population,
    flag: flags.svg || flags.png,
    languages: languages.join(","),
    pluralCapitals: fixPlural(capital),
    pluralLanguages: fixPlural(languages.length),
  }
  return countryInfoTemplate(templateParams);
}









