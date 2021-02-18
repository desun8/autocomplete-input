import { Listener } from "./Autocomplete";
import SuggestionItem from "./SuggestionItem";

export default class SuggestionContainer {
  constructor(
    public element: HTMLUListElement,
    private input: HTMLInputElement,
    private listener: Listener
  ) {}

  setEmptyStyle(value: "add" | "remove") {
    switch (value) {
      case "add":
        this.element.classList.add("is-empty");
        break;
      case "remove":
        this.element.classList.remove("is-empty");
        break;
      default:
        break;
    }
  }

  reset() {
    this.element.innerHTML = "";
    this.setEmptyStyle("remove");
  }

  addItems(items: string[]) {
    this.reset();

    if (items.length) {
      items.forEach((string) => {
        SuggestionItem.add(string, this.element, this.input, this.listener);
      });
    } else {
      // Сообщение, если ничего не нашлось
      this.setEmptyStyle("add");
      SuggestionItem.add("Ничего не найдено 🐼", this.element);
    }
  }
}
