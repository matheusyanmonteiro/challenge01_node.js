const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
 const { username } = request.headers;

 const user = users.find((user) => user.username === username);

 if (!user) {
   return response.status(400).json({error: "User not found!"});
 }

 request.user = user;

 return next();
}

app.post('/users', (request, response) => {
  const {name, username } = request.body;
  //console.log(name, username);

  const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists) {
    return response.status(400).json({error: "User already exist"});
  }
  
  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  };

  users.push(user);


  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todosOperation = { 
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date(),
  };

  user.todos.push(todosOperation);

  return response.status(201).json(todosOperation);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo)
    return response.status(404).json({ error: "Todo not found." })

  todo.title = title;
  todo.deadline = deadline;

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
  return response.status(404).json({ error: "Todo not found." });
  }
    

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const deleteTodo = user.todos.find((todo) => todo.id === id);

  if(!deleteTodo){
    return response.status(404).json({ error: "Todo not found." });
  }
    

  user.todos.splice(deleteTodo.id, 1);
  return response.status(204).json(user.todos);
});

module.exports = app;