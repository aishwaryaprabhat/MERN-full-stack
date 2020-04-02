import {
    REGISTER_SUCCESS, REGISTER_FAIL
} from '../actions/types'

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null, //to show stuff only logged in users can see
    loading: true, //when req is successful we change to false
    user: null

}

export default function(state=initialState, action) {
    const {type, payload} = action;

    switch(type){
        case REGISTER_SUCCESS:
            localStorage.setItem('token', payload.token)
            return {
                ...state,
                ...payload,
                isAuthenticated:true,
                loading:false
            }
        case REGISTER_FAIL:
            localStorage.removeItem('token');
            return {
                ...state,
                token:null,
                isAuthenticated:false,
                loading:false
            }
        default:
            return state;
    }
}