import angular from "angular";

import "./app.component";
import { appConfig } from "./app.config";

export const app = angular
    .module("common.app", [])
    .config(appConfig)
    .name;
