import debounce from "lodash.debounce";


export default class CountrySearcher {
  debounceDelay = 300;
  inputSelector = "#search-box";
  countryListSelector = ".country-list";
  countryInfoSelector = ".country-info";
  countryListLimit = 20;
  filterFields = [
    "name",       // имя страны (содержит объект с разными вариантами)
    "capital",    // столица (массив, их может быть несколько)
    "population", // население
    "flags",      // ссылки на изображения флага (.png и .svg)
    "languages",  // массив языков
  ];

  constructor (
    baseUrl,
    {
      inputSelector,
      countryListSelector,
      countryInfoSelector,
      filterFields,
      statusMessageHandler, // Функция, вызываемая когда должно быть выведено сообщение
      countryInfoBuilder,   // Функция должна обрабатывать аргументы и возвращать готовый html
      countryListBuilder,   // То же самое, но для списка. В аргументы приходит массив стран.
    } = {}) {
      
    if (!baseUrl) throw console.error("Аргумент baseUrl обязателен");
    this.baseUrl = baseUrl;

    this.#setupProperties(arguments[1]);

    this.input = document.querySelector(this.inputSelector);
    this.countryList = document.querySelector(this.countryListSelector);
    this.countryInfo = document.querySelector(this.countryInfoSelector);

    this.#attachDebouncedListener();
  }

  // ========== Интерфейс ============

  setDebounceDelay(delay) {
    if (this.debounceDelay == delay) return;
    this.debounceDelay = delay;
    this.#attachDebouncedListener();
  }

  notify(msgClass, msg) {
    console.log(`${msgClass.toUpperCase()}:`, msg);

  }

  clearOutput() {
    this.countryInfo.innerHTML = "";
    this.countryList.innerHTML = "";
  }

  displayCountryList(data) {
    this.countryList.innerHTML = this.countryListBuilder(data);
  }

  displayCountryInfo(data) {
    this.countryInfo.innerHTML = this.countryInfoBuilder(data[0]);
  }

  countryListBuilder (data) {
    return "<pre>" + JSON.stringify(data, null, "  ") + "</pre>";
  }

  countryInfoBuilder (data) {
    return "<pre>" + JSON.stringify(data, null, "  ") + "</pre>";
  }

  // ========== Внутренняя логика ============

  #setupProperties(params) {
    if (!params) return;
    const backup = {...this.filterFields};
    Object.assign(this, params);
    if (params.filterFields) this.filterFields = {...backup, ...this.filterFields};
  }

  #attachDebouncedListener() {
    if (this.debouncedListener) this.input.removeEventListener("input", this.debouncedListener);
    this.debouncedListener = debounce(this.#search.bind(this), this.debounceDelay);
    this.input?.addEventListener("input", this.debouncedListener);

  }

  #search({target: {value: countryName}}) {
    countryName = countryName.trim();
    if (countryName==="") {
      this.clearOutput()
      return;
    }
    fetch(this.baseUrl + countryName + "?fields=" + this.filterFields.join(","))
      .then(responce => responce.json())
      .then(this.#parseData.bind(this))
      .catch(this.#throwErrorMsg.bind(this));
  }

  #parseData(data) {
    this.clearOutput()
    if (data.status==404 && data.message==="Not Found") {
      this.notify("failure", "Oops, there is no country with that name");
    } else if (data.status) {
      this.#throwErrorMsg(data);
    } else if (data.length == 1) {
      this.displayCountryInfo(data);
    } else if (data.length <= this.countryListLimit) {
      this.displayCountryList(data);
    } else {
      this.notify("info", "Too many matches found. Please enter a more specific name.");
    }
  }
  
  #throwErrorMsg(error) {
    this.notify("failure", `<b>Error ${error.status || ""}</b><br>${error.message}`);
  }
}
