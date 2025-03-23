import 'package:flutter/material.dart';
import 'authentication_service.dart';
import 'register_page.dart';
import 'search_page.dart';
import 'package:firebase_auth/firebase_auth.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final AuthenticationService authService = AuthenticationService();

  void login() async {
    String email = emailController.text.trim();
    String password = passwordController.text.trim();

    UserCredential? user = await authService.login(email, password);
    if (user != null) {
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => SearchPage()));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Login failed! Incorrect Email and/or Password")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset(
            "assets/images/background.webp",
            fit: BoxFit.cover,
          ),
          Center(
            child: Container(
              padding: const EdgeInsets.all(16.0),
              margin: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.8),
                borderRadius: BorderRadius.circular(15),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text("Login", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  TextField(controller: emailController, decoration: const InputDecoration(labelText: "Email")),
                  TextField(controller: passwordController, decoration: const InputDecoration(labelText: "Password"), obscureText: true),
                  const SizedBox(height: 20),
                  ElevatedButton(onPressed: login, child: const Text("Login")),
                  TextButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => RegisterPage()));
                    },
                    child: const Text("Don't have an account? Register"),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
