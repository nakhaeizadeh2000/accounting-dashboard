Feature: Create User

Scenario Outline: Create a new user
Given I have the following user data
| name | email | password |
| <name> | <email> | <password> |
When I create a new user
Then the response status should be 200

Examples:
| name | email | password |
| John | john.doe@example.com | secret |
| Jane | jane.smith@example.com | password |
