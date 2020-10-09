import {
    SET_CURRENT_FILTER
} from '../constants/ActionTypes';

const setCurrentFilter = (state, payload) => {
    const { value } = payload;
    return {
        ...state,
        currentFilter: value
    }
}

export function currentFilterReducer(state, action) {
    switch (action.type) {

        case SET_CURRENT_FILTER: {
            return setCurrentFilter(state, action.payload)
        }
        default:
            return state;
    }
}