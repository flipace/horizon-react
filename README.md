[![npm version](https://badge.fury.io/js/horizon-react.svg)](https://badge.fury.io/js/horizon-react)
[![GitHub issues](https://img.shields.io/github/issues/flipace/horizon-react.svg)](https://github.com/flipace/horizon-react/issues)

[![bitHound Overall Score](https://www.bithound.io/github/flipace/horizon-react/badges/score.svg)](https://www.bithound.io/github/flipace/horizon-react)
[![bitHound Dependencies](https://www.bithound.io/github/flipace/horizon-react/badges/dependencies.svg)](https://www.bithound.io/github/flipace/horizon-react/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/flipace/horizon-react/badges/code.svg)](https://www.bithound.io/github/flipace/horizon-react)
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
import store from './store';
import TodoList from './components/TodoList';

// If you don't pass a horizon client instance, Connector will
// automatically create one for you
export default () => (
  <Connector store={store}>
    <TodoList />
  </Connector>
);

// if you pass a horizon client instance, you have to .connect() before
// you pass the instance to Connector
export default () => (
  <Connector store={store} horizon={horizon}>
    <TodoList />
  </Connector>
);
```

**Example Subscribed component:**
```JavaScript
import { subscribe } from 'horizon-react';
import Todo from './Todo';

// simple subscription to the collection "todos"
const mapDataToProps = {
  todos: (hz) => hz('todos')
};

const TodoList = (props) => (
  <ul>
    {props.todos.map( todo => <Todo {...todo} /> )}
  </ul>
);

export default subscribe({
  mapDataToProps
})(TodoList)
```


**Advanced Subscribed component:**
```JavaScript
import { subscribe } from 'horizon-react';
import Todo from './Todo';

// simple subscription to the collection "todos"
const mapDataToProps = {
  todos: (hz, props) => hz('todos').limit(props.limit)
};

// you can connect to redux state too
const mapStateToProps = (state, props) => ({
  ui: state.checkedTodos
});

// and also map dispatch
const mapDispatchToProps = (dispatch) => ({
  onClickTodo: (todo) => dispatch({type: 'TOGGLE_TODO', payload: {...todo}})
});

const TodoList = (props) => (
  <ul>
    {props.todos.map( todo => <Todo {...todo} /> )}
  </ul>
);

export default subscribe({
  mapDataToProps,
  mapStateToProps,
  mapDispatchToProps
})(TodoList)
```

### FAQ
#### Does this work with React Native?
It should! If not, please create a new [issue](https://github.com/flipace/horizon-react/issues)!

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
