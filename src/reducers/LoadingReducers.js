import {
    SET_LOADING
} from '../constants/ActionTypes';

const setLoading = (state, payload) => {
    const { status } = payload;
    return {
        ...state,
        loading: status
    }
}

export function loadingReducer(state, action) {
    switch (action.type) {

        case SET_LOADING: {
            return setLoading(state, action.payload)
        }
        default:
            return state;
    }
}