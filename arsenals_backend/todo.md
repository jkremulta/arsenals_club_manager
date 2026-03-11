Attendance Router
GET /

Returns 404 when no active training exists — verifies the error guard works
Returns the attendance list when an active training exists — confirms population works
Returns 401/403 without a valid token — since userExtractor is applied, auth must be enforced

POST /

Returns 400 when id is missing from the body — tests the guard clause
Returns 400 when no active training exists
Successfully adds a player and returns 201 — the happy path
Returns 400 when the player is already in attendance — tests the duplicate guard

DELETE /:id

Returns 404 when no active training exists
Returns 404 when the player is not in attendance
Successfully removes a player and returns 204 — happy path
Returns 401/403 without a valid token


Login Router
POST /

Returns 401 for a non-existent username — user not found
Returns 401 for a wrong password — bcrypt mismatch
Returns 200 with a token on valid credentials — happy path
The returned token should be a valid JWT — decode it and verify the payload contains username and id


Players Router
GET /

Returns all players — happy path
Returns 401/403 without a token

POST /

Creates a player and returns 201 with the saved data — happy path
Returns 401/403 without a token
Consider testing missing required fields if your model enforces them

DELETE /:id

Deletes a player and returns 204 — happy path
Passing a non-existent id — depending on MongoDB behavior, findByIdAndDelete won't throw, so you should confirm a 204 is still returned (or decide if you want a 404 instead — this is a design gap worth noting)
Returns 401/403 without a token


Training Router
GET /

Returns 404 when no active training exists
Returns the active training with populated fields — happy path
Returns 401/403 without a token

POST /

Returns 400 when an active training already exists — prevents duplicates
Returns 400 when startTime is missing
Creates a training and returns 201 — happy path

DELETE /

Returns 404 when no active training exists
Deletes the training, resets games_played to 0 for attendees, returns 200 — this is the most complex case and the most important to test
Returns 401/403 without a token

POST /initializeGame

Returns 400 when skillGroup is missing
Returns players for a given skill group — happy path (you'll likely need to mock trainingService)

POST /startGame

Returns the result of trainingService.startGame() — since there's no guard clause here, focus on the happy path and consider whether missing edge cases are a bug


Users Router
POST /

Returns 400 when password is shorter than 3 characters — tests the explicit guard
Successfully creates a user and returns 201 — happy path
Does not return the passwordHash in the response — security check
Duplicate username should fail — this is likely enforced at the model level, worth testing


Cross-cutting concerns worth testing

userExtractor middleware: all protected routes should return 401 when no token is provided, and 401/403 when the token is invalid or expired. Rather than repeating this in every test, consider a shared test helper.
Error propagation: none of your routes have try/catch blocks. This means unhandled promise rejections (e.g., a bad DB connection) will crash or hang. You might want to test or at least note this as a reliability gap.