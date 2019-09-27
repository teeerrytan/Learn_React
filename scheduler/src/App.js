import React, { useState, useEffect } from 'react';
import 'rbx/index.css';
import { Button, Container, Message, Title } from 'rbx';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import { StyledFirebaseAuth } from 'react-firebaseui';
import CourseList from './components/CourseList.js';
import { timeParts } from './components/Course/times';

// FIREBASE
const firebaseConfig = {
	apiKey: 'AIzaSyBs7iOmNKbwlwJKrHm5E_GGhIrp6-B90ss',
	authDomain: 'learn-react-c8ebb.firebaseapp.com',
	databaseURL: 'https://learn-react-c8ebb.firebaseio.com',
	projectId: 'learn-react-c8ebb',
	storageBucket: 'learn-react-c8ebb.appspot.com',
	messagingSenderId: '461691508633',
	appId: '1:461691508633:web:cd80a8cffdda9462246508',
	measurementId: 'G-4ZXYC74NWC'
};

firebase.initializeApp(firebaseConfig);
export const db = firebase.database().ref();

// AUTH UI
const uiConfig = {
	signInFlow: 'popup',
	signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
	callbacks: {
		signInSuccessWithAuthResult: () => false
	}
};

const Welcome = ({ user }) => (
	<Message color="info">
		<Message.Header>
			Welcome, {user.displayName}
			<Button primary onClick={() => firebase.auth().signOut()}>
				Log out
			</Button>
		</Message.Header>
	</Message>
);

const SignIn = () => (
	<StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
);

const Banner = ({ user, title }) => (
	<React.Fragment>
		{user ? <Welcome user={user} /> : <SignIn />}
		<Title>{title || '[loading...]'}</Title>
	</React.Fragment>
);

const addCourseTimes = course => ({
	...course,
	...timeParts(course.meets)
});

const addScheduleTimes = schedule => ({
	title: schedule.title,
	courses: Object.values(schedule.courses).map(addCourseTimes)
});

const App = () => {
	const [schedule, setSchedule] = useState({ title: '', courses: [] });
	const [user, setUser] = useState(null);

	useEffect(() => {
		const handleData = snap => {
			if (snap.val()) setSchedule(addScheduleTimes(snap.val()));
		};
		db.on('value', handleData, error => alert(error));
		return () => {
			db.off('value', handleData);
		};
	}, []);

	useEffect(() => {
		firebase.auth().onAuthStateChanged(setUser);
	}, []);

	return (
		<Container>
			<Banner title={schedule.title} user={user} />
			<CourseList courses={schedule.courses} user={user} />
		</Container>
	);
};

export default App;
