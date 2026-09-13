import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { iniciarFaviconVivo } from "./lib/faviconVivo";

createRoot(document.getElementById("root")!).render(<App />);

// El ojo del favicon mira y parpadea en la pestaña.
iniciarFaviconVivo();
