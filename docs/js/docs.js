$(function(){
	var $t, t, v, animate, clicked,

	cleanupCode = function(code){
		return code.replace(/[<>\"\'\t\n]/g, function(m) { return {
			'<' : '&lt;',
			'>' : '&gt;',
			"'" : '&#39;',
			'"' : '&quot;',
			'\t': '  ',
			'\n': '<br/>' // needed for IE
		}[m]});
	};

	$("a.external").each(function(){this.target = '_new';});

	// get javascript source
	if ($("#js").length) {
		$("#javascript pre").addClass('mod').html( cleanupCode( $("#js").html() ) );
	}
	if ($("#css").length) {
		$("pre.lang-css").addClass('mod').html( cleanupCode( $("#css").html() ) );
	}
	if ($("#demo").length) {
		$("#html pre").addClass('mod').html( cleanupCode( $("#demo").html() ) );
	}

	// apply to already pre-formatted blocks to add <br> for IE
	$('pre:not(.mod)').each(function(){
		$t = $(this);
		$t.html( cleanupCode( $t.html() ) );
	});

	if (typeof prettyPrint !== 'undefined') { prettyPrint(); }

	// hide child rows
	$('#root .tablesorter-childRow').hide();
	// toggle child row content, not hiding the row since we are using rowspan
	$('#root .toggle').click(function(){
		$(this).closest('tr').nextUntil('tr:not(.tablesorter-childRow)').toggle();
		return false;
	});

	animating = false;
	clicked = false;
	$('.collapsible').hide();

	$('a.permalink').click(function(e){
		var $el = $(this);
		setTimeout(function(){
			if (!animating && !clicked) {
				animating = true;
				$el.closest('tr').find('.collapsible').slideToggle();
				setTimeout(function(){ animating = false; }, 200);
			}
		}, 200);
		return false;
	});
	$('.permalink').dblclick(function(){
		clicked = true;
		window.location.hash = '#' + $(this).closest('tr')[0].id;
		showProperty();
		setTimeout(function(){ clicked = false; }, 500);
		return false;
	});

	$('.toggleAll, .showAll, .hideAll').click(function(){
		t = $.trim($(this).text());
		$(this).parent().next('table').find('.collapsible')[t]();
		return false;
	});

	// update version number
	$t = $('.current-version');
	if ($t.length) {
		$t.html($.tablesorter.version);
	}

	// add high visibility tags for newest versions (just grab the major revision number 2.10.0 -> 10
	t = $.tablesorter.version.replace(/(v|version|\+)/g, '').split('.');
	v = [ parseInt(t[0], 10) || 1, parseInt(t[1], 10) || 0 ];
	$('.version').each(function(){
		var i;
		$t = $(this);
		i = $t.text().replace(/(v|version|\+)/g, '').split('.');
		t = [ parseInt(i[0], 10) || 1, parseInt(i[1], 10) || 0 ];
		if (t[0] === v[0] && t[1] >= v[1] - 1 ) {
			$t.prepend('<span class="label ' + ( t[0] === v[0] && t[1] < v[1] ? ' label-default' : ' label-success' ) +
				'">'+ ($t.hasClass('updated') ? 'Updated' : 'New') + '</span> ');
		}
	});

	$t = $('.accordion');
	if ($t.length) {
		var hashId = 0;
		if (window.location.hash) {
			$t.children('h3').each(function(i){
				var txt = $(this).find('a').text().toLowerCase().replace(/[()\"]/g,'').replace(/[\s+\/]/g,'_');
				this.id = txt;
				if (txt === window.location.hash.slice(1)) {
					hashId = i;
				}
			});
		}
		$t.accordion({
			active: hashId,
			animate: false,
			heightStyle: 'content',
			collapsible: true,
			create: function( event, ui ) {
				$t.children('h3').each(function(i){
					this.id = $(this).find('a').text().toLowerCase().replace(/[-()\"]/g,'').replace(/[\s+\/]/g,'_');
					$(this).before('<a class="accordion-link link" data-index="' + i + '" href="#' + this.id + '"></a>');
				});
				$t.find('.accordion-link').click(function(){
					$t.accordion( "option", "active", $(this).data('index') );
				});
			}
		});
	}

});

function showProperty(){
	var prop, $t, h = window.location.hash;
	if (h) {
		prop = $(h);
		if (prop.length && !/a|table/i.test(prop[0].tagName)) {
			prop.find('.collapsible').show();
			if (h === '#csschildrow') {
				$('#root .tablesorter-childRow').show();
			}
			// move below sticky header; added delay as there could be some lag
			setTimeout(function(){
				$t = prop.closest('table');
				h = $t[0].config.widgetOptions.$sticky.height() || 27;
				if ($t.hasClass('options') || $t.hasClass('api')) {
					$('body').scrollTop( prop.position().top - h );
				}
			}, 200);
		}
	}
}

$(window).load(function(){
	if ($('#root').length) {
		$(window).bind('hashchange', function(){
			showProperty();
		});
		showProperty();
	}
});

// append hidden parsed value to cell
// used by feet-inch-fraction & metric parser demos
var addParsedValues = function($t, cols, format){
	var i, j, r,
		$r = $t.find('tbody tr'),
		c = $t[0].config.cache[0].normalized,
		l = c.length - 1;
	$r.each(function(i){
		r = this;
		$.each(cols, function(v,j){
			r.cells[j].innerHTML += ' <span class="val hidden removeme">(<span class="results">' + (format ? format(c[i][j]) : c[i][j]) + '</span>)</span>';
		});
	});

	$('.toggleparsedvalue').on('click', function(){
		$('.val').toggleClass('hidden');
		return false;
	});

};
