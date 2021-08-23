"use strict";

// ############## DECLARE VARIABLES ##############

// Declare card names for each category
var card_names = [
	[ 'Rooms', [ 'Ballroom', 'Billiard Room', 'Conservatory', 'Dining Room', 'Hall', 'Kitchen', 'Library', 'Lounge', 'Study' ] ],
	[ 'Weapons', [ 'Candlestick', 'Dagger', 'Lead Pipe', 'Revolver', 'Rope', 'Wrench' ] ],
	[ 'Suspects', [ 'Green', 'Mustard', 'Orchid', 'Peacock', 'Plum', 'Scarlett' ] ]
];

// Initialise game settings object
var game_settings = new Object();

// First column (row headers)
var cards;

// Number of rows
var num_cards = 0;
for (var i = 0; i < card_names.length; i++) {
	num_cards += card_names[i][1].length;
}

// The rest of the columns (players)
//game_settings.players = [ 'Adam', 'Boaz', 'Cyrus', 'Darius', 'Elijah', 'Felix' ];

// Grid for the status of all the cells
var grid_array;

var newGame = true;
var current_player;
var num_positive_answers = [];
var rounds = [];
var round;



// ########## DIALOG FUNCTIONS ##########

function clearDialog() {

	$('#dialog').dialog('destroy');
	$("#dialog-container").html('');

}

function showSliderDialog(title, width, callback, options) {

	clearDialog();

	var html = '<div id="dialog">';
	html += '<div id="sliders">';
	for (var c = 0; c < options.length; c++ ) {
		html += '<div class="custom-label">' + options[c][0] + '</div>';
		html += '<div class="custom-slider" id="slider-' + c + '" data-index=' + c + '>';
		html += '<div class="custom-handle ui-slider-handle"></div>'
		html += '</div>';
	}
	html += '</div>';
	html += '<div id="sliders-total-container">Total: <span id="sliders-total"></span></div>';
	html += '</div>';
	$('#dialog-container').html(html);
	var total = 0
	$('.custom-slider').each(function() {
		var handle = $(this).find('div');
		var value = options[$(this).data('index')][1];
		total += value;
		var min = options[$(this).data('index')][2];
		var max = options[$(this).data('index')][3];
		$(this).slider({
			create: function() {
				handle.text($(this).slider('value'));
			},
			slide: function(event, ui) {
				handle.text(ui.value);
			},
			change: function(event, ui) {
				var t = 0;
				$('.custom-slider').each(function() {
					t += $(this).slider('value');
				});
				$('#sliders-total').text(t + ' / ' + num_cards);
				if (t > num_cards) {
					$('#dialog').next().find('button:contains("OK")').button('disable');
					$('#sliders-total').addClass('total-error');
				} else {
					$('#dialog').next().find('button:contains("OK")').button('enable');
					$('#sliders-total').removeClass('total-error');
				}
			},
			range: "min",
			value: value,
			min: min,
			max: max
		});
	});

	$('#dialog').dialog({
		title: title,
		modal: true,
		buttons: [{
			text: 'OK',
			click: function () {
				var selected = [];
				$('.custom-slider').each(function() {
					selected.push($(this).slider('value'));
				});
				clearDialog();
				callback(selected);
			}
		}],
		width: width
	});

	$('#slider-' + game_settings.me).slider('disable');
	$('#sliders-total').text(total + ' / ' + num_cards);
	if (total > num_cards) {
		$('#dialog').next().find('button:contains("OK")').button('disable');
		$('#sliders-total').addClass('total-error');
	} else {
		$('#dialog').next().find('button:contains("OK")').button('enable');
		$('#sliders-total').removeClass('total-error');
	}

	$("#dialog").dialog("open");

}

function showOptionButtonsDialog(title, message, width, options) {

	clearDialog();

	var html = '<div id="dialog">' + message + '</div>';
	$("#dialog-container").html(html);

	var buttons = []
	for (var i = 0; i < options.length; i++) {
		buttons.push({
			text: options[i][0],
			click: options[i][1]
//			icon: ui-icon-check
		});
	}

	$('#dialog').dialog({
		title: title,
		modal: true,
		buttons: buttons,
		width: width
	});

	$("#dialog").dialog("open");

}

