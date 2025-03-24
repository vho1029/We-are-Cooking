import 'package:flutter/material.dart';
import 'authentication_service.dart';
import 'login_page.dart';
import 'spoonacular_service.dart';

class SearchPage extends StatefulWidget {
  SearchPage({super.key});

  @override
  _SearchPageState createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  final AuthenticationService authService = AuthenticationService();
  final SpoonacularService _apiService = SpoonacularService();
  final ScrollController _scrollController = ScrollController();

  List recipes = [];
  int offset = 0;
  final int limit = 20;
  bool isLoading = false;
  bool hasMore = true;
  bool isDisposed = false;
  String searchQuery = "";

  @override
  void initState() {
    super.initState();
    fetchRecipes();
    _scrollController.addListener(_scrollListener);
  }

  @override
  void dispose() {
    isDisposed = true;
    _scrollController.removeListener(_scrollListener);
    _scrollController.dispose();
    super.dispose();
  }

  void logout(BuildContext context) async {
    await authService.logout();
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => LoginPage()),
      );
    }
  }

  Future<void> fetchRecipes() async {
    if (isLoading || !hasMore || isDisposed) return;

    setState(() => isLoading = true);

    try {
      final response =
          await _apiService.searchRecipesPaginated(searchQuery, offset, limit);
      if (response != null && response['results'] != null) {
        if (!isDisposed) {
          setState(() {
            recipes.addAll(response['results']);
            offset += limit;
            hasMore = response['results'].length == limit;
          });
        }
      }
    } catch (e) {
      print("Error fetching recipes: $e");
    }

    if (!isDisposed) {
      setState(() => isLoading = false);
    }
  }

  void _scrollListener() {
    if (!isLoading && hasMore && _scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.9) {
      Future.delayed(const Duration(milliseconds: 500), fetchRecipes);
    }
  }

  void onSearch(String query) {
    setState((){
      searchQuery = query;
      recipes.clear();
      offset = 0;
      hasMore = true;
      fetchRecipes();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.black87,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: () => logout(context),
          ),
        ],
        title: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8.0),
          child: SizedBox(
            height: 40, 
            child: TextField(
              onChanged: onSearch,
              decoration: InputDecoration(
                hintText: "Search recipes...",
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.6)),
                prefixIcon: Icon(Icons.search, color: Colors.white),
                filled: true,
                fillColor: Colors.white.withOpacity(0.2),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
              ),
              style: TextStyle(color: Colors.white),
            ),
          ),
        ),
      ),
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
                color: Colors.black.withOpacity(0.8),
                borderRadius: BorderRadius.circular(15),
              ),
              child: recipes.isEmpty && !isLoading
                  ? const Center(child: Text("No recipes found.", style: TextStyle(color: Colors.white)))
                  : GridView.builder(
                      controller: _scrollController,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 10,
                        childAspectRatio: 0.8,
                      ),
                      itemCount: recipes.length + (hasMore ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index == recipes.length) {
                          return const Center(
                            child: Padding(
                              padding: EdgeInsets.all(8.0),
                              child: CircularProgressIndicator(),
                            ),
                          );
                        }
                        return Container(
                          decoration: BoxDecoration(
                            color: const Color.fromARGB(255, 66, 61, 77),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Expanded(
                                child: ClipRRect(
                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
                                  child: Image.network(
                                    recipes[index]['image'] ?? '',
                                    width: double.infinity,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) {
                                      return Image.asset(
                                        'assets/images/placeholder.jpg',
                                        width: double.infinity,
                                        fit: BoxFit.cover,
                                      );
                                    },
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: Text(
                                  recipes[index]['title'],
                                  style: const TextStyle(color: Colors.white),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
          ),
        ],
      ),
    );
  }
}
