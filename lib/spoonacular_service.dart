import 'dart:convert';
import 'package:http/http.dart' as http;

class SpoonacularService {
  final String apiKey = '47479824a9a442f486fb2cd1059d51c0'; // Replace with your key
  final String baseUrl = 'https://api.spoonacular.com';

  Future<Map<String, dynamic>?> searchRecipes(String query) async {
    final url = Uri.parse('$baseUrl/recipes/complexSearch?query=$query&apiKey=$apiKey');

    try {
      final response = await http.get(url);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        print('Failed to load recipes: ${response.statusCode}');
        return null;
      }
    } catch (e) {
      print('Error: $e');
      return null;
    }
  }

  Future<Map<String, dynamic>?> searchRecipesPaginated(String query, int offset, int limit) async {
    try {
      final url = Uri.parse('$baseUrl/recipes/complexSearch?query=$query&offset=$offset&number=$limit&apiKey=$apiKey');
      final response = await http.get(url);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        print('Failed to load recipes: ${response.statusCode}');
      }
    } catch (e) {
      print('Error: $e');
    }
    return null;
  }
}