function showRadioDialog(title, width, callback, options) {

	clearDialog();

	var html = '<div id="dialog">';
	html += '<div id="radioinput">';
	for (var c = 0; c < options.length; c++ ) {
		html += '<fieldset>';
		html += '<div class="controlgroup">';
		html += '<legend>' + options[c][0] + '</legend>';
		for (var i = 0; i < options[c][1].length; i++) {
			var option_label = options[c][1][i][0];
			var option_value = options[c][1][i][1];
			html += '<label for="radio-' + c + '-' + i + '">' + option_label;
			html += '<input type="radio" data-index="[' + option_value + ']" id="radio-' + c + '-' + i + '" name="radio-' + c + '">';
			html += '</label>';
		}
		html += '</div>';
		html += '</fieldset>';
	}
	html += '</div>';
	html += '</div>';
	$("#dialog-container").html(html);
	$('.controlgroup').controlgroup();
	$('#dialog').dialog({
		title: title,
		modal: true,
		buttons: [{
			text: 'OK',
			click: function () {
				var selected = [];
				$('#dialog :radio:checked').each(function() {
					selected.push($(this).data('index'));
				});
				clearDialog();
				callback(selected);
			}
		}],
		width: width
	});
	$('#dialog :radio').change(function(){
		var formComplete = true;
		$('#dialog .controlgroup').each(function() { if ($(this).find(':radio:checked').length != 1) { formComplete = false; } });
		if (formComplete == true) {
			$('#dialog').next().find('button:contains("OK")').button('enable');
		} else {
			$('#dialog').next().find('button:contains("OK")').button('disable');
		}
	});
	$('#dialog').next().find('button:contains("OK")').button('disable');
	$("#dialog").dialog("open");


}


function showCheckboxDialog(title, width, callback, options, expected = 0) {

	clearDialog();

	var html = '<div id="dialog">';
	html += '<div class="widget">';
	for (var c = 0; c < options.length; c++ ) {
		html += '<fieldset>';
		html += '<legend>' + options[c][0] + '</legend>';
		for (var i = 0; i < options[c][1].length; i++) {
			var option_label = options[c][1][i][0];
			var option_value = options[c][1][i][1];
			html += '<label for="checkbox-' + c + '-' + i + '">' + option_label;
			html += '<input type="checkbox" data-index="[' + option_value + ']" id="checkbox-' + c + '-' + i + '">';
			html += '</label>';
		}
		html += '</fieldset>';
	}
	html += '</div>';
	html += '</div>';
	$("#dialog-container").html(html);
	$('#dialog input').checkboxradio();
	$('#dialog').dialog({
		title: title,
		modal: true,
		buttons: [{
			text: 'OK',
			click: function () {
				var selected = [];
				$('#dialog :checkbox:checked').each(function() {
					selected.push($(this).data('index'));
				});
				clearDialog();
				callback(selected);
			}
		}],
		width: width
	});

	// Expected number of selected boxes
	if (expected != 0) {
		if ($('#dialog :checkbox:checked').length != expected) {
			$('#dialog').next().find('button:contains("OK")').button('disable');
		}
		$('#dialog :checkbox').on('change', function() {
			if ($('#dialog :checkbox:checked').length != expected) {
				$('#dialog').next().find('button:contains("OK")').button('disable');
			} else {
				$('#dialog').next().find('button:contains("OK")').button('enable');
			}
		});
	}

	$("#dialog").dialog("open");


}


function createBlankArray() {

	grid_array = [];
	cards = [];

	for (var k = 0; k < game_settings.players.length; k++) {
		num_positive_answers.push(0);
		grid_array[k] = [];
		for (var i = 0; i < card_names.length; i++) {
			cards[i] = []
			grid_array[k][i] = [];
			for (var j = 0; j < card_names[i][1].length; j++) {
				cards[i][j] = null;
				grid_array[k][i][j] = null;
			}
		}
	}

}

