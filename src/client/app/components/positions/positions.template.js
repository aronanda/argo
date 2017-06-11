import { Util } from "../../util";

export class PositionsTemplate {
    static update(render, state) {
        if (state.positions.length) {
            PositionsTemplate.renderPositions(render, state);
        } else {
            PositionsTemplate.renderNoPositions(render);
        }
    }

    static renderPositions(render, state) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <table class="f6 w-100 mw8 center" cellpsacing="0">
                    <thead>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Type</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Market</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Units</th>
                        <th class="fw6 bb b--black-20 tl pb1 pr1 bg-white tr">Avg. Price</th>
                    </thead>

                    <tbody>
                        <tr ng-repeat="position in $ctrl.positions">
                            <td class="pv1 pr1 bb b--black-20 tr">{{ position.side }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ position.instrument }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ position.units | number }}</td>
                            <td class="pv1 pr1 bb b--black-20 tr">{{ position.avgPrice }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    static renderNoPositions(render) {
        /* eslint indent: off */
        render`
            <div class="h4 overflow-auto">
                <p class="f6 w-100 mw8 tc b">No positions.</p>
            </div>
        `;
    }
}
