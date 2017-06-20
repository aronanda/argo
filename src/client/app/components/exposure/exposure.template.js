import { Util } from "../../util";

export class ExposureTemplate {
    static update(render, state) {
        if (state.exposure.length) {
            ExposureTemplate.renderExposure(render, state);
        } else {
            ExposureTemplate.renderNoExposure(render);
        }
    }

    static renderExposure(render, state) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <table class="f6 w-100 mw8 center" cellpsacing="0">
                    <thead>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Type</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Market</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Units</th>
                    </thead>

                    <tbody>
                        <tr ng-repeat="exposure in $ctrl.exposures">
                            <td class="pv1 pr1 bb b--black-20 tr">{{ exposure.type }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ exposure.market }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ exposure.units | number:0 }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    static renderNoExposure(render) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <p class="f6 w-100 mw8 tc b">No exposures.</p>
            </div>
        `;
    }
}
