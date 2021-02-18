import { autobind } from "../decorators/autobind";
import Input from "./Input";
import SuggestionContainer from "./SuggestionContainer";

export type Listener = (t?: "default" | "no-request" | "fetched") => void;

export default class Autocomplete {
  private input: Input;
  private suggestionContainer: SuggestionContainer;
  private sugestions: string[] = [];
  // Можно ли его связать с input.value?
  // Чтобы было как в реакте (контролируемый инпут?)
  // Что input.value зависит от state.value
  private value = "";
  private show = false;
  private shouldUpdate = false;
  isValid = false;

  constructor(private container: HTMLElement) {
    const inputElm = this.container.querySelector("input");

    if (inputElm) {
      this.input = new Input(inputElm, this.isValid, this.listener);
      this.value = this.input.element.value;
    } else {
      throw new Error("Отсутствует необходимый <input>");
    }

    const suggElm = this.container.querySelector(
      "ul.suggestion-container",
    ) as HTMLUListElement;

    if (suggElm) {
      this.suggestionContainer = new SuggestionContainer(
        suggElm,
        this.input.element,
        this.listener,
      );
    } else {
      throw new Error(
        "Отсутствует необходимый элемент-контейнер - 'ul.suggestion-container'",
      );
    }

    this.addEvents();
  }

  updateValue() {
    const newValue = this.input.element.value;
    if (this.value !== newValue) {
      this.value = newValue;

      if (newValue === "") {
        this.sugestions = [];
      }

      this.shouldUpdate = true;
    }
  }

  checkValidation(checkOnSubmit = false) {
    let isValid = false;

    if (this.sugestions.length) {
      isValid = this.sugestions.some((suggestion) => suggestion === this.value);
    }

    if (isValid) {
      this.container.classList.remove("has-error");
      this.container.dataset.isValid = "true";
    } else if (this.value === "" && !checkOnSubmit) {
      this.container.classList.remove("has-error");
    } else {
      this.container.classList.add("has-error");
      this.container.dataset.isValid = "false";
    }

    this.isValid = isValid;
    this.input.isValid = isValid;
  }

  @autobind
  listener(type: "default" | "no-request" | "fetched" = "default") {
    this.show = true;
    this.updateValue();

    if (this.shouldUpdate) {
      this.shouldUpdate = false;

      this.checkValidation();

      if (type === "default") {
        this.getSuggestions(this.value);
      }
    }

    if (type === "fetched" && this.sugestions.length) {
      this.suggestionContainer.addItems(this.sugestions);
      this.container.classList.add("is-active");
    }
  }

  private getSuggestions(value: string) {
    if (value === "") {
      this.suggestionContainer.reset();
      return;
    }

    fetch("/api/streets", {method: "POST", body: value})
      .then(response =>
        response.json(),
      )
      .then(data => {
        if (data.success === false) {
          throw new Error("Ошибка запроса");
        }

        const results: string[] = data.results;

        this.sugestions = results;
        this.checkValidation();

        if (this.value && this.show) {
          this.suggestionContainer.addItems(results);
          this.container.classList.add("is-active");
        }

      })
      .catch(error => {
        console.error("Во время запроса что то пошло не так 🐼", error);
      });
  }

  private hideAutocomplete() {
    this.suggestionContainer.reset();
    this.show = false;
    this.container.classList.remove("is-active");
  }

  private addEvents() {
    let currFocus = 0;

    /**
     * Навигация с помощью клавиатуры
     */
    this.container.addEventListener("keydown", (event: KeyboardEvent) => {
      const input = this.input.element;
      // Для того, чтобы каждый раз не искать элементы:
      // Можно вынести в конструктор
      // И обновлять во время listener()
      const autocompleteItems = this.container.querySelectorAll(
        ".suggestion-item",
      );

      let nextActiveElement: HTMLElement | undefined;
      switch (event.key) {
        case "ArrowDown":
          if (autocompleteItems.length) {
            event.preventDefault();
            currFocus =
              currFocus < autocompleteItems.length ? currFocus + 1 : currFocus;

            nextActiveElement = autocompleteItems[currFocus - 1] as HTMLElement;

            nextActiveElement.focus();
          }
          break;
        case "ArrowUp":
          if (autocompleteItems.length) {
            event.preventDefault();

            currFocus = currFocus !== 0 ? currFocus - 1 : 0;

            nextActiveElement =
              currFocus === 0
                ? input
                : (autocompleteItems[currFocus - 1] as HTMLElement);

            nextActiveElement.focus();
          }
          break;
        case "Enter":
          const activeElement = document.activeElement;
          if (activeElement?.classList.contains("suggestion-item")) {
            event.preventDefault();
            this.input.element.value = activeElement.textContent!;
            this.hideAutocomplete();
            this.listener("no-request");
            currFocus = 0;
          }
          break;
        case "Escape":
        case "Tab":
          this.hideAutocomplete();
          currFocus = 0;
          break;
        default:
          break;
      }
    });

    /**
     * Закрываем список автокомлита при клике вне инпута
     */
    document.addEventListener("click", (event: Event) => {
      if (this.show) {
        if (event.target! !== this.input.element) {
          console.log("hide autocomplete by click");

          this.hideAutocomplete();
        }
      }
    });
  }

  reset() {
    this.input.element.value = "";
    this.listener("no-request");
  }
}
