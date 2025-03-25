import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_app_check/firebase_app_check.dart';


class AuthenticationService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Future<UserCredential?> signUp(String email, String password, String name) async {
    try {
      UserCredential userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      await _firestore.collection("users").doc(userCredential.user!.uid).set({
        "name": name,
        "email": email,
        "favorites": [],
      });

      return userCredential;
    } catch (e) {
      //print("Error in signUp: $e");
      return null;
    }
  }


  Future<UserCredential?> login(String email, String password) async {
    try {
      UserCredential userCredential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      return userCredential;
    } catch (e) {
      //print("Login Error: $e");
      return null;
    }
  }

  Future<void> logout() async {
    await _auth.signOut();
  }
}
