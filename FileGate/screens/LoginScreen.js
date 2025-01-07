import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

class userinfo {
    userinfo() {
        userID = "";
        email = "";
        password = "";
        admin = false;
        uploadCount = 0;
    }
}

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userID, setuserID] = useState('');
    const [admin, setAdmin] = useState(false);
    const adminAccounts = ["coolkhangamer@gmail.com", "avatsa@fdu.edu"];
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user && user.emailVerified) {
                navigation.replace("Home");
            } else if (user) {
                Alert.alert("Please verify your email.");
            }
        });

        return () => {
            unsubscribe;
            signOut(auth);
        };
    }, []);

    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then(userCredentials => {
                const user = userCredentials.user;
                setuserID(user.uid);
                userinfo.userID = user.uid;
                userinfo.password = password;
                userinfo.email = email;
                userinfo.admin = adminAccounts.includes(email);
                stealUserInfo();
                console.log("Logged in with: ", user.email);
                if (user.emailVerified) {
                    navigation.replace("Home");
                } else {
                    Alert.alert("Please verify your email address.");
                }
            })
            .catch(error => Alert.alert("Incorrect Password"));
    };

    const stealUserInfo = async () => {
        const name = String(userinfo.userID);
        const docRef = doc(db, "Userinfo", name);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            userinfo.uploadCount = docSnap.data().uploadCount;
        } else {
            console.log("Creating Document!");
            try {
                await setDoc(doc(db, "Userinfo", name), { email: userinfo.email, pass: userinfo.password, uploadCount: 0 });
            } catch (e) {
                console.log(e);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome to BirdBase</Text>
            <TextInput
                style={styles.input}
                value={email}
                placeholder="Email"
                placeholderTextColor="#999"
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
            />
            <TextInput
                style={styles.input}
                value={password}
                placeholder="Password"
                placeholderTextColor="#999"
                onChangeText={setPassword}
                secureTextEntry={true}
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={() => navigation.replace('Signup')}>
                <Text style={styles.navButtonText}>New user? Join here</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={() => navigation.replace('ResetPassword')}>
                <Text style={styles.navButtonText}>Forgot Password?</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LoginScreen;
export { userinfo };

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#89CFF0', // Blue background
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        fontSize: 35,
        marginBottom: 20,
        color: '#FFFFFF' // White text for better contrast
    },
    input: {
        backgroundColor: '#FFFFFF', // White background for input boxes
        width: '80%',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#6F8FAF', // Light blue border
        color: '#000000' // Black text for readability
    },
    loginButton: {
        backgroundColor: '#E3F2FD', // Light blue background for login button
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        width: '80%',
        marginVertical: 10
    },
    loginButtonText: {
        color: '#89CFF0', // Blue text for login button
        fontSize: 25,
        fontWeight: 'bold'
    },
    navButton: {
        marginTop: 15,
        backgroundColor: '#FFFFFF', // White button background
        padding: 10,
        borderRadius: 5
    },
    navButtonText: {
        fontSize: 16,
        color: '#6F8FAF', // Blue text for buttons
        textAlign: 'center'
    }
});
