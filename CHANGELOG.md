# Change Log

### v0.3.0
- updated to *horizon/client@1.0.1* #celebrate! https://horizon.io
- updated ready status indicator code and removed timeout
- added imports- and exports-loader until pr is merged
- fixes an issue which prevented <Connector /> from working in React Native (due to span element)

### v0.2.0
- added redux to ```subscribe``` with one function to state and data, connector is now a HOC instead of a wrapper function
- re-use existing queries if query didn't Change
- improved subscription query building
- ```horizon``` client can now be passed as ```horizon``` prop to ```Connector``` in order to define the client outside.
- always return an array - even if there's just one document
- fixes issue with old props being used in subscriptions on update

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
