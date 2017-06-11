import { Util } from "../../util";

export class PluginsTemplate {
    static update(render, state) {
        if (state.plugins.length) {
            PluginsTemplate.renderPlugins(render, state);
        } else {
            PluginsTemplate.renderNoPlugins(render);
        }
    }

    static renderPlugins(render, state) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <table class="f6 w-100 mw8 center" cellpsacing="0">
                    <thead>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Enabled</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white">Plugin</th>
                    </thead>

                    <tbody>
                        <tr ng-repeat="(plugin, value) in $ctrl.plugins">
                            <td class="pv1 pr1 bb b--black-20 tr">
                                <input type="checkbox" ng-model="$ctrl.plugins[plugin]" ng-change="$ctrl.engage()">
                            </td>
                            <td class="pv1 pr1 bb b--black-20">{{ plugin }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    static renderNoPlugins(render) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <p class="f6 w-100 mw8 tc b">No plugins.</p>
            </div>
        `;
    }
}
