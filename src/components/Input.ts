import { autobindThrottle, autobind } from "../decorators/autobind";
import { Listener } from "./Autocomplete";

export default class Input {
  constructor(
    public element: HTMLInputElement,
    public isValid: boolean,
    private listener: Listener
  ) {
    this.element.addEventListener("input", this.handleInput);
    this.element.addEventListener("focus", this.handleFocus);
  }

  @autobindThrottle
  private handleInput() {
    this.listener();
  }

  @autobind
  private handleFocus() {
    if (!this.isValid) {
      this.listener("fetched");
    }
  }
}
