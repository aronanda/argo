import angular from "angular";

import "./root.component";
import "./common/common.module";
import { components } from "./components/components.module";

export const root = angular
    .module("root", [
        components
    ])
    .name;
