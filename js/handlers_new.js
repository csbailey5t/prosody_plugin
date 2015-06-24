$(document).ready(function(){

    // Set initial stress to an empty string for all real spans
    var realSpans = $('span[real]');
    realSpans.attr('data-stress', '');

    var poemHeight = $('#poem').height();
    var rhymeHeight = poemHeight + 20;
    $('#rhymebar').height(rhymeHeight + 'px');
    $('#rhyme').height(rhymeHeight + 'px');

    var titleHeight = $('#poemtitle').height();
    var spacerHeight = titleHeight + 44;
    $('#rhymespacer').height(spacerHeight + 'px');

    // Click handlers for toggles
    $('#togglestress').click(function(){
        togglestress(this);
    });
    $('#togglefeet').click(function(){
        togglefeet(this);
    });
    $('#togglecaesura').click(function(){
        togglecaesura(this);
    });

    // initialize watch events to toggle the rhymebar
    $('#rhymebar').on('click', function(){
        $('#rhyme').toggle();
    });
    $('#rhymeflag').on('click', function(){
        $('#rhyme').toggle();
    });

    // watch for rhymeform submission and set scheme and answer
    $('#rhymeform').on('submit', function(event){
        var scheme = $('#rhymeform').attr('name').replace(/\s/g, "");
        var ans = "";

        var total = $('#rhymeform :input[type=text]');
        $.each( total, function(index, object){
            ans += object.value;
        });
        checkrhyme(scheme, ans);
        event.preventDefault();
    });
});

function checkrhyme (scheme, answer) {
    if (scheme === answer) {
        $('#rhymecheck').addClass('right');
        $('#rhymecheck').removeClass('wrong');
        $('#rhymecheck').val('\u2713');
    } else {
        $('#rhymecheck').addClass('wrong');
        $('#rhymecheck').removeClass('right');
        $('#rhymecheck').val('X');
    }
}

function checkmeter ( lineNumber, lineGroupIndex ) {
    var fullAnswer = $('#prosody-real-' + lineNumber + " span[answer]").attr('answer');
    var footType = fullAnswer.split('(')[0];
    var numberFeet = fullAnswer.match(/\d+/g)[lineGroupIndex-1];
    var correctAnswer = footType + numberFeet;
    console.log("real answer is: " + correctAnswer);

    $('#check-answer').one("click", function () {
        var footScheme = $('#foot-select').val();
        var numberScheme = $('#number-select').val();
        var fullScheme = footScheme + numberScheme;
        console.log("fullscheme: " + fullScheme);

        if ( correctAnswer === fullScheme ) {
            $('#checkmeter' + lineNumber + " img").attr("src", "wp-content/plugins/prosody_plugin/images/correct.png");
        } else {
            $('#checkmeter' + lineNumber + " img").attr("src", "wp-content/plugins/prosody_plugin/images/incorrect.png");
        }

        $('#meter-select').dialog( "close" );
    });

    $('#meter-select').dialog( "open" );

}

function switchstress (shadowSyllable) {
    var realSyllable = $('#prosody-real-' + shadowSyllable.id.substring(15));
    var stress = realSyllable.attr('data-stress');

    var syllableWidth = realSyllable.width();
    shadowSyllable.style.width = syllableWidth + 'px';

    if( stress === '-' || stress === '' ) {
        $('#' + shadowSyllable.id).fadeIn();
        $('#' + shadowSyllable.id).empty();
        $('#' + shadowSyllable.id).append(marker(realSyllable));
        realSyllable.attr('data-stress', '+');
    } else if ( stress === "+") {
        $('#' + shadowSyllable.id).fadeOut();
        setTimeout(function () {
            $('#' + shadowSyllable.id).empty();
            $('#' + shadowSyllable.id).append(slackmarker(realSyllable));
            realSyllable.attr('data-stress', '\u222a');
        }, 150);
        $('#' + shadowSyllable.id).fadeIn();
    } else {
        $('#' + shadowSyllable.id).fadeOut();
        setTimeout(function () {
            $('#' + shadowSyllable.id).empty();
            $('#' + shadowSyllable.id).append(placeholder(realSyllable));
            realSyllable.attr('data-stress', '-');
        }, 150);
        $('#' + shadowSyllable.id).fadeIn();
    }

    $('#checkstress' + shadowSyllable.id.substring(15,16) + ' img').attr('src', 'wp-content/plugins/prosody_plugin/images/stress-default.png');
}

