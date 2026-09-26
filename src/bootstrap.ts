import "./style.css";
import { startApp } from "./ui/startup";
void startApp(() => import("./main"));