function updateTable() {

	// Iterate over players
	var html = '<table id="grid">\n';
	html += '<tr>\n';
	html += '<th class="cards" style="width:15%;">Cards</th>\n';
	for (var i = 0; i < game_settings.players.length; i++) {
		if (i == game_settings.me) {
			html += '<th style="width:' + 85 / game_settings.players.length + '%" class="yellow-text">' + game_settings.players[i] + '</th>\n';
		} else {
			html += '<th style="width:' + 85 / game_settings.players.length + '%">' + game_settings.players[i] + '</th>\n';
		}
	}
	html += '</tr>\n';

	for (var i = 0; i < cards.length; i++) {

		// Category names
		html += '<tr class="header"><td class="cards">' + card_names[i][0] + '</td>\n';
		for (var k = 0; k < game_settings.players.length; k++ ){ html += '<td></td>\n'; }
		html += '</tr>\n';
		for (var j = 0; j < cards[i].length; j++) {

			// Row headers (card names)
			if (cards[i][j] === null) {
				html += '<tr><td class="cards">' + card_names[i][1][j] + '</td>';
			} else if (cards[i][j] === false) {
				html += '<tr><td class="empty-cards"></td>';
			} else if (cards[i][j] === true) {
				html += '<tr><td class="green cards">' + card_names[i][1][j] + '</td>';
			} else if (cards[i][j] === 0) {
				html += '<tr><td class="empty-cards">' + card_names[i][1][j] + '</td>';
			} else {
				html += '<tr><td class="missing-cards">' + card_names[i][1][j] + '</td>';
			}

			// Table cells
			for (var k = 0; k < game_settings.players.length; k++ ) {
				if (grid_array[k][i][j] === null) {
					html += '<td></td>';
				} else if (grid_array[k][i][j] === false) {
					html += '<td class="red"></td>';
				} else if (grid_array[k][i][j] === true) {
					html += '<td class="green">' + card_names[i][1][j] + '</td>';
				} else {
					html += '<td>' + grid_array[k][i][j].join(' ') + '</td>';
				}
			}
			html += '</tr>\n';
		}
	}

	// Update table
	$('#grid-container').html(html);
	
}

// ########## SETUP FUNCTIONS ##########

function inputPlayers() {

	game_settings.players = [];
	var player;
	var counter = 1;
	var question = 'Please enter name of Player ' + counter;
	while (player != "") {
		var player = prompt(question);
		if (player != null) {
			game_settings.players.push(player);
			counter += 1;
			question = 'Please enter name of Player ' + counter + '\nEnter blank when finished';
		} else {
			game_settings.players = []
			return;
		}
	}
	if (counter == 2) {
		return;
	}
	game_settings.players.pop();

}

function assignPlayer(i) {

	return function() {

		game_settings.me = i;

		// Next
		chooseStartingCards();

	}

}

function chooseStartingCards() {

	var options = [];

	for (var i = 0; i < cards.length; i++) {
		options[i] = [card_names[i][0], []]
		for (var j = 0; j < cards[i].length; j++) {
			options[i][1].push([card_names[i][1][j], [i,j]]);
		}
	}

	showCheckboxDialog('Which cards do you have?', 800, selectStartingCards, options);

}

function selectStartingCards(selected) {

	// Set starting cards as variable
	game_settings.starting_cards = selected;

	// Assign my cards to the grid array (do this in logic? - using false to not show selected cards when choosing missing cards)
	for (var idx = 0; idx < game_settings.starting_cards.length; idx++) {
		var i = game_settings.starting_cards[idx][0];
		var j = game_settings.starting_cards[idx][1];
		for (var k = 0; k < game_settings.players.length; k++) {
			if (k == game_settings.me) {
				// The cards I have
				grid_array[k][i][j] = true;
			} else {
				// Nobody else has these
				grid_array[k][i][j] = false;
			}
		}
		cards[i][j] = false;
	}

	// Next
	choosePlayersHandSizes();

}

function choosePlayersHandSizes() {

	var options = [];

	var my_hand_size = game_settings.starting_cards.length;

	for (var i = 0; i < game_settings.players.length; i++) {
		options[i] = [game_settings.players[i], my_hand_size, 0, 9]
	}

	showSliderDialog('How many cards does each player have?', 500, selectPlayersHandSizes, options)

}

