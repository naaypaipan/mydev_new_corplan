import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import rootReducer from './reducers';

export default function configureStore() {
  let middlewares;
  if (process.env.NODE_ENV === 'production') {
    middlewares = [thunkMiddleware]; // logger must be the last middleware in chain
  } else {
    middlewares = [thunkMiddleware, logger]; // logger must be the last middleware in chain
  }

  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = [middlewareEnhancer];
  const composedEnhancers = compose(...enhancers);

  const store = createStore(rootReducer, composedEnhancers);

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducers', () => store.replaceReducer(rootReducer));
  }

  return store;
}
