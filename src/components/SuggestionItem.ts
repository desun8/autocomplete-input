import { autobind } from "../decorators/autobind";
import { Listener } from "./Autocomplete";

export default class SuggestionItem {
  private static element: HTMLLIElement;
  private static input: HTMLInputElement;
  private static listener: Listener;

  private static create(text: string, focusable = true) {
    this.element = document.createElement("li");
    this.element.classList.add("suggestion-item");
    this.element.textContent = text;

    if (focusable) {
      this.element.setAttribute("tabindex", "-1");
    }
  }

  @autobind
  private static handleClick(event: Event) {
    this.input.value = (event.target as HTMLInputElement).textContent!;
    this.listener("no-request");
  }

  static add(
    text: string,
    appendTo: HTMLUListElement,
    input?: HTMLInputElement,
    listener?: Listener
  ) {
    this.create(text, !!listener);

    if (input && listener) {
      this.input = input;
      this.listener = listener;

      this.element.addEventListener("click", this.handleClick);
    } else {
      this.element.style.cursor = "unset";
    }

    appendTo.appendChild(this.element);
  }
}
