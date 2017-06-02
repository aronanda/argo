import { Util } from "../../util";

export class TokenDialogTemplate {
    static update(render, state, events) {
        if (!state.tokenModalIsOpen) {
            Util.renderEmpty(render);
            return;
        }

        if (!state.accounts.length) {
            TokenDialogTemplate.renderTokenModal(render, state, events);
        } else {
            TokenDialogTemplate.renderAccountsListModal(render);
        }
    }

    static renderTokenModal(render, state, events) {
        /* eslint indent: off */
        render`
            <div class="fixed absolute--fill bg-black-70 z5">
            <div class="fixed absolute-center z999">

            <main class="pa4 black-80 bg-white">
                <form class="measure center">
                    <fieldset id="login" class="ba b--transparent ph0 mh0">
                        <legend class="f4 fw6 ph0 mh0 center">Token Dialog</legend>

                        <div class="flex flex-row items-center mb2 justify-between">
                            <label for="practice" class="lh-copy">Practice</label>
                            <input class="mr2" type="radio" name="environment" ng-model="$ctrl.environment" value="practice">
                        </div>
                        <div class="flex flex-row items-center justify-between mb2">
                            <label for="live" class="lh-copy">Live</label>
                            <input class="mr2" type="radio" name="environment" ng-model="$ctrl.environment" value="live">
                        </div>

                        <div class="mv3">
                            <input class="b pa2 ba bg-transparent w-100"
                                placeholder="Token" name="token" id="token" ng-model="$ctrl.token">
                        </div>
                    </fieldset>

                    <div class="flex flex-row items-center justify-around">
                        <input id="loginCancel" class="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                            type="button" value="Cancel"
                            onclick="${() => {
                                state.tokenModalIsOpen = false;
                            }}">

                        <input id="loginOk" class="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                            type="button" value="Ok"
                            onclick="${e => {
                                events(e, {
                                    environment: state.tokenInfo.environment

                                    // token: state.tokenInfo.token
                                });
                            }}">
                    </div>
                </form>
            </main>

            </div>
            </div>
        `;
    }

    static renderAccountsListModal(render) {
        /* eslint indent: off */
        render`
            <div class="fixed absolute--fill bg-black-70 z5">
            <div class="fixed absolute-center z999">

            <main class="pa4 black-80 bg-white">
                <form class="measure center">
                    <fieldset id="login" class="ba b--transparent ph0 mh0">
                        <legend class="f4 fw6 ph0 mh0 center">Accounts List</legend>
                    </fieldset>

                    <div class="flex flex-row items-center justify-around">
                        <input class="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib"
                            type="submit" value="{{ account.id }}"
                            ng-repeat="account in $ctrl.accounts"
                            ng-click="$ctrl.selectAccount($index)">
                    </div>
                </form>
            </main>

            </div>
            </div>
        `;
    }
}