function selectPlayersHandSizes(selected) {

	game_settings.hand_sizes = selected;

	// Next

	chooseMissingCards();

}


function chooseMissingCards() {

	var num_missing_cards = num_cards - game_settings.hand_sizes.reduce((a, b) => a + b, 0);

	if (num_missing_cards > 0) {

		var options = [];

		for (var i = 0; i < cards.length; i++) {
			options[i] = [card_names[i][0], []]
			for (var j = 0; j < cards[i].length; j++) {
				if (cards[i][j] !== false) {
					options[i][1].push([card_names[i][1][j], [i,j]]);
				}
			}
		}

		if (num_missing_cards == 1) {

			var title = 'Select the one card excluded from this game.'

		} else {

			var title = 'Select the ' + num_missing_cards + ' cards excluded from this game.'

		}

		showCheckboxDialog(title, 800, selectMissingCards, options, num_missing_cards);

	} else {

		chooseStartingPlayer();

	}


}

function selectMissingCards(selected) {

	// Set missing cards as global variable

	game_settings.missing_cards = selected;


	// Remove missing cards from grid array (do this in logic?)

	if (typeof(game_settings.missing_cards) !== "undefined") {

		for (var idx = 0; idx < game_settings.missing_cards.length; idx++) {
			var i = game_settings.missing_cards[idx][0];
			var j = game_settings.missing_cards[idx][1];
			for (var k = 0; k < game_settings.players.length; k++) {
				grid_array[k][i][j] = false;
			}
			cards[i][j] = "missing";
		}

	}

	// Next

	chooseStartingPlayer();

}

function chooseStartingPlayer() {

	var options = [];

	for (var i = 0; i < game_settings.players.length; i++) {
		options.push([game_settings.players[i], selectStartingPlayer(i)]);
	}

	showOptionButtonsDialog('Choose player', 'Which player is starting?', 500, options);

}


function selectStartingPlayer(i) {

	return function() {

		current_player = i;

		initialiseGame();

	}

}

function initialiseGame() {

	clearDialog();

	// Change next button functionality

	newGame = false;

	// Update next button label

	if (current_player == game_settings.me) {
		var label = 'Your round';
	} else {
		var label = game_settings.players[current_player] + "'s round";
	}
	$('#next-button').html(label);


	// Create rounds table

	var html = '<table id="rounds-table">';
	html += '<tr>';
	html += '<th style="width:25%;">Player</th>';
	html += '<th style="width:25%;">Room</th>';
	html += '<th style="width:25%;">Weapon</th>';
	html += '<th style="width:25%;">Suspect</th>';
	for (var i = 0; i < game_settings.players.length; i++) {
		html += '<th>' + game_settings.players[i][0] + '</th>';
	}
	html += '</tr>';
	html += '</table>';
	$('#rounds-div').html(html);


	// Update logic here?

	applyPlayerLogic(game_settings.me);

	// Update the HTML table

	updateTable();

	// Package game settings
//	var json_game_settings = JSON.stringify(game_settings);


	var settings_log = 'Game settings\n';
	settings_log += '──────────────\n';
	settings_log += ' Players:\n';

	for (var i = 0; i < game_settings.players.length; i++) {
		settings_log += '  ' + game_settings.players[i] + ' (' + game_settings.hand_sizes[i] + ' cards)\n';
	}

	settings_log += ' Me: ' + game_settings.players[game_settings.me] + '\n';

	settings_log += ' My cards:\n';

	for (var x = 0; x < game_settings.starting_cards.length; x++) {
		var i = game_settings.starting_cards[x][0];
		var j = game_settings.starting_cards[x][1];
		settings_log += '  ' + card_names[i][1][j] + '\n';
	}

	settings_log += ' Missing cards:\n';

	for (var x = 0; x < game_settings.missing_cards.length; x++) {
		var i = game_settings.missing_cards[x][0];
		var j = game_settings.missing_cards[x][1];
		settings_log += '  ' + card_names[i][1][j] + '\n';
	}

	settings_log += '──────────────';

	// Add game settings to log
	outputToLog(settings_log);


}


