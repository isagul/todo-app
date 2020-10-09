import { 
    SET_LOADING
} from '../constants/ActionTypes';

export const setLoading = (status, dispatch) => {
    dispatch({
        type: SET_LOADING,
        payload: status,
    })
};