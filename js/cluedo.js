"use strict";

// Declare card names for each category
var card_names = [
	[ 'Rooms', [ 'Ballroom', 'Billiard Room', 'Conservatory', 'Dining Room', 'Hall', 'Kitchen', 'Library', 'Lounge', 'Study' ] ],
	[ 'Weapons', [ 'Candlestick', 'Dagger', 'Lead Pipe', 'Revolver', 'Rope', 'Wrench' ] ],
	[ 'Suspects', [ 'Green', 'Mustard', 'Orchid', 'Peacock', 'Plum', 'Scarlett' ] ]
];

// Initialise status of all cards
var cards = []
for (var i = 0; i < card_names.length; i++) {
	cards[i] = []
	for (var j = 0; j < card_names[i][1].length; j++) {
		cards[i][j] = null;
	}
}

var players = [];
//var players = [ 'Alex', 'Barry', 'Carl', 'Darren' ];

var me;
var grid_array;

var newGame = true;
var current_player;
var num_positive_answers = [];
var rounds = [];
var round;
var hand_size;

function showOptionButtonsDialog(title, message, width, options) {

	var html = '<div id="dialog">' + message + '</div>';
//	$("#dialog-container").append(html);
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
				$(this).dialog('destroy');
				$("#dialog-container").html('');
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


function showCheckboxDialog(title, width, callback, options) {

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
	$('input').checkboxradio();
	$('#dialog').dialog({
		title: title,
		modal: true,
		buttons: [{
			text: 'OK',
			click: function () {
				var selected = [];
				$(':checkbox:checked').each(function() {
					selected.push($(this).data('index'));
				});
				$(this).dialog('destroy');
				$("#dialog-container").html('');
				callback(selected);
			}
		}],
		width: width
	});

	$("#dialog").dialog("open");


}

function inputPlayers() {

	players = [];
	var player;
	var counter = 1;
	var question = 'Please enter name of Player ' + counter;
	while (player != "") {
		var player = prompt(question);
		if (player != null) {
			players.push(player);
			counter += 1;
			question = 'Please enter name of Player ' + counter + '\nEnter blank when finished';
		} else {
			players = []
			return;
		}
	}
	if (counter == 2) {
		return;
	}
	players.pop();

}

function createBlankArray() {

	grid_array = [];
	for (var k = 0; k < players.length; k++) {
		num_positive_answers.push(0);
		grid_array[k] = [];
		for (var i = 0; i < cards.length; i++) {
			grid_array[k][i] = [];
			for (var j = 0; j < cards[i].length; j++) {
				grid_array[k][i][j] = null;
			}
		}
	}

}

function updateTable() {

	// Iterate over players
	var html = '<table id="grid" class="noselect">\n';
	html += '<tr>\n';
	html += '<th class="cards" style="width:15%;">Cards</th>\n';
	for (var i = 0; i < players.length; i++) {
		if (i == me) {
			html += '<th style="width:' + 85 / players.length + '%" class="yellow-text">' + players[i] + '</th>\n';
		} else {
			html += '<th style="width:' + 85 / players.length + '%">' + players[i] + '</th>\n';
		}
	}
	html += '</tr>\n';

	// Iterate over cards
	for (var i = 0; i < cards.length; i++) {
		html += '<tr class="header"><td class="cards">' + card_names[i][0] + '</td>\n';
		for (var k = 0; k < players.length; k++ ){ html += '<td></td>\n'; }
		html += '</tr>\n';
		for (var j = 0; j < cards[i].length; j++) {
			if (cards[i][j] === null) {
				html += '<tr><td class="cards">' + card_names[i][1][j] + '</td>';
			} else if (cards[i][j] === false) {
				html += '<tr><td class="empty-cards"></td>';
			} else if (cards[i][j] === true) {
				html += '<tr><td class="green cards">' + card_names[i][1][j] + '</td>';
			} else {
				html += '<tr><td class="missing-cards">' + card_names[i][1][j] + '</td>';
			}
			for (var k = 0; k < players.length; k++ ) {
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

function selectMissingCards(selected) {

	for (var idx = 0; idx < selected.length; idx++) {
		var i = selected[idx][0];
		var j = selected[idx][1];
		for (var k = 0; k < players.length; k++) {
			grid_array[k][i][j] = false;
		}
		cards[i][j] = "missing";
	}

	// Update table
//	updateTable();

	// Next
	chooseStartingCards();

}

function selectStartingCards(selected) {

	// Calculate size of player's hand

	hand_size = 0;

	// Record the cards I have (which nobody else has)

	for (var idx = 0; idx < selected.length; idx++) {
		var i = selected[idx][0];
		var j = selected[idx][1];
		for (var k = 0; k < players.length; k++) {
			if (k == me) {
				hand_size += 1;
				grid_array[k][i][j] = true;
			} else {
				grid_array[k][i][j] = false;
			}
		}
		cards[i][j] = false;
	}

	// Update my hand (I don't own any other cards)

	applyPlayerLogic(me);

	// Update the HTML table

	updateTable();

	// Next

	var options = [];

	for (var i = 0; i < players.length; i++) {
		options.push([players[i], startingPlayer(i)]);
	}

	showOptionButtonsDialog('Choose player', 'Which player is starting?', 500, options);
	

}

function chooseMissingCards() {

	var options = [];

	for (var i = 0; i < cards.length; i++) {
		options[i] = [card_names[i][0], []]
		for (var j = 0; j < cards[i].length; j++) {
			options[i][1].push([card_names[i][1][j], [i,j]]);
		}
	}

	showCheckboxDialog('Select any cards excluded from this game.', 800, selectMissingCards, options);

}

function chooseStartingCards() {

	var options = [];

	for (var i = 0; i < cards.length; i++) {
		options[i] = [card_names[i][0], []]
		for (var j = 0; j < cards[i].length; j++) {
			if (cards[i][j] !== "missing") {
				options[i][1].push([card_names[i][1][j], [i,j]]);
			}
		}
	}

	showCheckboxDialog('Which cards do you have?', 800, selectStartingCards, options);

}

function assignPlayer(i) {

	return function() {
		me = i;
		$('#dialog').dialog('destroy');

		// Next
		chooseMissingCards();
	};

}

function startingPlayer(i) {

	return function() {
		current_player = i;
		$('#dialog').dialog('destroy');
		$('#dialog-container').html('');

		// Update label
		if (current_player == me) {
			var label = 'Your round';
		} else {
			var label = players[current_player] + "'s round";
		}
		$('#next-button').html(label);

		// Update table
		updateTable();

	};

}

function nextFunction() {

	if (newGame == true) {
		newGame = false;
		startGame();
		return;
	}

	nextRound();

}

function nextRound() {

	$('#dialog').dialog('destroy');
	$('#dialog-container').html('');

	var options = [
		['Moving on board', movingPiece()],
		['Making a suggestion', makingSuggestion()]
//		['Making an accusation', makingAccusation()]
	];

	if (current_player == me) {

		var message = 'What kind of round are you playing?';

	} else {

		var message = 'What kind of round is ' + players[current_player] + ' playing?';

	}


	showOptionButtonsDialog('Type of round', message , 500, options);

}


function movingPiece() {

	return function() {

		$('#dialog').dialog('destroy');
		$('#dialog-container').html('');

		nextPlayer();

		nextRound();

	}

}

function makingSuggestion() {

	return function() {

		$('#dialog').dialog('destroy');
		$('#dialog-container').html('');

		round = [];

		var options = [];

		for (var i = 0; i < cards.length; i++) {
			options[i] = [card_names[i][0], []]
			for (var j = 0; j < cards[i].length; j++) {
				options[i][1].push([card_names[i][1][j], [i,j]]);
			}
		}

		if (current_player == me) {

			var message = 'Which cards are you suggesting?';

		} else {

			var message = 'Which cards is ' + players[current_player] + ' suggesting?';

		}

		showRadioDialog(message, 800, suggestingCards, options);
	}
}

function suggestingCards(selected) {

	$('#dialog').dialog('destroy');
	$('#dialog-container').html('');

	$.merge(round,[current_player, selected]);

	askPlayer(selected, (current_player + 1) % players.length);

}

function askPlayer(suggestion, asking_player) {

	if (asking_player != current_player) {

		var options = [
			['Yes', playerShowedCard(suggestion, asking_player, true)],
			['No', playerShowedCard(suggestion, asking_player, false)]
		];

		var questioner = (current_player == me) ? 'you' : players[current_player];
		showOptionButtonsDialog('Show card', 'Did ' + players[asking_player] + ' show ' + questioner + ' a card?', 500, options);

	} else {

		// Asked everybody

		addRound();

		nextPlayer();

	}

}

function playerShowedCard(suggestion, asking_player, answer) {

	return function() {

		$('#dialog').dialog('destroy');
		$('#dialog-container').html('');

		if (answer === true) {

			if (current_player == me) {

				var options = [];

				for (var i = 0; i < suggestion.length; i++) {
					options.push([card_names[suggestion[i][0]][1][suggestion[i][1]], playerShowedMeCard(asking_player, suggestion[i])]);
				}

				showOptionButtonsDialog('Which card', 'Which card did ' + players[asking_player] + ' show you?', 500, options);

			} else {

				round.push(answer);

				addRound();

				nextPlayer();

			}

		} else {

			round.push(answer);

			askPlayer(suggestion, (asking_player + 1) % players.length);

		}

	}

}

function playerShowedMeCard(asking_player, card) {

	return function() {

		$('#dialog').dialog('destroy');
		$('#dialog-container').html('');

		round.push(card);

		addRound();

		nextPlayer();

	}
}

function nextPlayer() {

	// Next player
	current_player = (current_player + 1) % players.length;

	// Update label
	if (current_player == me) {
		var label = 'Your round';
	} else {
		var label = players[current_player] + "'s round";
	}
	$('#next-button').html(label);

}

function addRound() {

	rounds.push(round);

	var questioner = round[0];
	var suggestion = round[1];

	for (var a = 0; a < round.length - 2; a++) {

		var questioned = (questioner + 1 + a) % players.length;
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

					console.log(players[questioned] + ' seems to be lying about not having ' + card_names[i][1][j]);

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

function applyPlayerLogic(player) {


	// Count number of player's known, unknown and positive answer cards

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

	if (known_count == hand_size) {

		for (var i = 0; i < cards.length; i++) {

			for (var j = 0; j < cards[i].length; j++) {

				if (grid_array[player][i][j] !== true) {

					// They can't have any more cards

					grid_array[player][i][j] = false;

				}

			}

		}

	// We know all the cards the player does not have

	} else if (unknown_count == cards.length - known_count) {

		for (var i = 0; i < cards.length; i++) {

			for (var j = 0; j < cards[i].length; j++) {

				if (grid_array[player][i][j] !== false) {

					// They must have all remaining cards

					grid_array[player][i][j] = true;

					// which are not hidden

					cards[i][j] = false;

					// and nobody else has them

					for (var k = 0; k < players.length; k++) {

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

			for (var k = 0; k < players.length; k++) {

				if (k != player) {

					grid_array[k][i][j] = false;

				}

			}

		}

	}

	// Other checks?
	// Check for non-overlapping positive answers (could potentially eliminate other cards)

}

function applyCardLogic(i,j) {

	// Count how many players don't have this card

	var not_owned_count = 0;

	for (var k = 0; k < players.length; k++) {

		if (grid_array[k][i][j] === false) {

			not_owned_count += 1;

		}

	}

	// The card is in the game and nobody has it

	if (cards[i][j] === null && not_owned_count == players.length) {

		// Must be one of the hidden cards

		cards[i][j] = true;

	// The card is in the game, not one of the hidden cards and all but one players don't have it

	} else if (cards[i][j] === false && not_owned_count == players.length - 1) {

		// The remaining player must have it

		for (var k = 0; k < players.length; k++) {

			if (grid_array[k][i][j] !== false) {

				grid_array[k][i][j] = true;
				break;

			}

		}

	}

}

function applyLogic() {

	// Apply logical deductions for each player

	for (var k = 1; k < players.length; k++) {

		applyPlayerLogic((me + k) % players.length);

	}

	// Apply logical deductions for each card

	for (var i = 0; i < cards.length; i++) {

		for (var j = 0; j < cards[i].length; j++) {

			applyCardLogic(i,j);

		}

	}

}


function makingAccusation() {

	return function() {

		$('#dialog').dialog('destroy');
		$('#dialog-container').html('');

		var options = [];

		for (var i = 0; i < cards.length; i++) {
			options[i] = [card_names[i][0], []]
			for (var j = 0; j < cards[i].length; j++) {
				options[i][1].push([card_names[i][1][j], [i,j]]);
			}
		}

		showRadioDialog('Which cards is ' + players[current_player] + ' suggesting?', 800, suggestingCards, options);
	}

}

function accusingCards(selected) {

	alert(selected);

	// Update table
//	updateTable();

}




function startGame() {

	// Play theme
//	var audio = new Audio('theme.mp3');
//	audio.play();

	// Input players
	inputPlayers();

	if (players.length == 0) {
		newGame = true;
		return;
	}

	// Create blank array
	createBlankArray();

	var options = [];

	for (var i = 0; i < players.length; i++) {
		options.push([players[i], assignPlayer(i)]);
	}

	showOptionButtonsDialog('Choose player', 'Who are you?', 500, options);


}

$(document).ready(function() {

	$('#next-button').button();
	$('#next-button').click(function() {
		nextFunction();
	});

	$('#toggleInfo').button();
	$('#toggleInfo').click(function() {
		if ($('#toggleInfo')[0].checked == true) {
			$('.right-div').css('display', 'block');
		} else {
			$('.right-div').css('display', 'none');
		}
	});

});

