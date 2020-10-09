import {
    SET_CURRENT_PAGE
} from '../constants/ActionTypes';

const setCurrentPage = (state, payload) => {
    const { value } = payload;
    return {
        ...state,
        currentPage: value
    }
}

export function currentPageReducer(state, action) {
    switch (action.type) {

        case SET_CURRENT_PAGE: {
            return setCurrentPage(state, action.payload)
        }
        default:
            return state;
    }
}