function checkstress ( lineNumber ) {
    // Scheme is the user submitted stress marks
    var scheme = '';
    $('#prosody-real-' + lineNumber + ' span[real]').each(
        function () {
            var syllableStress = this.dataset.stress;
            scheme += syllableStress;
        }
    );

    // Make sure the answer is complete
    var answerLength = $('#prosody-real-' + lineNumber + ' span[real]').length;
    var schemeLength = scheme.length;

    if ( answerLength !== schemeLength ) {
        alert("An answer must be complete to be submitted. Please fill in a symbol over each syllable in this line.");
        return;
    }

    var answer = $('#prosody-real-' + lineNumber).data('real').split('|');
    var realAnswer = answer[0].replace(/-/g, '\u222a');
    var expectedAnswer = answer[1].replace(/-/g, '\u222a');

    if ( scheme === realAnswer ) {
        $("#checkstress" + lineNumber + " img").attr("src", "wp-content/plugins/prosody_plugin/images/correct.png");
    } else if ( scheme === expectedAnswer) {
        $("#checkstress" + lineNumber + " img").attr("src", "wp-content/plugins/prosody_plugin/images/expected.png");
    } else {
        $("#checkstress" + lineNumber + " img").attr("src", "wp-content/plugins/prosody_plugin/images/incorrect.png");
    }
}

function switchfoot ( syllableId ) {
    var syllableSpan = $('#' + syllableId + ' span');
    if ( syllableSpan.length === 0 ) {
        $('#' + syllableId).append('<span class="prosody-footmarker">|</span>');
        syllableSpan = $('#' + syllableId + ' span');
    } else {
        $('#' + syllableId + ' .prosody-footmarker').remove();
    }

    $("#checkfeet" + syllableId.substring(13,14) + " img").attr("src", "wp-content/plugins/prosody_plugin/images/feet-default.png");
}

function checkfeet ( lineNumber ) {
    var scheme = $('#prosody-real-' + lineNumber + ' span[real]').text();
    var answer = $('#prosody-real-' + lineNumber).data('feet');
    if ( scheme.endsWith('|')) {
        scheme = scheme.slice(0, -1);
    }
    scheme = scheme.replace(/\s+/g, '');
    answer = answer.replace(/\s+/g, '');

    if ( scheme === answer) {
        $("#checkfeet" + lineNumber + " img").attr("src", "wp-content/plugins/prosody_plugin/images/correct.png");
    } else {
        $("#checkfeet" + lineNumber + " img").attr("src", "wp-content/plugins/prosody_plugin/images/incorrect.png");
    }
}

function togglestress ( node ) {
    $('.prosody-marker').each(function(i, el){
        if(node.checked){
            $(el).show();
        } else {
            $(el).hide();
        }
    });

}

function togglefeet (node) {
    $('.prosody-footmarker').each(function(i, el){
        if(node.checked){
            $(el).show();
        } else {
            $(el).hide();
        }
    });
}

function togglecaesura (node) {
    $('.caesura').each(function(i, el){
        if(node.checked){
            $(el).show();
        } else {
            $(el).hide();
        }
    });
}

function addMarker ( real, symbol ) {
    var prosodyMarker = document.createElement("span");
    prosodyMarker.className = "prosody-marker";

    var syllableText = real.text();

    var textLength = syllableText.length;
    var textMiddle = Math.floor(textLength/2);

    var textMod = textLength % 2;
    var spacer = '';

    for (var i = textMiddle - 1; i >= 0; i--) {
        spacer = spacer + '\u00A0';
    }

    if ( textMod === 0) {
        var lspacer = '';
        for (var j = textMiddle - 2; j >= 0; j--) {
            lspacer = lspacer + '\u00A0';
        }
        prosodyMarker.textContent = lspacer + symbol + lspacer + "\u00A0";
    } else {
        prosodyMarker.textContent = spacer + symbol + spacer;
    }
    return prosodyMarker;
}

function marker ( real ) {
    return addMarker( real, "/" ) ;
}

function slackmarker ( real ) {
    return addMarker ( real, "\u222A" );
}

function placeholder ( real ) {
    return addMarker( real, " " );
}
