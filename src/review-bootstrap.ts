import "./style.css";
import { startApp } from "./ui/startup";
// Separate import graph: never pull the holder entry into reviewer-only builds.
void startApp(() => import("./review"));
