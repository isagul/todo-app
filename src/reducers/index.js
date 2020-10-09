import { todoReducer } from './TodoReducers';
import { sortDateReducer } from './SortDateReducers';
import { filterTaskReducer } from './FilterTasksReducers';

const combineReducers = (...reducers) => {
    return (state, action) => {
        for (let i = 0; i < reducers.length; i++)
            state = reducers[i](state, action)
        return state;
    }
}

const rootReducer = combineReducers(todoReducer, sortDateReducer, filterTaskReducer);

export default rootReducer;