function outputToLog(text) {

	$('#log-div').append(text + '\n');
	$('#log-div')[0].scrollTop = $('#log-div')[0].scrollHeight;

}

function outputRound(text) {

	$('#rounds-table').append(text + '\n');
	$('#rounds-table')[0].scrollTop = $('#rounds-table')[0].scrollHeight;		// doesn't seem to work

}

// ########## ROUND FUNCTIONS ##########

function nextFunction() {

	if (newGame == true) {
		startGame();
		return;
	}

	nextRound();

}

function nextRound() {

	var options = [
		['Moving on board', movingPiece()],
		['Making a suggestion', makingSuggestion()]
//		['Making an accusation', makingAccusation()]
	];

	if (current_player == game_settings.me) {

		var message = 'What kind of round are you playing?';

	} else {

		var message = 'What kind of round is ' + game_settings.players[current_player] + ' playing?';

	}


	showOptionButtonsDialog('Type of round', message , 500, options);

}


function movingPiece() {

	return function() {

		nextPlayer();

		nextRound();

	}

}

function makingSuggestion() {

	return function() {

		round = [];

		var options = [];

		for (var i = 0; i < cards.length; i++) {
			options[i] = [card_names[i][0], []]
			for (var j = 0; j < cards[i].length; j++) {
				options[i][1].push([card_names[i][1][j], [i,j]]);
			}
		}

		if (current_player == game_settings.me) {

			var message = 'Which cards are you suggesting?';

		} else {

			var message = 'Which cards is ' + game_settings.players[current_player] + ' suggesting?';

		}

		showRadioDialog(message, 800, suggestingCards, options);
	}
}

function suggestingCards(selected) {

	$.merge(round,[current_player, selected]);

	askPlayer(selected, (current_player + 1) % game_settings.players.length);

}

function askPlayer(suggestion, asking_player) {

	if (asking_player != current_player) {

		var options = [
			['Yes', playerShowedCard(suggestion, asking_player, true)],
			['No', playerShowedCard(suggestion, asking_player, false)]
		];

		var questioner = (current_player == game_settings.me) ? 'you' : game_settings.players[current_player];
		showOptionButtonsDialog('Show card', 'Did ' + game_settings.players[asking_player] + ' show ' + questioner + ' a card?', 500, options);

	} else {

		// Asked everybody

		addRound();

		nextPlayer();

	}

}

function playerShowedCard(suggestion, asking_player, answer) {

	return function() {


		if (answer === true) {

			if (current_player == game_settings.me) {

				var options = [];

				for (var i = 0; i < suggestion.length; i++) {
					options.push([card_names[suggestion[i][0]][1][suggestion[i][1]], playerShowedMeCard(asking_player, suggestion[i])]);
				}

				showOptionButtonsDialog('Which card', 'Which card did ' + game_settings.players[asking_player] + ' show you?', 500, options);

			} else {

				round.push(answer);

				addRound();

				nextPlayer();

			}

		} else {

			round.push(answer);

			askPlayer(suggestion, (asking_player + 1) % game_settings.players.length);

		}

	}

}

function playerShowedMeCard(asking_player, card) {

	return function() {

		round.push(card);

		addRound();

		nextPlayer();

	}
}

function nextPlayer() {

	// Next player
	current_player = (current_player + 1) % game_settings.players.length;

	// Update label
	if (current_player == game_settings.me) {
		var label = 'Your round';
	} else {
		var label = game_settings.players[current_player] + "'s round";
	}
	$('#next-button').html(label);

}

