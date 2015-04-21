function scrollTo(element, to, duration) {
	var start = element.scrollTop,
		change = to - start,
		currentTime = 0,
		increment = 20;
	var animateScroll = function(){
		currentTime += increment;
		element.scrollTop = easeInOutQuad(currentTime, start, change, duration);
		if(currentTime < duration) {
			setTimeout(animateScroll, increment);
		}
	};
	animateScroll();
}

function easeInOutQuad(t, b, c, d) {
//t = current time
//b = start value
//c = change in value
//d = duration
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
}

module.exports = scrollTo;