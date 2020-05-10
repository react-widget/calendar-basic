export function isSameDate(d1: Date, d2: Date) {
	return isSameYear(d1, d2) && isSameMonth(d1, d2) && d1.getDate() === d2.getDate();
}

export function isSameMonth(d1: Date, d2: Date) {
	return isSameYear(d1, d2) && d1.getMonth() === d2.getMonth();
}

export function isSameYear(d1: Date, d2: Date) {
	return d1.getFullYear() === d2.getFullYear();
}

export function cloneDate(date: Date) {
	return new Date(date.getTime());
}
