// const host = 'http://localhost:8000';
const host = 'https://footlball-manager.herokuapp.com';

window.onload = function () {
    document.getElementById("defaultOpen").click();


    let matchesPanelInputs = document.getElementsByClassName('matches__panel__input'),
        matchesPanelSelect = document.getElementsByClassName('matches__panel__select')[0],
        matchesPanelButton = document.getElementsByClassName('matches__panel__start-btn')[0],
        matchesPanelTextarea = document.getElementsByClassName('matches__panel__textarea')[0],
        matchesPanelRingLoader = document.getElementsByClassName('lds-dual-ring matches-ring')[0],
        serversPanelSelect = document.getElementsByClassName('servers__panel__select')[0],
        serversPanelButton = document.getElementsByClassName('servers__panel__start-btn')[0],
        gsheetsPanelButton = document.getElementsByClassName('gsheets__panel__start-btn')[0],
        gsheetsPanelRingLoader = document.getElementsByClassName('lds-dual-ring gsheets-ring')[0],
        cardsPanelButton = document.getElementsByClassName('cards__panel__start-btn')[0],
        cardsPanelRingLoader = document.getElementsByClassName('lds-dual-ring cards-ring')[0],
        cardsPanelTextarea = document.getElementsByClassName('cards__panel__textarea')[0],
        weekendPanelButton = document.getElementsByClassName('weekend__panel__start-btn')[0],
        weekendPanelRingLoader = document.getElementsByClassName('lds-dual-ring weekend-ring')[0];


    matchesPanelButton.onclick = async function () {
        matchesPanelTextarea.innerText = '';
        matchesPanelRingLoader.classList.add('active');

        let res = await fetch(host + '/api/admin/matchResults', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version: matchesPanelSelect.value,
                matchId: matchesPanelInputs[0].value,
                count: matchesPanelInputs[1].value,
                saveToDb: matchesPanelInputs[2].checked,
            }),
        });
        let data = await res.json();

        matchesPanelTextarea.innerText = data.logs;
        matchesPanelRingLoader.classList.remove('active');
    };

    serversPanelButton.onclick = async function () {
        try {
            let res = await fetch(host + '/api/server/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        regionId: +serversPanelSelect.value
                    }),
                }),
                data = await res.json(), server = data.details.server,
                serversList = document.getElementsByClassName('servers')[0], serverItem = document.createElement('li'),
                region;

            switch (server.region.id) {
                case 1:
                    region = 'europe'
                    break;

                case 2:
                    region = 'north-america'
                    break;

                case 3:
                    region = 'south-america'
                    break;

                case 4:
                    region = 'north-asia'
                    break;

                case 5:
                    region = 'south-asia'
                    break;

                case 6:
                    region = 'north-africa'
                    break;

                case 7:
                    region = 'south-africa'
                    break;

                case 8:
                    region = 'close-east'
                    break;
            }

            serverItem.className = 'servers__item ' + region;
            serverItem.innerHTML = `<p>Server #${server.id} - ${server.region.name}</p>`;
            serverItem.dataset.id = server.id;
            serverItem.onclick = async function (event) {
                if (!this.classList.contains('active')) {
                    this.classList.add('active');

                    let res = await fetch(`${host}/api/admin/game_server/${serverItem.dataset.id}/countries`),
                        data = await res.json(), countries = data.details.countries;

                    let serverCountriesList = document.createElement('ul');
                    serverCountriesList.className = 'server-countries';

                    let activeLeagueItem = null, activeCountryItem = null;
                    for (let j = 0; j < countries.length; j++) {
                        let countryItem = document.createElement('li');

                        countryItem.className = 'server-countries__item';
                        countryItem.innerHTML = `<p>${countries[j].name}</p>`;
                        countryItem.dataset.id = countries[j].id;
                        countryItem.onclick = async function (event) {
                            if (!this.classList.contains('active')) {
                                this.classList.add('active');

                                let res = await fetch(`${host}/api/admin/game_server/${serverItem.dataset.id}/country/${countries[j].id}/leagues`),
                                    data = await res.json(), countryLeagues = data.details.countryLeagues;

                                let countryLeaguesList = document.createElement('ul');
                                countryLeaguesList.className = 'country-leagues';

                                for (let k = 0; k < countryLeagues.length; k++) {
                                    let leagueItem = document.createElement('li');

                                    leagueItem.className = 'country-leagues__item';
                                    leagueItem.innerHTML = `<p>League #${countryLeagues[k].id} - level: ${countryLeagues[k].level}, isFull: ${countryLeagues[k].isFull}</p>`;
                                    leagueItem.dataset.id = countryLeagues[k].id;
                                    leagueItem.onclick = async function (event) {
                                        if (!this.classList.contains('active')) {
                                            this.classList.add('active');

                                            let res = await fetch(`${host}/api/admin/league/${countryLeagues[k].id}/users`),
                                                data = await res.json(), leagueUsers = data.details.leagueUsers;

                                            let leagueUsersList = document.createElement('ul');
                                            leagueUsersList.className = 'league-users';

                                            for (let userIdx = 0; userIdx < leagueUsers.length; userIdx++) {
                                                let userItem = document.createElement('li');

                                                userItem.className = 'league-users__item';
                                                userItem.innerHTML = `<p>User #${leagueUsers[userIdx].player.id} - ${leagueUsers[userIdx].player.name} (${leagueUsers[userIdx].player.abbr})</p>`;
                                                userItem.dataset.id = leagueUsers[userIdx].playerId;

                                                leagueUsersList.appendChild(userItem);
                                            }

                                            if (activeLeagueItem !== null) {
                                                let listToRemove = activeLeagueItem.lastElementChild;
                                                activeLeagueItem.classList.remove('active');
                                                activeLeagueItem.removeChild(listToRemove);
                                            }
                                            activeLeagueItem = this;

                                            leagueItem.appendChild(leagueUsersList);
                                        }
                                        else {
                                            this.removeChild(this.lastElementChild);
                                            this.classList.remove('active');
                                            activeLeagueItem = null;

                                            event.from = 'fromLeagues';
                                        }
                                    };

                                    countryLeaguesList.appendChild(leagueItem);
                                }

                                if (activeCountryItem !== null) {
                                    let listToRemove = activeCountryItem.lastElementChild;
                                    activeCountryItem.classList.remove('active');
                                    activeCountryItem.removeChild(listToRemove);
                                }
                                activeCountryItem = this;

                                countryItem.appendChild(countryLeaguesList);
                            }
                            else if (!event.from && !(this.lastElementChild !== event.target && this.lastElementChild.contains(event.target))) {
                                this.removeChild(this.lastElementChild);
                                this.classList.remove('active');
                                activeCountryItem = null;

                                event.from = 'fromCountries';
                            }
                        };

                        serverCountriesList.appendChild(countryItem);
                    }

                    serverItem.appendChild(serverCountriesList);
                }
                else if (!event.from && !(this.lastElementChild !== event.target && this.lastElementChild.contains(event.target))) {
                    this.removeChild(this.lastElementChild);
                    this.classList.remove('active');
                }
            };

            serversList.appendChild(serverItem);

            alert(`Сервер #${server.id} (${server.region.name}) создан!`);
        }
        catch (e) {
            alert(e.message);
        }
    };

    gsheetsPanelButton.onclick = async function () {
        gsheetsPanelRingLoader.classList.add('active');

        try {
            let res = await fetch(host + '/api/admin/gsheets_parser/parse'), data = await res.json();

            alert(data.message);
        }
        catch (e) {
            alert(e.message);
        }
        finally {
            gsheetsPanelRingLoader.classList.remove('active');
        }
    };

    cardsPanelButton.onclick = async function () {
        cardsPanelTextarea.value = '';
        cardsPanelRingLoader.classList.add('active');

        try {
            let playersCount = document.getElementsByClassName('cards__panel__players-count')[0].value,
                res = await fetch(host + '/api/admin/cards/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        playersCount
                    }),
                }),
                data = await res.json();

            cardsPanelTextarea.value = JSON.stringify(data.details.data);
        }
        catch (e) {
            alert(e.message);
        }
        finally {
            cardsPanelRingLoader.classList.remove('active');
        }
    };

    weekendPanelButton.onclick = async function () {
        weekendPanelRingLoader.classList.add('active');

        try {
            let res = await fetch(host + '/api/debug/all_weekend_tournaments'),
                data = await res.json(),
                weekendLeagues = data.details.weekendLeagues,
                leaguesList = document.getElementsByClassName('weekend-leagues')[0];

            for (let i = 0; i < weekendLeagues.length; i++) {
                let leagueItem = document.createElement('li');

                let usersString = '';
                for (let usIdx = 0; usIdx < weekendLeagues[i].weekendLeaguePlayers.length; usIdx++) {
                    usersString += weekendLeagues[i].weekendLeaguePlayers[usIdx].playerId + ', ';
                }
                usersString = usersString.slice(0, usersString.length - 2);

                leagueItem.className = 'weekend-leagues__item';
                leagueItem.innerHTML =
                    `<div class="head"><p>Server id: ${weekendLeagues[i].server_id}</p><p>Country id: ${weekendLeagues[i].country_id}</p></div>` +
                    `<div class="body">${usersString}</div>`;
                leaguesList.appendChild(leagueItem);
            }
        }
        catch (e) {
            alert(e.message);
        }
        finally {
            weekendPanelRingLoader.classList.remove('active');
        }
    };

    (async function () {
        // матчи =====================================================================
        let res = await fetch(host + '/api/admin/usersIds'), data = await res.json();

        let playersList = document.getElementsByClassName('users')[0], activePlayerItem = null;

        data.players.forEach(player => {
            let playerItem = document.createElement('li');
            playerItem.className = 'users__item';
            playerItem.innerHTML = `<p>id: ${player.id}, players asm: ${player.playersASM}</p>`;
            playerItem.dataset.id = player.id;
            playersList.appendChild(playerItem);
        });

        let playersItems = document.getElementsByClassName('users__item');

        for (let i = 0; i < playersItems.length; i++) {
            playersItems[i].onclick = async function () {
                if (!playersItems[i].classList.contains('active')) {
                    let res1 = await fetch(host + '/api/admin/userMatches/' + playersItems[i].dataset.id);
                    let data1 = await res1.json();

                    let matchesList = document.createElement('ul');
                    matchesList.className = 'matches';

                    for (let j = 0; j < data1.matches.length; j++) {
                        let matchItem = document.createElement('li');
                        matchItem.className = 'matches__item';

                        let user1HTML, user2HTML;
                        if (+data1.matches[j].user1.id === +playersItems[i].dataset.id) {
                            user1HTML =
                                `<span class="bold">` +
                                `user1: (id=${data1.matches[j].user1.id}, ` +
                                `homeBonus=<span class="red">${data1.matches[j].user1.homeBonus}</span>, ` +
                                `avatarBonus=<span class="blue">${data1.matches[j].user1.avatarBonus}</span>, ` +
                                `T_players=<span class="green">${data1.matches[j].user1.T_players}</span>, ` +
                                `T_players_bonuses=<span class="yellow">${data1.matches[j].user1.T_players_bonuses}</span>, ` +
                                `T_players_bonuses_adv=<span class="pink">${data1.matches[j].user1.T_players_bonuses_adv}</span>)` +
                                `</span>`;

                            user2HTML =
                                `<span>` +
                                `user2: (id=${data1.matches[j].user2.id}, ` +
                                `homeBonus=<span class="red">${data1.matches[j].user2.homeBonus}</span>, ` +
                                `avatarBonus=<span class="blue">${data1.matches[j].user2.avatarBonus}</span>, ` +
                                `T_players=<span class="green">${data1.matches[j].user2.T_players}</span>, ` +
                                `T_players_bonuses=<span class="yellow">${data1.matches[j].user2.T_players_bonuses}</span>, ` +
                                `T_players_bonuses_adv=<span class="pink">${data1.matches[j].user2.T_players_bonuses_adv}</span>)` +
                                `</span>`;
                        }
                        else {
                            user1HTML =
                                `<span>` +
                                `user1: (id=${data1.matches[j].user1.id}, ` +
                                `homeBonus=<span class="red">${data1.matches[j].user1.homeBonus}</span>, ` +
                                `avatarBonus=<span class="blue">${data1.matches[j].user1.avatarBonus}</span>, ` +
                                `T_players=<span class="green">${data1.matches[j].user1.T_players}</span>, ` +
                                `T_players_bonuses=<span class="yellow">${data1.matches[j].user1.T_players_bonuses}</span>, ` +
                                `T_players_bonuses_adv=<span class="pink">${data1.matches[j].user1.T_players_bonuses_adv}</span>)` +
                                `</span>`;

                            user2HTML =
                                `<span class="bold">` +
                                `user2: (id=${data1.matches[j].user2.id}, ` +
                                `homeBonus=<span class="red">${data1.matches[j].user2.homeBonus}</span>, ` +
                                `avatarBonus=<span class="blue">${data1.matches[j].user2.avatarBonus}</span>, ` +
                                `T_players=<span class="green">${data1.matches[j].user2.T_players}</span>, ` +
                                `T_players_bonuses=<span class="yellow">${data1.matches[j].user2.T_players_bonuses}</span>, ` +
                                `T_players_bonuses_adv=<span class="pink">${data1.matches[j].user2.T_players_bonuses_adv}</span>)` +
                                `</span>`;
                        }

                        matchItem.innerHTML = `<span>match id: ${data1.matches[j].matchId}, ${user1HTML}, ${user2HTML}</span>`;
                        matchesList.appendChild(matchItem);
                    }

                    playersItems[i].appendChild(matchesList);
                    playersItems[i].classList.add('active');


                    if (activePlayerItem !== null) {
                        let listToRemove = activePlayerItem.lastElementChild;
                        activePlayerItem.classList.remove('active');
                        activePlayerItem.style.cursor = 'pointer';
                        activePlayerItem.removeChild(listToRemove);
                    }
                    activePlayerItem = playersItems[i];

                    playersItems[i].style.cursor = 'default';
                }
            };
        }
        // матчи =====================================================================


        // сервера =====================================================================
        res = await fetch(host + '/api/admin/game_servers');
        data = await res.json();

        let servers = data.details.servers;

        let serversList = document.getElementsByClassName('servers')[0];

        servers.forEach(server => {
            let serverItem = document.createElement('li');

            let region;
            switch (server.region.id) {
                case 1:
                    region = 'europe'
                    break;

                case 2:
                    region = 'north-america'
                    break;

                case 3:
                    region = 'south-america'
                    break;

                case 4:
                    region = 'north-asia'
                    break;

                case 5:
                    region = 'south-asia'
                    break;

                case 6:
                    region = 'north-africa'
                    break;

                case 7:
                    region = 'south-africa'
                    break;

                case 8:
                    region = 'close-east'
                    break;
            }

            serverItem.className = 'servers__item ' + region;
            serverItem.innerHTML = `<p>Server #${server.id} - ${server.region.name}</p>`;
            serverItem.dataset.id = server.id;

            serversList.appendChild(serverItem);
        });

        let serversItems = document.getElementsByClassName('servers__item');

        for (let i = 0; i < serversItems.length; i++) {
            let activeCountryItem = null;
            serversItems[i].onclick = async function (event) {
                if (!this.classList.contains('active')) {
                    this.classList.add('active');

                    let res = await fetch(`${host}/api/admin/game_server/${serversItems[i].dataset.id}/countries`),
                        data = await res.json(), countries = data.details.countries;

                    let serverCountriesList = document.createElement('ul');
                    serverCountriesList.className = 'server-countries';

                    let activeLeagueItem = null;
                    for (let j = 0; j < countries.length; j++) {
                        let countryItem = document.createElement('li');

                        countryItem.className = 'server-countries__item';
                        countryItem.innerHTML = `<p>${countries[j].name}</p>`;
                        countryItem.dataset.id = countries[j].id;
                        countryItem.onclick = async function (event) {
                            if (!this.classList.contains('active')) {
                                this.classList.add('active');

                                let res = await fetch(`${host}/api/admin/game_server/${serversItems[i].dataset.id}/country/${countries[j].id}/leagues`),
                                    data = await res.json(), countryLeagues = data.details.countryLeagues;

                                let countryLeaguesList = document.createElement('ul');
                                countryLeaguesList.className = 'country-leagues';

                                for (let k = 0; k < countryLeagues.length; k++) {
                                    let leagueItem = document.createElement('li');

                                    leagueItem.className = 'country-leagues__item';
                                    leagueItem.innerHTML = `<p>League #${countryLeagues[k].id} - level: ${countryLeagues[k].level}, isFull: ${countryLeagues[k].isFull}</p>`;
                                    leagueItem.dataset.id = countryLeagues[k].id;
                                    leagueItem.onclick = async function (event) {
                                        if (!this.classList.contains('active')) {
                                            this.classList.add('active');

                                            let res = await fetch(`${host}/api/admin/league/${countryLeagues[k].id}/users`),
                                                data = await res.json(), leagueUsers = data.details.leagueUsers;

                                            let leagueUsersList = document.createElement('ul');
                                            leagueUsersList.className = 'league-users';

                                            for (let userIdx = 0; userIdx < leagueUsers.length; userIdx++) {
                                                let userItem = document.createElement('li');

                                                userItem.className = 'league-users__item';
                                                userItem.innerHTML = `<p>User #${leagueUsers[userIdx].player.id} - ${leagueUsers[userIdx].player.name} (${leagueUsers[userIdx].player.abbr})</p>`;
                                                userItem.dataset.id = leagueUsers[userIdx].playerId;

                                                leagueUsersList.appendChild(userItem);
                                            }

                                            if (activeLeagueItem !== null) {
                                                let listToRemove = activeLeagueItem.lastElementChild;
                                                activeLeagueItem.classList.remove('active');
                                                activeLeagueItem.removeChild(listToRemove);
                                            }
                                            activeLeagueItem = this;

                                            leagueItem.appendChild(leagueUsersList);
                                        }
                                        else {
                                            this.removeChild(this.lastElementChild);
                                            this.classList.remove('active');
                                            activeLeagueItem = null;

                                            event.from = 'fromLeagues';
                                        }
                                    };

                                    countryLeaguesList.appendChild(leagueItem);
                                }

                                if (activeCountryItem !== null) {
                                    let listToRemove = activeCountryItem.lastElementChild;
                                    activeCountryItem.classList.remove('active');
                                    activeCountryItem.removeChild(listToRemove);
                                }
                                activeCountryItem = this;

                                countryItem.appendChild(countryLeaguesList);
                            }
                            else if (!event.from && !(this.lastElementChild !== event.target && this.lastElementChild.contains(event.target))) {
                                this.removeChild(this.lastElementChild);
                                this.classList.remove('active');
                                activeCountryItem = null;

                                event.from = 'fromCountries';
                            }
                        };

                        serverCountriesList.appendChild(countryItem);
                    }

                    serversItems[i].appendChild(serverCountriesList);
                }
                else if (!event.from && !(this.lastElementChild !== event.target && this.lastElementChild.contains(event.target))) {
                    this.removeChild(this.lastElementChild);
                    this.classList.remove('active');
                }
            };
        }
        // сервера =====================================================================
    })();
};

function openTab(evt, tabName) {
    // Declare all variables
    let i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}