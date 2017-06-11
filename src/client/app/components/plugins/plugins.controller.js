import Introspected from "introspected";

import { PluginsService } from "../plugins/plugins.service";

export class PluginsController {
    constructor(render, template) {

        this.state = Introspected({
            plugins: [],
            pluginsInfo: {
                count: 0
            }
        }, state => template.update(render, state));

        this.pluginService = new PluginsService(this.state);

        PluginsService.refresh();
    }

    engage() {
        PluginsService.engagePlugins(this.state.plugins);
    }
}
PluginsController.$inject = ["PluginsService"];
