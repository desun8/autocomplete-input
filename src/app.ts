import Autocomplete from "./components/Autocomplete";
import { worker } from "./mocks/browser";

worker.start();

const container = document.querySelector("#input")! as HTMLElement;
new Autocomplete(container);
