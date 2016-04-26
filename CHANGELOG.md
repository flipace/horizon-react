# Change Log

### v0.1.2
- allow passing objects with names as keys to subscribe:
```JavaScript
{
  todos: {
    query: (horizon, props) => horizon('todos').find({ ... }).limit(props.limit)
  }
}
```

### v0.1.1
- rolled back 'ready' check until https://github.com/rethinkdb/horizon/pull/286 is merged
- added .eslintrc and eslint-config-airbnb package

### v0.1.0
- added horizon utils ```createDoc``` and ```deleteDoc```
- using horizon constants which hopefully will be merged into master ([PR #286](https://github.com/rethinkdb/horizon/pull/286))
- optimized ```subscribe``` enhancer
  - now accepts either an object with collection + query definitions or an array of objects like:

```JavaScript
{
  query: (horizon, props) => horizon('todos').find({ ... }).limit(props.limit),
  name: 'todos'
}
```
- fixes issue which prevented errors from being logged due to observables swallowing them
- ```Connector``` now uses "ready" state of horizon collection to determine whether app should be rendered or not
- ```Connector``` allows to pass or omit horizon props object
