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
import TodoList from './components/TodoList';

const App = () => (
  <TodoList />
);

export Connector(App);
```

**Example Subscribed component:**
```JavaScript
import { subscribe } from 'horizon-react';
import Todo from './Todo';

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

### Contributing

Pull Requests are very welcome!

If you find any issues, please report them via [Github Issues](https://github.com/flipace/horizon-react/issues)!

### License
(MIT)