function addRound() {

	clearDialog();

	rounds.push(round);

	printRoundToTable(round);

	var questioner = round[0];
	var suggestion = round[1];

	for (var a = 0; a < round.length - 2; a++) {

		var questioned = (questioner + 1 + a) % game_settings.players.length;
		var answer = round[2 + a];

		if (answer === true) {

			// Showed another player one of their cards

			num_positive_answers[questioned] += 1;
			for (var x = 0; x < suggestion.length; x++ ) {

				var i = suggestion[x][0];
				var j = suggestion[x][1];

				if (grid_array[questioned][i][j] === null) {

					grid_array[questioned][i][j] = [num_positive_answers[questioned]];

				} else if (Array.isArray(grid_array[questioned][i][j])) {

					grid_array[questioned][i][j].push(num_positive_answers[questioned]);

				}

			}

		} else if (answer === false) {

			// Didn't show a card

			for (var x = 0; x < suggestion.length; x++ ) {

				var i = suggestion[x][0];
				var j = suggestion[x][1];

				// Check for contradictions (e.g. already true)

				if (grid_array[questioned][i][j] === true) {

					outputToLog(game_settings.players[questioned] + ' seems to be lying about not having ' + card_names[i][1][j]);

				}

				grid_array[questioned][i][j] = false;

			}

		} else {

			// Showed me a specific card

			var i = answer[0];
			var j = answer[1];
			grid_array[questioned][i][j] = true;

		}

	}

	// Apply logic to deduce cards

	applyLogic();

	// Update HTML table

	updateTable();

}

function printRoundToTable(round) {

	var questioner = round[0];
	var suggestion = round[1];

	var row = [game_settings.players[questioner]]

	for (var x = 0; x < suggestion.length; x++ ) {

		var i = suggestion[x][0];
		var j = suggestion[x][1];

		row.push(card_names[i][1][j]);

	}

	for (var i = 0; i < game_settings.players.length; i++) {

		row.push('');

	}

	row[4 + questioner] = '◆';

	for (var a = 0; a < round.length - 2; a++) {

		var questioned = (questioner + 1 + a) % game_settings.players.length;
		var answer = round[2 + a];

		if (answer == true) {

			row[4 + questioned] = 'Y';

		} else {

			row[4 + questioned] = 'N';

		}

	}

	var html = '<tr>';

	for (var i = 0; i < row.length; i++) {

		html += '<td>' + row[i] + '</td>';

	}

	html += '</tr>';

	outputRound(html);

}

function applyLogic() {

	// Apply logical deductions for each player

	var changed_players;
	var changed_cards;

	var loop = true;

	while (loop == true) {

		changed_players = [];

		for (var k = 1; k < game_settings.players.length; k++) {

			var changed = applyPlayerLogic((game_settings.me + k) % game_settings.players.length);

			if (changed == true) {

				changed_players.push(k);

			}

		}

		outputToLog('changed_players\n---------------');
		outputToLog(changed_players);

		changed_cards = [];

		// Apply logical deductions for each card

		for (var i = 0; i < cards.length; i++) {

			for (var j = 0; j < cards[i].length; j++) {

				var changed = applyCardLogic(i,j);

				if (changed == true) {

					changed_cards.push([i,j]);

				}

			}

		}

		outputToLog('changed_cards\n---------------');
		outputToLog(changed_cards);

//		if (changed_players == [] && changed_cards == []) {

			loop = false;
//
//		} else {

//			loop = true;

//		}

	}

}

function applyPlayerLogic(player) {


	// Count number of player's known, unknown and positive answer cards

	var player_col_before = JSON.stringify(grid_array[player]); // hacky!!
	var known_count = 0;
	var unknown_count = 0;
	var positive_answers_count = new Array(num_positive_answers[player]).fill([]);

	for (var i = 0; i < cards.length; i++) {

		for (var j = 0; j < cards[i].length; j++) {

			if (grid_array[player][i][j] === true) {

				// Player definitely has this card

				known_count += 1;

			} else if (grid_array[player][i][j] === false) {

				// Player definitely doesn't have this card

				unknown_count += 1;

			} else if (Array.isArray(grid_array[player][i][j])) {

				for (x = 0; x < grid_array[player][i][j].length; x++) {

					// Player potentially showed this card

					var answer_number = grid_array[player][i][j][x];
					positive_answers_count[answer_number - 1].push([i,j]);

				}

			}

		}

	}

	// We know all the player's cards

	if (known_count == game_settings.hand_sizes[player]) {

		for (var i = 0; i < cards.length; i++) {

			for (var j = 0; j < cards[i].length; j++) {

				if (grid_array[player][i][j] !== true) {

					// They can't have any more cards

					grid_array[player][i][j] = false;

				}

			}

		}

	// We know all the cards the player does not have

	} else if (unknown_count == game_settings.hand_sizes[player] - known_count) {

		for (var i = 0; i < cards.length; i++) {

			for (var j = 0; j < cards[i].length; j++) {

				if (grid_array[player][i][j] !== false) {

					// They must have all remaining cards

					grid_array[player][i][j] = true;

					// which are not the hidden cards

					cards[i][j] = false;

					// and nobody else has them

					for (var k = 0; k < game_settings.players.length; k++) {

						if (k != player) {

							grid_array[k][i][j] = false;

						}

					}

				}

			}

		}

	}

	// Check for a single remaining option from a positive answer round

	for (var x = 0; x < positive_answers_count.length; x++) {

		if (positive_answers_count[x].length == 1) {

			// Player must have this card

			var i = positive_answers_count[x][0][0];
			var j = positive_answers_count[x][0][1];

			grid_array[player][i][j] = true;

			// so it's not hidden

			cards[i][j] = false;

			// and nobody else has it

			for (var k = 0; k < game_settings.players.length; k++) {

				if (k != player) {

					grid_array[k][i][j] = false;

				}

			}

		}

	}

	// Other checks?
	// Check for non-overlapping positive answers (could potentially eliminate other cards)

	var player_col_after = JSON.stringify(grid_array[player]);

	if (player_col_before == player_col_after) {
		return false;
	} else {
		return true;
	}

}

