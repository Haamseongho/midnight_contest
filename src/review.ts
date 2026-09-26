import "./shims/node-buffer";
import "./style.css";
import { mountReviewer } from "./ui/reviewer";

// Dedicated entry: no holder UI, wallet connector, scenario or proof provider.
mountReviewer();
