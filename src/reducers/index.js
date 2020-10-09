import { todoReducer } from './TodoReducers';
import { sortDateReducer } from './SortDateReducers';
import { filterTaskReducer } from './FilterTasksReducers';
import { loadingReducer } from './LoadingReducers';
import { currentPageReducer } from './CurrentPageReducers';
import { currentFilterReducer } from './CurrentFilterReducers';

const combineReducers = (...reducers) => {
    return (state, action) => {
        for (let i = 0; i < reducers.length; i++)
            state = reducers[i](state, action)
        return state;
    }
}

const rootReducer = combineReducers(
    todoReducer,
    sortDateReducer,
    filterTaskReducer,
    loadingReducer,
    currentPageReducer,
    currentFilterReducer
);

export default rootReducer;