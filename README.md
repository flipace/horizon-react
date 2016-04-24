[![npm version](https://badge.fury.io/js/horizon-react.svg)](https://badge.fury.io/js/horizon-react)
[![GitHub issues](https://img.shields.io/github/issues/flipace/horizon-react.svg)](https://github.com/flipace/horizon-react/issues)
# horizon-react
React bindings for [rethinkdb/horizon](https://github.com/rethinkdb/horizon).

### Installation
```
npm i -S horizon-react
```

### Usage
Currently, horizon-react exports two enhancers.
Similarly to react-redux, you'll have to first wrap a root component with a
```Connector``` which will initialize the horizon instance and then subscribe to
data by using ```subscribe```.

**Example Root component:**
```JavaScript
import { Connector } from 'horizon-react';
import TodoList from './components/TodoList';

const App = () => (
  <TodoList />
);

// you can either use the default options and just pass a component:
export Connector(App);

// or you can pass an options object which will be passed directly to the Horizon client
export Connector({ secure: true }, App);
```

**Example Subscribed component:**
```JavaScript
import { subscribe } from 'horizon-react';
import Todo from './Todo';

// simple subscription to the collection "todos"
const mapData = (props) => ({
  todos: { collection: 'todos', query: {} }
});

const TodoList = (props) => (
  <ul>
    {props.todos.map( todo => <Todo {...todo} /> )}
  </ul>
);

export default subscribe(mapData)(TodoList)
```


**Advanced Subscribed component:**
```JavaScript
import { subscribe } from 'horizon-react';
import Todo from './Todo';

// simple subscription to the collection "todos"
const mapData = [
  {
    name: 'limitedTodos',
    query: (hz, props) => {
      // build your horizon query here!
      return hz('todos').limit(props.limit);
    }
  }
];

const TodoList = (props) => (
  <ul>
    {props.limitedTodos.map( todo => <Todo {...todo} /> )}
  </ul>
);

export default subscribe(mapData)(TodoList)
```

### FAQ
#### Can I access the Horizon instance in the child components?
Yes, you can either directly use ```context``` to access .horizon or just use ```subscribe()(MyComponent)```. ```subscribe``` will pass the Horizon instance from the context down to your component as a prop ```horizon```.

**Example:**
```JavaScript
import { subscribe } from 'horizon-react';

const AddTodoButton = (props) => (
  <button onClick={() => {
    props.horizon('todos').store({ text: 'A new todo item.' });
  }}>
    Add a todo item.
  </button>
);

export default subscribe()(AddTodoButton);
```

### Contributing

Pull Requests are very welcome!

If you find any issues, please report them via [Github Issues](https://github.com/flipace/horizon-react/issues)!

### License
(MIT)
