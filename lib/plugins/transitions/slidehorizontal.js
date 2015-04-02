(function ( global, factory ) {

	'use strict';

	// Common JS (i.e. browserify) environment
	if ( typeof module !== 'undefined' && module.exports && typeof require === 'function' ) {
		factory( require( 'ractive' ) );
	}

	// AMD?
	else if ( typeof define === 'function' && define.amd ) {
		define([ 'ractive' ], factory );
	}

	// browser global
	else if ( global.Ractive ) {
		factory( global.Ractive );
	}

	else {
		throw new Error( 'Could not find Ractive! It must be loaded before the ractive-transitions-slide plugin' );
	}

}( typeof window !== 'undefined' ? window : this, function ( Ractive ) {

	'use strict';

	var slide, props, collapsed, defaults;

	defaults = {
		duration: 300,
		easing: 'easeInOut'
	};

	props = [
		'width',
		'borderLeftWidth',
		'borderRightWidth',
		'paddingLeft',
		'paddingRight',
		'marginLeft',
		'marginRight'
	];

	collapsed = {
		width: 0,
		borderLeftWidth: 0,
		borderRightWidth: 0,
		paddingLeft: 0,
		paddingRight: 0,
		marginLeft: 0,
		marginRight: 0
	};

	slide = function ( t, params ) {
		var targetStyle;

		params = t.processParams( params, defaults );

		if ( t.isIntro ) {
			t.setStyle('height', t.getStyle('height'));
			targetStyle = t.getStyle( props );
			t.setStyle( collapsed );
		} else {
			// make style explicit, so we're not transitioning to 'auto'
			t.setStyle('height', t.getStyle('height'));
			t.setStyle( t.getStyle( props ) );
			targetStyle = collapsed;
		}

		t.setStyle({
			overflow: 'hidden'
		});

		t.animateStyle( targetStyle, params ).then( t.complete );
	};

	Ractive.transitions.slidehorizontal = slide;

}));