function applyCardLogic(i,j) {

	var card_row = grid_array.map(player => player[i][j]);
	card_row.unshift(cards[i][j]);
	var card_row_before = JSON.stringify(card_row);

	// Count how many players don't have this card

	var not_owned_count = 0;

	for (var k = 0; k < game_settings.players.length; k++) {

		if (grid_array[k][i][j] === false) {

			not_owned_count += 1;

		}

	}

	// The card is in the game and nobody has it

	if (cards[i][j] === null && not_owned_count == game_settings.players.length) {

		// Must be one of the hidden cards

		cards[i][j] = true;

	// The card is in the game, not one of the hidden cards and all but one players don't have it

	} else if (cards[i][j] === false && not_owned_count == game_settings.players.length - 1) {

		// The remaining player must have it

		for (var k = 0; k < game_settings.players.length; k++) {

			if (grid_array[k][i][j] !== false) {

				grid_array[k][i][j] = true;
				break;

			}

		}

	}

	card_row = grid_array.map(player => player[i][j]);
	card_row.unshift(cards[i][j]);
	var card_row_after = JSON.stringify(card_row);

	if (card_row_before == card_row_after) {
		return false;
	} else {
		return true;
	}


}

function makingAccusation() {

	return function() {

		var options = [];

		for (var i = 0; i < cards.length; i++) {
			options[i] = [card_names[i][0], []]
			for (var j = 0; j < cards[i].length; j++) {
				options[i][1].push([card_names[i][1][j], [i,j]]);
			}
		}

		showRadioDialog('Which cards is ' + game_settings.players[current_player] + ' suggesting?', 800, suggestingCards, options);
	}

}

function accusingCards(selected) {

	alert(selected);

	// Update table
//	updateTable();

}




function startGame() {

	// Input players
	inputPlayers();

	if (game_settings.players.length == 0) {
		newGame = true;
		return;
	}

	// Create blank array
	createBlankArray();

	var options = [];

	for (var i = 0; i < game_settings.players.length; i++) {
		options.push([game_settings.players[i], assignPlayer(i)]);
	}

	showOptionButtonsDialog('Choose player', 'Who are you?', 500, options);


}

$(document).ready(function() {

	$('#next-button').click(function() {
		nextFunction();
	});

	$('#toggleInfo').button();
	$('#toggleInfo').click(function() {
		if ($('#toggleInfo')[0].checked == true) {
			$('.right-div').css('display', 'flex');
		} else {
			$('.right-div').css('display', 'none');
		}
	});

    var handle = $( "#custom-slider" );
    $( "#slider" ).slider({
      create: function() {
        handle.text( $( this ).slider( "value" ) );
      },
      slide: function( event, ui ) {
        handle.text( ui.value );
      },
		range: "min",
		value: 4,
		min: 1,
		max: 9
    });

});

