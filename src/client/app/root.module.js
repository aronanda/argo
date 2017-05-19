import angular from "angular";

import "./root.component";
import { common } from "./common/common.module";
import { components } from "./components/components.module";

export const root = angular
    .module("root", [
        common,
        components
    ])
    .name;
