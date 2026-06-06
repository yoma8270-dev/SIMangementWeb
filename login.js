import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* Firebase Configuration */

const firebaseConfig = {
    apiKey: "AIzaSyA6M-wCOH81zQsQq_cCz6qFlDiNfNw3hUs",
    authDomain: "inve-sto-manegment.firebaseapp.com",
    projectId: "inve-sto-manegment",
    storageBucket: "inve-sto-manegment.firebasestorage.app",
    messagingSenderId: "275212080566",
    appId: "1:275212080566:web:d548683dbce730dc805d17"
};

/* Initialize Firebase */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* Login */

const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {

    loginBtn.addEventListener("click", async () => {

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value.trim();

        if (!email || !password) {
            alert("Please fill all fields");
            return;
        }

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            alert("Login Successful");

            window.location.href = "index.html";

        } catch (error) {

            alert(error.message);

        }

    });

}

/* Register */

const registerBtn =
    document.getElementById("registerBtn");

if (registerBtn) {

    registerBtn.addEventListener("click", async () => {

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value.trim();

        if (!email || !password) {
            alert("Please fill all fields");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            await setDoc(
                doc(db, "users", userCredential.user.uid),
                {
                    email: email,
                    createdAt: serverTimestamp()
                }
            );

            alert("Registration Successful");

        } catch (error) {

            alert(error.message);

        }

    });

}

/* Forgot Password */

const forgotBtn =
    document.getElementById("forgotBtn");

if (forgotBtn) {

    forgotBtn.addEventListener("click", async () => {

        const email =
            document.getElementById("email").value.trim();

        if (!email) {

            alert("Enter your email first");

            return;
        }

        try {

            await sendPasswordResetEmail(
                auth,
                email
            );

            alert(
                "Password reset email sent successfully"
            );

        } catch (error) {

            alert(error.message);

        }

    });

}

/* Auto Login Check */

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log(
            "Logged In:",
            user.email
        );

    } else {

        console.log("Not Logged In");

    }

});

/* Logout Function */

window.logoutUser = async function () {

    try {

        await signOut(auth);

        alert("Logged Out");

        window.location.href = "login.html";

    } catch (error) {

        alert(error.message);

    }

};