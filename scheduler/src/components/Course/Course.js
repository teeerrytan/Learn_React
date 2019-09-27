import React, { useState } from 'react';
import { Button } from 'rbx';
import { days, terms, timeParts } from './times';
import { db } from '../../App';

const buttonColor = selected => (selected ? 'success' : null);

const getCourseTerm = course => terms[course.id.charAt(0)];

const getCourseNumber = course => course.id.slice(1, 4);

const saveCourse = (course, meets) => {
	db.child('courses')
		.child(course.id)
		.update({ meets })
		.catch(error => alert(error));
};

const hasConflict = (course, selected) =>
	selected.some(
		selection => course !== selection && courseConflict(course, selection)
	);

const courseConflict = (course1, course2) =>
	course1 !== course2 &&
	getCourseTerm(course1) === getCourseTerm(course2) &&
	timeConflict(course1, course2);

const timeConflict = (course1, course2) =>
	daysOverlap(course1.days, course2.days) &&
	hoursOverlap(course1.hours, course2.hours);

const daysOverlap = (days1, days2) =>
	days.some(day => days1.includes(day) && days2.includes(day));

const hoursOverlap = (hours1, hours2) =>
	Math.max(hours1.start, hours2.start) < Math.min(hours1.end, hours2.end);

const moveCourse = course => {
	const meets = prompt(
		'Enter new meeting data, in this format:',
		course.meets
	);
	if (!meets) return;
	const { days } = timeParts(meets);
	if (days) saveCourse(course, meets);
	else moveCourse(course);
};

const Course = ({ course, state, user }) => (
	<Button
		color={buttonColor(state.selected.includes(course))}
		onClick={() => state.toggle(course)}
		onDoubleClick={user ? () => moveCourse(course) : null}
		disabled={hasConflict(course, state.selected)}
	>
		{getCourseTerm(course)} CS {getCourseNumber(course)}: {course.title}
	</Button>
);

export default Course;
